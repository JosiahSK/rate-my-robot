import React, { useState, useEffect } from 'react';
import { getGallery } from '../utils/api';
import RobotCard from '../components/RobotCard';
import { Link } from 'react-router-dom';
import { Trophy, Plus, AlertTriangle, RefreshCw } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'score',  label: 'Highest Score' },
  { value: 'votes',  label: 'Most Voted' },
];

export default function Gallery() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const [error, setError] = useState(null);

  const load = (sort) => {
    setLoading(true);
    getGallery(sort, 50)
      .then(d => { setEntries(d.entries || []); setError(null); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(sortBy); }, [sortBy]);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="section-title">Gallery & Leaderboard</h1>
            <p className="text-gray-400">Community robot ratings. Vote for your favorites.</p>
          </div>
          <Link to="/rate" className="btn-primary text-sm flex-shrink-0 flex items-center gap-1.5" id="gallery-rate-btn">
            <Plus size={15} /> Rate Your Robot
          </Link>
        </div>

        {/* Sort tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                sortBy === opt.value
                  ? 'bg-cyber-500/20 text-cyber-400 border-cyber-500/50'
                  : 'bg-dark-700 text-gray-400 hover:text-white border-dark-600 hover:border-dark-400'
              }`}
              id={`sort-${opt.value}-btn`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Top-3 podium */}
        {sortBy === 'score' && !loading && entries.length >= 3 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {entries.slice(0, 3).map((e, i) => (
              <div
                key={e.id || i}
                className={`glass-card p-6 text-center border-2 ${
                  i === 0 ? 'border-yellow-500/60 bg-yellow-500/5 shadow-[0_0_30px_rgba(234,179,8,0.1)]' :
                  i === 1 ? 'border-gray-400/40 bg-gray-500/5' :
                            'border-orange-700/40 bg-orange-900/5'
                }`}
              >
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                  {['1st Place', '2nd Place', '3rd Place'][i]}
                </p>
                <div className="text-3xl font-black text-white">{e.overall_score}<span className="text-gray-500 text-lg">/100</span></div>
                <div className="text-sm font-semibold text-gray-300 mt-1">{e.robot_personality}</div>
                <div className="text-xs text-gray-500 mt-1 line-clamp-2 italic">"{e.one_liner}"</div>
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="glass-card h-64 animate-pulse" />)}
          </div>
        ) : error ? (
          <div className="glass-card p-10 text-center">
            <AlertTriangle size={36} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">{error}</p>
            <button onClick={() => load(sortBy)} className="btn-secondary text-sm flex items-center gap-2 mx-auto">
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        ) : entries.length === 0 ? (
          <div className="glass-card p-14 text-center">
            <Trophy size={48} className="text-dark-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No robots yet</h2>
            <p className="text-gray-400 mb-6">Be the first to submit your build to the community gallery.</p>
            <Link to="/rate" className="btn-primary">Rate My Robot</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {entries.map((entry, i) => (
              <RobotCard
                key={entry.id || i}
                entry={entry}
                rank={sortBy === 'score' ? i + 1 : null}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
