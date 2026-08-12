import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Trophy, Gamepad2, Flame, Clock, ArrowRight } from 'lucide-react';
import { getGallery } from '../utils/api';

const WEEKLY_THEME = {
  title: 'Smallest Robot',
  desc: "This week's challenge: build the tiniest functional robot you can and submit it.",
  ends: new Date(Date.now() + 5 * 86400000),
};

const FEATURES = [
  { Icon: Cpu,      title: 'AI-Powered Rating',   desc: 'Upload any robot photo and get an instant score across 4 categories from a witty Gemini AI judge.' },
  { Icon: Trophy,   title: 'Community Gallery',   desc: 'Browse and vote on robots from makers worldwide. Filter by score, date, or community votes.' },
  { Icon: Gamepad2, title: 'Mini-Games',          desc: 'Test your knowledge with Guess the Sensor and Debug-a-Bot — timed, scored, addictive.' },
  { Icon: Flame,    title: 'Streaks & Badges',    desc: 'Earn daily streaks and unlock badges the more you contribute and play.' },
];

function CountdownTimer({ end }) {
  const [label, setLabel] = useState('');
  useEffect(() => {
    const tick = () => {
      const diff = end - Date.now();
      if (diff <= 0) { setLabel('Ended'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setLabel(`${d}d ${h}h ${m}m`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [end]);
  return <span className="font-bold text-cyber-400">{label}</span>;
}

function RecentFeed({ entries }) {
  if (!entries.length) return null;
  return (
    <div className="flex gap-4 overflow-x-auto pb-3 no-scrollbar">
      {entries.map((e, i) => (
        <div key={e.id || i} className="flex-shrink-0 w-44 glass-card overflow-hidden group cursor-pointer hover:border-cyber-500/40 transition-all">
          <div className="relative h-28 bg-dark-700">
            {e.imageUrl ? (
              <img src={e.imageUrl} alt="robot" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-2xl font-black text-dark-500 tracking-widest">BOT</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
            <span className="absolute bottom-2 left-2 text-cyber-400 font-black text-sm">{e.overall_score}/100</span>
          </div>
          <div className="p-2">
            <p className="text-xs font-semibold text-white truncate">{e.robot_personality}</p>
            <p className="text-xs text-gray-500 truncate italic">"{e.one_liner?.slice(0, 38)}..."</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [recentRobots, setRecentRobots] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);

  useEffect(() => {
    getGallery('recent', 12)
      .then(d => setRecentRobots(d.entries || []))
      .catch(() => setRecentRobots([]))
      .finally(() => setFeedLoading(false));
  }, []);

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyber-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-neon-purple/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyber-500/10 border border-cyber-500/30 rounded-full text-cyber-400 text-sm font-medium mb-6 animate-fade-up">
            <Cpu size={14} />
            AI-powered robotics judge — free and open to all makers
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Rate My<span className="text-gradient block">Robot</span>
          </h1>

          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Upload your robot, circuit board, or embedded build.
            Get an instant AI verdict, score breakdown, and join the maker community leaderboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/rate" className="btn-primary text-lg px-8 py-4 flex items-center gap-2 justify-center" id="hero-rate-btn">
              Rate My Robot
            </Link>
            <Link to="/gallery" className="btn-secondary text-lg px-8 py-4 flex items-center gap-2 justify-center">
              <Trophy size={18} /> View Leaderboard
            </Link>
          </div>

          <div className="flex justify-center gap-10 mt-12 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            {[{ n: '1,500+', sub: 'AI ratings/day' }, { n: '4', sub: 'Score categories' }, { n: '8', sub: 'Earnable badges' }].map(s => (
              <div key={s.sub} className="text-center">
                <div className="text-2xl font-black text-white">{s.n}</div>
                <div className="text-xs text-gray-500">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-gentle">
          <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-cyber-500 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Weekly Theme Banner */}
      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card p-6 border-cyber-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-500/10 rounded-full blur-2xl" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyber-500/20 border border-cyber-500/30 flex items-center justify-center flex-shrink-0">
                  <Trophy size={22} className="text-cyber-400" />
                </div>
                <div>
                  <span className="badge-pill mb-2 inline-block">Weekly Challenge</span>
                  <h2 className="text-xl font-bold text-white">{WEEKLY_THEME.title}</h2>
                  <p className="text-gray-400 text-sm">{WEEKLY_THEME.desc}</p>
                </div>
              </div>
              <div className="text-center flex-shrink-0">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1 justify-center">
                  <Clock size={11} /> Ends in
                </div>
                <CountdownTimer end={WEEKLY_THEME.ends} />
                <Link to="/rate" className="btn-primary mt-3 text-sm px-4 py-2 block text-center">
                  Submit Entry
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Feed */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">Live Feed</h2>
              <p className="text-gray-500 text-sm">Latest ratings from the community</p>
            </div>
            <Link to="/gallery" className="btn-secondary text-sm px-4 py-2 flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {feedLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-3">
              {[...Array(6)].map((_, i) => <div key={i} className="flex-shrink-0 w-44 h-48 glass-card animate-pulse" />)}
            </div>
          ) : recentRobots.length > 0 ? (
            <RecentFeed entries={recentRobots} />
          ) : (
            <div className="glass-card p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-cyber-500/10 border border-cyber-500/20 flex items-center justify-center mx-auto mb-4">
                <Cpu size={28} className="text-cyber-600" />
              </div>
              <p className="text-gray-400 mb-4">No robots rated yet — be the first!</p>
              <Link to="/rate" className="btn-primary">Rate My Robot</Link>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">Everything a Maker Needs</h2>
            <p className="text-gray-500">Built for tinkerers, by tinkerers</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ Icon, title, desc }, i) => (
              <div key={title} className="glass-card-hover p-6 text-center animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-12 h-12 rounded-xl bg-cyber-500/15 border border-cyber-500/20 flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} className="text-cyber-400" />
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card p-12 holo-card">
            <div className="w-16 h-16 rounded-2xl bg-cyber-500/20 border border-cyber-500/30 flex items-center justify-center mx-auto mb-6">
              <Cpu size={30} className="text-cyber-400" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4">
              Ready to get <span className="text-gradient">roasted</span>?
            </h2>
            <p className="text-gray-400 mb-8">Upload a photo of your robot and let our AI judge deliver the verdict. Free, instant, and (mostly) encouraging.</p>
            <Link to="/rate" className="btn-primary text-lg px-10 py-4" id="bottom-cta-btn">
              Rate My Robot — It's Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
