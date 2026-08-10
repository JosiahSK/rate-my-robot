import React, { useEffect, useState } from 'react';
import { getProfile, ALL_BADGES } from '../utils/profile';
import { scoreColor } from '../utils/api';
import { Link } from 'react-router-dom';

export default function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => { setProfile(getProfile()); }, []);

  if (!profile) return null;

  const earnedIds = profile.badges || [];
  const uploads   = profile.uploads || [];
  const avgScore  = uploads.length
    ? Math.round(uploads.reduce((a, u) => a + (u.overall_score || 0), 0) / uploads.length)
    : null;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="section-title">👤 Your Profile</h1>
          <p className="text-gray-600 text-xs font-mono mt-1">ID: {profile.deviceId}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { v: uploads.length,           label: 'Robots Rated', emoji: '🤖' },
            { v: `${profile.streak || 0}d`, label: 'Streak',        emoji: '🔥' },
            { v: avgScore ?? '—',           label: 'Avg Score',     emoji: '⭐' },
            { v: earnedIds.length,          label: 'Badges',        emoji: '🏅' },
          ].map(s => (
            <div key={s.label} className="glass-card p-4 text-center">
              <div className="text-2xl mb-1">{s.emoji}</div>
              <div className="text-2xl font-black text-white">{s.v}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">🏅 Badges</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ALL_BADGES.map(badge => {
              const earned = earnedIds.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`p-3 rounded-xl text-center border transition-all ${
                    earned
                      ? 'bg-cyber-900/40 border-cyber-700/50 text-cyber-300'
                      : 'bg-dark-700/30 border-dark-600/40 text-gray-600 opacity-50'
                  }`}
                  title={badge.desc}
                >
                  <div className={`text-3xl mb-1 ${!earned ? 'grayscale opacity-40' : ''}`}>{badge.emoji}</div>
                  <div className="text-xs font-semibold leading-tight">{badge.name}</div>
                  <div className="text-xs mt-1 opacity-60 leading-tight">{badge.desc}</div>
                  {earned && <div className="badge-pill mt-2 justify-center w-full">Earned ✓</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upload history */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-white mb-4">📸 Upload History</h2>
          {uploads.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">🤖</div>
              <p className="text-gray-400 mb-4">No uploads yet — get your first robot rated!</p>
              <Link to="/rate" className="btn-primary" id="profile-rate-btn">Rate My First Robot →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {uploads.slice(0, 15).map((u, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-dark-700/40 rounded-xl hover:bg-dark-700/60 transition-all">
                  {u.imageUrl ? (
                    <img src={u.imageUrl} alt="robot" className="w-12 h-12 object-cover rounded-lg flex-shrink-0 ring-1 ring-white/10" />
                  ) : (
                    <div className="w-12 h-12 bg-dark-600 rounded-lg flex items-center justify-center text-xl flex-shrink-0">🤖</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm truncate">{u.robot_personality}</div>
                    <div className="text-xs text-gray-500 truncate italic">"{u.one_liner}"</div>
                    {u.ratedAt && (
                      <div className="text-xs text-gray-600 mt-0.5">{new Date(u.ratedAt).toLocaleDateString()}</div>
                    )}
                  </div>
                  <div className={`font-black text-xl flex-shrink-0 tabular-nums ${scoreColor(u.overall_score)}`}>
                    {u.overall_score}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
