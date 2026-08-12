import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Cpu, Trophy, Gamepad2, User, Info, Flame, ChevronRight } from 'lucide-react';
import { getProfile } from '../utils/profile';

const NAV_LINKS = [
  { to: '/',        label: 'Home',         Icon: Home },
  { to: '/rate',    label: 'Rate My Robot',Icon: Cpu },
  { to: '/gallery', label: 'Gallery',      Icon: Trophy },
  { to: '/games',   label: 'Mini-Games',   Icon: Gamepad2 },
  { to: '/profile', label: 'Profile',      Icon: User },
  { to: '/about',   label: 'About',        Icon: Info },
];

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setProfile(getProfile());
    setMenuOpen(false);
  }, [location]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-dark-900/90 backdrop-blur-lg nav-glow' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-cyber-500/20 border border-cyber-500/50 flex items-center justify-center
                           group-hover:bg-cyber-500/30 group-hover:border-cyber-400 transition-all duration-200">
              <Cpu size={18} className="text-cyber-400" />
            </div>
            <span className="font-bold text-lg text-white group-hover:text-gradient transition-all duration-200 hidden sm:block">
              Rate My Robot
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === to
                    ? 'bg-cyber-500/20 text-cyber-400 border border-cyber-500/40'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={14} />
                {label}
              </Link>
            ))}
          </div>

          {/* Streak + CTA */}
          <div className="hidden md:flex items-center gap-3">
            {profile && profile.streak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/30 rounded-full">
                <Flame size={13} className="text-orange-400" />
                <span className="text-xs font-bold text-orange-400">{profile.streak}d streak</span>
              </div>
            )}
            <Link to="/rate" className="btn-primary text-sm px-4 py-2">
              Rate a Robot
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            id="mobile-menu-btn"
          >
            <div className={`w-5 h-0.5 bg-current mb-1.5 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <div className={`w-5 h-0.5 bg-current mb-1.5 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <div className={`w-5 h-0.5 bg-current transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-dark-800/95 backdrop-blur-lg border-t border-white/5">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map(({ to, label, Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === to
                    ? 'bg-cyber-500/20 text-cyber-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
            <Link to="/rate" className="btn-primary w-full text-center mt-2 block">
              Rate a Robot
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
