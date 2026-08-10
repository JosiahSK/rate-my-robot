import React from 'react';
import { Link } from 'react-router-dom';

const STACK = [
  { label: 'Frontend',  value: 'React + Vite + Tailwind CSS' },
  { label: 'Hosting',   value: 'GitHub Pages (free tier)' },
  { label: 'AI Model',  value: 'Google Gemini 2.5 Flash' },
  { label: 'AI Proxy',  value: 'Cloudflare Workers' },
  { label: 'Storage',   value: 'Cloudflare KV' },
  { label: 'CI/CD',     value: 'GitHub Actions' },
  { label: 'Cost',      value: '100% Free Tier 🎉' },
];

export default function About() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="section-title">
            <span className="text-gradient">About Rate My Robot</span>
          </h1>
          <p className="text-gray-400 text-lg">A love letter to makers, tinkerers, and chaotic-wiring enthusiasts.</p>
        </div>

        <div className="space-y-5">
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-white mb-3">🤖 What is this?</h2>
            <p className="text-gray-400 leading-relaxed">
              Rate My Robot is a community platform for robotics and embedded-systems enthusiasts.
              Upload a photo of your robot, circuit board, or any embedded build — and our AI judge
              (powered by Google Gemini 2.5 Flash) will score it across four categories:
              Wiring Chaos, Structural Confidence, Sci-Fi Factor, and Overall Score.
              You'll also get a witty roast or compliment, and a genuine constructive tip.
            </p>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-white mb-3">🧠 How does the AI scoring work?</h2>
            <p className="text-gray-400 leading-relaxed">
              We send your image to Google Gemini with a carefully crafted prompt that instructs
              it to act as a witty robotics judge. It responds with structured JSON — scores,
              a funny robot personality archetype, a one-liner roast or compliment, and a
              constructive tip. The AI is explicitly instructed to always be encouraging,
              especially towards beginners, while still being genuinely funny.
            </p>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-white mb-3">🔒 Privacy & Data</h2>
            <p className="text-gray-400 leading-relaxed">
              No account required. You're identified by a random device ID stored in your browser's
              localStorage — it never leaves your device except as an anonymous tag on gallery
              submissions. Profile data (streaks, badges, upload history) lives entirely in your
              browser. Images submitted to the public gallery are stored on Cloudflare infrastructure.
              No tracking pixels, no ad networks, no data brokers.
            </p>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-white mb-4">🛠️ Tech Stack</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STACK.map(item => (
                <div key={item.label} className="bg-dark-700/50 rounded-xl p-3.5 border border-dark-500/40">
                  <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                  <div className="text-sm font-semibold text-white">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-8 text-center holo-card">
            <div className="text-4xl mb-3">❤️</div>
            <p className="text-gray-300 leading-relaxed">
              Built with genuine love for the maker community.
              Go build something weird, wonderful, and slightly dangerous.
            </p>
            <Link to="/rate" className="btn-primary mt-5 inline-block" id="about-cta-btn">
              Rate My Robot →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
