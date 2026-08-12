import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { voteOnRobot, scoreColor } from '../utils/api';

export default function RobotCard({ entry, rank }) {
  const storedVotes = JSON.parse(localStorage.getItem('rmr_votes') || '{}');
  const [votes, setVotes] = useState(entry.votes || 0);
  const [voted, setVoted] = useState(storedVotes[entry.id] || null);
  const [voting, setVoting] = useState(false);

  const handleVote = async (direction) => {
    if (voted || voting) return;
    setVoting(true);
    try {
      const result = await voteOnRobot(entry.id, direction);
      setVotes(result.votes ?? votes + (direction === 'up' ? 1 : -1));
      setVoted(direction);
      const stored = JSON.parse(localStorage.getItem('rmr_votes') || '{}');
      stored[entry.id] = direction;
      localStorage.setItem('rmr_votes', JSON.stringify(stored));
    } catch {
      setVotes(v => v + (direction === 'up' ? 1 : -1));
      setVoted(direction);
    } finally {
      setVoting(false);
    }
  };

  const rankLabel =
    rank === 1 ? '1st' :
    rank === 2 ? '2nd' :
    rank === 3 ? '3rd' :
    rank ? `#${rank}` : null;

  return (
    <div className="glass-card-hover overflow-hidden group flex flex-col">
      {/* Image */}
      <div className="relative aspect-video bg-dark-700 overflow-hidden flex-shrink-0">
        {entry.imageUrl ? (
          <img
            src={entry.imageUrl}
            alt={entry.robot_personality || 'Robot'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-700 to-dark-800">
            <span className="text-3xl font-bold text-dark-500 tracking-widest">BOT</span>
          </div>
        )}
        {rankLabel && (
          <div className="absolute top-2 left-2 bg-dark-900/80 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-white">
            {rankLabel}
          </div>
        )}
        <div className={`absolute top-2 right-2 bg-dark-900/80 backdrop-blur-sm px-2.5 py-1 rounded-lg font-black text-sm ${scoreColor(entry.overall_score)}`}>
          {entry.overall_score}/100
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-white mb-1 leading-tight">{entry.robot_personality}</h3>
        <p className="text-gray-400 text-xs italic mb-3 line-clamp-2 flex-1">"{entry.one_liner}"</p>

        {/* Mini sub-scores */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {[
            { label: 'Wiring',    value: entry.wiring_chaos_score },
            { label: 'Structure', value: entry.structural_confidence_score },
            { label: 'Sci-Fi',    value: entry.sci_fi_factor_score },
          ].map(s => (
            <div key={s.label} className="text-center bg-dark-700/50 rounded-lg p-1.5">
              <div className="text-xs text-gray-500">{s.label}</div>
              <div className={`text-xs font-bold tabular-nums ${scoreColor(s.value)}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Voting */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleVote('up')}
              disabled={!!voted || voting}
              aria-label="Upvote"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                voted === 'up'
                  ? 'bg-cyber-500/30 text-cyber-400 border border-cyber-500/50'
                  : 'bg-dark-700 text-gray-400 hover:text-cyber-400 hover:bg-cyber-500/10 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              <ThumbsUp size={13} />
              <span className="tabular-nums">{votes > 0 ? votes : ''}</span>
            </button>
            <button
              onClick={() => handleVote('down')}
              disabled={!!voted || voting}
              aria-label="Downvote"
              className={`px-2.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                voted === 'down'
                  ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/40'
                  : 'bg-dark-700 text-gray-400 hover:text-neon-pink hover:bg-neon-pink/10 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              <ThumbsDown size={13} />
            </button>
          </div>
          <span className="text-xs text-gray-600">
            {entry.submittedAt ? new Date(entry.submittedAt).toLocaleDateString() : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
