/**
 * Rate My Robot — Cloudflare Worker
 * Proxies image → Gemini 2.5 Flash for AI scoring
 * Manages gallery entries via Cloudflare KV
 *
 * Secrets (set via `wrangler secret put`):
 *   GEMINI_API_KEY  — Google AI Studio API key
 *
 * KV Namespaces (bound in wrangler.toml):
 *   GALLERY  — stores gallery entries
 */

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_BASE  = 'https://generativelanguage.googleapis.com/v1beta/models';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ── Gemini prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a witty robotics judge. Given an image of a robot, circuit, or embedded-systems build, respond ONLY in valid JSON with exactly these fields:
{
  "wiring_chaos_score": <integer 0-100>,
  "structural_confidence_score": <integer 0-100>,
  "sci_fi_factor_score": <integer 0-100>,
  "overall_score": <integer 0-100>,
  "robot_personality": "<short funny archetype name, e.g. 'Anxious Overachiever' or 'Caffeinated Chaos Goblin'>",
  "one_liner": "<witty PG-rated roast or compliment, max 20 words>",
  "constructive_tip": "<one genuinely useful piece of feedback for improvement>"
}

Scoring guide:
- wiring_chaos_score: 0=perfectly organised, 100=spaghetti nightmare
- structural_confidence_score: 0=falling apart, 100=tank-like build quality
- sci_fi_factor_score: 0=a bread toaster, 100=straight from a sci-fi film
- overall_score: holistic score considering all factors plus creativity and ambition

Rules:
- Keep tone playful, encouraging, and never mean-spirited or discouraging to beginners
- robot_personality should be a 2-4 word archetype (never rude or offensive)
- one_liner must be <= 20 words, punchy and fun
- constructive_tip must be practical and specific to what you actually see
- ONLY return valid JSON, no markdown code fences, no extra text`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function error(msg, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── Rate robot via Gemini ─────────────────────────────────────────────────────
async function handleRate(request, env) {
  let imageBase64, mimeType;

  const contentType = request.headers.get('Content-Type') || '';

  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    const file = form.get('image');
    if (!file) return error('No image provided');
    const buf = await file.arrayBuffer();
    imageBase64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
    mimeType = file.type || 'image/jpeg';
  } else if (contentType.includes('application/json')) {
    const body = await request.json();
    imageBase64 = body.imageBase64;
    mimeType = body.mimeType || 'image/jpeg';
    if (!imageBase64) return error('No imageBase64 provided');
  } else {
    return error('Unsupported content type');
  }

  const geminiPayload = {
    contents: [
      {
        parts: [
          { text: SYSTEM_PROMPT },
          { inline_data: { mime_type: mimeType, data: imageBase64 } },
        ],
      },
    ],
    generationConfig: {
      response_mime_type: 'application/json',
      temperature: 1.2,
      maxOutputTokens: 512,
    },
  };

  const geminiRes = await fetch(
    `${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload),
    }
  );

  if (!geminiRes.ok) {
    const errText = await geminiRes.text();
    console.error('Gemini error:', errText);
    return error(`Gemini API error: ${geminiRes.status}`, 502);
  }

  const geminiData = await geminiRes.json();
  const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) return error('Empty response from Gemini', 502);

  let parsed;
  try {
    // Strip any accidental markdown fences
    const cleaned = rawText.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.error('JSON parse error:', rawText);
    return error('Failed to parse AI response', 502);
  }

  // Validate required fields
  const required = ['wiring_chaos_score', 'structural_confidence_score', 'sci_fi_factor_score', 'overall_score', 'robot_personality', 'one_liner', 'constructive_tip'];
  for (const field of required) {
    if (parsed[field] === undefined) return error(`Missing field: ${field}`, 502);
  }

  // Clamp scores
  for (const field of ['wiring_chaos_score', 'structural_confidence_score', 'sci_fi_factor_score', 'overall_score']) {
    parsed[field] = Math.max(0, Math.min(100, Math.round(Number(parsed[field]) || 0)));
  }

  return json(parsed);
}

// ── Gallery ───────────────────────────────────────────────────────────────────
async function handleGalleryGet(url, env) {
  const sort  = url.searchParams.get('sort') || 'recent';
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

  // Fetch all entry IDs from the index
  const indexRaw = await env.GALLERY.get('__index__');
  const index = indexRaw ? JSON.parse(indexRaw) : [];

  if (index.length === 0) return json({ entries: [] });

  // Fetch entries (batch, limited)
  const ids = index.slice(0, 200); // cap at 200 stored
  const entries = (await Promise.all(
    ids.map(id => env.GALLERY.get(`entry:${id}`).then(v => v ? JSON.parse(v) : null))
  )).filter(Boolean);

  // Sort
  if (sort === 'score') {
    entries.sort((a, b) => b.overall_score - a.overall_score);
  } else if (sort === 'votes') {
    entries.sort((a, b) => (b.votes || 0) - (a.votes || 0));
  } else {
    entries.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  }

  return json({ entries: entries.slice(0, limit) });
}

async function handleGalleryPost(request, env) {
  const body = await request.json();
  const id = generateId();
  const entry = {
    id,
    wiring_chaos_score:          body.wiring_chaos_score,
    structural_confidence_score: body.structural_confidence_score,
    sci_fi_factor_score:         body.sci_fi_factor_score,
    overall_score:               body.overall_score,
    robot_personality:           body.robot_personality,
    one_liner:                   body.one_liner,
    constructive_tip:            body.constructive_tip,
    imageUrl:                    body.imageUrl || null,
    submittedAt:                 body.submittedAt || new Date().toISOString(),
    deviceId:                    body.deviceId || 'anon',
    votes:                       0,
    voterIds:                    [],
  };

  await env.GALLERY.put(`entry:${id}`, JSON.stringify(entry), { expirationTtl: 60 * 60 * 24 * 90 }); // 90 days

  // Update index
  const indexRaw = await env.GALLERY.get('__index__');
  const index = indexRaw ? JSON.parse(indexRaw) : [];
  index.unshift(id);
  await env.GALLERY.put('__index__', JSON.stringify(index.slice(0, 500)));

  return json({ id, success: true });
}

async function handleVote(entryId, request, env) {
  const body     = await request.json();
  const direction = body.direction; // 'up' | 'down'
  const deviceId  = body.deviceId || 'anon';

  if (!['up', 'down'].includes(direction)) return error('Invalid direction');

  const raw = await env.GALLERY.get(`entry:${entryId}`);
  if (!raw) return error('Entry not found', 404);

  const entry = JSON.parse(raw);
  const voterIds = entry.voterIds || [];

  if (voterIds.includes(deviceId)) {
    return error('Already voted', 409);
  }

  entry.votes = (entry.votes || 0) + (direction === 'up' ? 1 : -1);
  entry.voterIds = [...voterIds, deviceId].slice(-1000);

  await env.GALLERY.put(`entry:${entryId}`, JSON.stringify(entry));
  return json({ votes: entry.votes });
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
async function handleLeaderboard(env) {
  const indexRaw = await env.GALLERY.get('__index__');
  const index = indexRaw ? JSON.parse(indexRaw) : [];
  const entries = (await Promise.all(
    index.slice(0, 200).map(id => env.GALLERY.get(`entry:${id}`).then(v => v ? JSON.parse(v) : null))
  )).filter(Boolean);
  entries.sort((a, b) => b.overall_score - a.overall_score);
  return json({ leaderboard: entries.slice(0, 20) });
}

// ── Main fetch handler ────────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // POST /rate
      if (path === '/rate' && request.method === 'POST') {
        return await handleRate(request, env);
      }

      // GET /gallery
      if (path === '/gallery' && request.method === 'GET') {
        return await handleGalleryGet(url, env);
      }

      // POST /gallery
      if (path === '/gallery' && request.method === 'POST') {
        return await handleGalleryPost(request, env);
      }

      // POST /gallery/:id/vote
      const voteMatch = path.match(/^\/gallery\/([^/]+)\/vote$/);
      if (voteMatch && request.method === 'POST') {
        return await handleVote(voteMatch[1], request, env);
      }

      // GET /leaderboard
      if (path === '/leaderboard' && request.method === 'GET') {
        return await handleLeaderboard(env);
      }

      // Health check
      if (path === '/' || path === '/health') {
        return json({ status: 'ok', model: GEMINI_MODEL });
      }

      return error('Not found', 404);
    } catch (err) {
      console.error('Worker error:', err);
      return error('Internal server error', 500);
    }
  },
};
