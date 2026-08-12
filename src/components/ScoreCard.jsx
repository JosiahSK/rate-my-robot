import React, { useEffect, useState } from 'react';
import { Lightbulb, Share2, Flag } from 'lucide-react';
import { scoreGradient, scoreColor } from '../utils/api';

const METRICS = [
  { key: 'wiring_chaos_score',          label: 'Wiring Chaos',          symbol: '~' },
  { key: 'structural_confidence_score', label: 'Structural Confidence', symbol: '#' },
  { key: 'sci_fi_factor_score',         label: 'Sci-Fi Factor',         symbol: '*' },
];

function AnimatedMeter({ value, gradient, delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <div className="score-meter-track">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-1000 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

function AnimatedNumber({ target, delay = 0 }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    let start = null;
    const duration = 1400;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    const t = setTimeout(() => requestAnimationFrame(step), delay);
    return () => clearTimeout(t);
  }, [target, delay]);
  return <span>{current}</span>;
}

export default function ScoreCard({ result, onSubmitToGallery }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  if (!result) return null;

  const shareText = `My robot scored ${result.overall_score}/100 — "${result.one_liner}"\nhttps://josiahsk.github.io/rate-my-robot/`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Rate My Robot', text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Result copied to clipboard!');
    }
  };

  const handleChallenge = () => {
    const text = `My robot scored ${result.overall_score}/100 — can yours beat it?\nhttps://josiahsk.github.io/rate-my-robot/`;
    if (navigator.share) {
      navigator.share({ title: 'Robot Challenge', text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Challenge link copied!');
    }
  };

  return (
    <div className={`space-y-5 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

      {/* Main result banner */}
      <div className="glass-card p-6 text-center relative overflow-hidden holo-card" id="score-result-card">
        <div className="absolute inset-0 bg-gradient-to-br from-cyber-900/20 to-dark-800/20" />
        <div className="relative z-10">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Robot Personality</p>
          <h2 className="text-2xl font-black text-gradient mb-3">{result.robot_personality}</h2>
          <p className="text-gray-300 italic text-base mb-5">"{result.one_liner}"</p>
          <div className="flex justify-center items-baseline gap-2">
            <span className={`text-7xl font-black score-reveal ${scoreColor(result.overall_score)}`}>
              <AnimatedNumber target={result.overall_score} />
            </span>
            <span className="text-gray-500 text-3xl font-bold">/100</span>
          </div>
          <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest">Overall Score</p>
        </div>
      </div>

      {/* Sub-score breakdown */}
      <div className="glass-card p-6">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Score Breakdown</h3>
        <div className="space-y-4">
          {METRICS.map((m, i) => (
            <div key={m.key}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium text-gray-300">{m.label}</span>
                <span className={`text-sm font-bold tabular-nums ${scoreColor(result[m.key])}`}>
                  <AnimatedNumber target={result[m.key]} delay={i * 200} />/100
                </span>
              </div>
              <AnimatedMeter
                value={result[m.key]}
                gradient={scoreGradient(result[m.key])}
                delay={i * 200 + 300}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Constructive tip */}
      <div className="glass-card p-5 border-l-4 border-cyber-500">
        <div className="flex gap-3">
          <Lightbulb size={20} className="text-cyber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-cyber-400 uppercase tracking-wider mb-1">Pro Tip</p>
            <p className="text-gray-300 text-sm leading-relaxed">{result.constructive_tip}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={handleShare} className="btn-primary flex items-center justify-center gap-2" id="share-result-btn">
          <Share2 size={15} /> Share Result
        </button>
        {onSubmitToGallery ? (
          <button onClick={onSubmitToGallery} className="btn-secondary flex items-center justify-center gap-2" id="submit-gallery-btn">
            Add to Gallery
          </button>
        ) : (
          <button onClick={handleChallenge} className="btn-secondary flex items-center justify-center gap-2">
            <Flag size={15} /> Challenge
          </button>
        )}
      </div>

      {/* Challenge friend */}
      <div className="text-center">
        <button
          onClick={handleChallenge}
          className="text-cyber-400 hover:text-cyber-300 font-semibold text-sm hover:underline transition-all"
          id="challenge-friend-btn"
        >
          Challenge a friend to beat your score
        </button>
      </div>
    </div>
  );
}
