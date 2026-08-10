// Cloudflare Worker URL — set this after deploying the worker
export const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'https://rate-my-robot.rate-my-robot-worker.workers.dev';

/**
 * Send an image to the Cloudflare Worker, which proxies to Gemini
 * @param {File} imageFile
 * @returns {Promise<RatingResult>}
 */
export async function rateRobot(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(`${WORKER_URL}/rate`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || `Worker error: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Submit a rating to the public gallery
 */
export async function submitToGallery(payload) {
  const response = await fetch(`${WORKER_URL}/gallery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Failed to submit to gallery');
  return response.json();
}

/**
 * Get gallery entries
 * @param {string} sortBy - 'score' | 'recent' | 'votes'
 * @param {number} limit
 */
export async function getGallery(sortBy = 'recent', limit = 50) {
  const response = await fetch(`${WORKER_URL}/gallery?sort=${sortBy}&limit=${limit}`);
  if (!response.ok) throw new Error('Failed to load gallery');
  return response.json();
}

/**
 * Vote on a gallery entry
 */
export async function voteOnRobot(entryId, direction) {
  const deviceId = localStorage.getItem('rmr_device_id') || 'anon';
  const response = await fetch(`${WORKER_URL}/gallery/${entryId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ direction, deviceId }),
  });
  if (!response.ok) throw new Error('Vote failed');
  return response.json();
}

/**
 * Get leaderboard
 */
export async function getLeaderboard() {
  const response = await fetch(`${WORKER_URL}/leaderboard`);
  if (!response.ok) throw new Error('Failed to load leaderboard');
  return response.json();
}

// Convert file to base64
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Generate a shareable image text overlay (for canvas)
export function getShareText(result) {
  return [
    `🤖 ${result.robot_personality}`,
    `Overall: ${result.overall_score}/100`,
    `"${result.one_liner}"`,
    `Rate your robot at rate-my-robot!`,
  ].join('\n');
}

// Score color helper
export function scoreColor(score) {
  if (score >= 80) return 'text-cyber-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-neon-pink';
}

export function scoreGradient(score) {
  if (score >= 80) return 'from-cyber-500 to-cyber-300';
  if (score >= 60) return 'from-yellow-500 to-yellow-300';
  if (score >= 40) return 'from-orange-500 to-orange-300';
  return 'from-neon-pink to-purple-400';
}
