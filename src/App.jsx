import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RatePage from './pages/RatePage';
import Gallery from './pages/Gallery';
import MiniGames from './pages/MiniGames';
import Profile from './pages/Profile';
import About from './pages/About';

export default function App() {
  return (
    <BrowserRouter basename="/rate-my-robot">
      <div className="min-h-screen bg-dark-900">
        <Navbar />
        <Routes>
          <Route path="/"        element={<Home />} />
          <Route path="/rate"    element={<RatePage />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/games"   element={<MiniGames />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about"   element={<About />} />
          {/* Fallback */}
          <Route path="*" element={<Home />} />
        </Routes>
        {/* Footer */}
        <footer className="border-t border-white/5 py-8 px-4 text-center">
          <p className="text-gray-600 text-sm">
            🤖 Rate My Robot — Built for makers, by makers.
            <span className="mx-2">·</span>
            <a href="https://github.com/JosiahSK/rate-my-robot" target="_blank" rel="noopener noreferrer"
               className="text-cyber-700 hover:text-cyber-500 transition-colors">
              GitHub
            </a>
            <span className="mx-2">·</span>
            Powered by Gemini 2.5 Flash
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );
}
