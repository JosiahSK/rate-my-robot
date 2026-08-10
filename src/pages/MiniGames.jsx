import React, { useState, useEffect, useCallback } from 'react';
import { getProfile, saveProfile } from '../utils/profile';

// ── Sensor data ──────────────────────────────────────────────────────────────
const SENSORS = [
  {
    image: '📡', name: 'HC-SR04 Ultrasonic',
    options: ['HC-SR04 Ultrasonic', 'IR Proximity Sensor', 'PIR Motion Sensor', 'Hall Effect Sensor'],
    correct: 'HC-SR04 Ultrasonic',
    hint: 'Measures distance using high-frequency sound waves',
  },
  {
    image: '🌡️', name: 'DHT22 Temp/Humidity',
    options: ['DS18B20 Temperature', 'DHT22 Temp/Humidity', 'BMP280 Barometer', 'MQ-2 Gas Sensor'],
    correct: 'DHT22 Temp/Humidity',
    hint: 'Measures both temperature AND humidity in one package',
  },
  {
    image: '🔄', name: 'MPU-6050 IMU',
    options: ['ADXL345 Accelerometer', 'L298N Motor Driver', 'MPU-6050 IMU', 'ACS712 Current Sensor'],
    correct: 'MPU-6050 IMU',
    hint: '6-axis: 3-axis accelerometer + 3-axis gyroscope',
  },
  {
    image: '💡', name: 'LDR Photo Resistor',
    options: ['LDR Photo Resistor', 'NPN Transistor', 'Electrolytic Capacitor', 'Zener Diode'],
    correct: 'LDR Photo Resistor',
    hint: 'Resistance changes inversely with light intensity',
  },
  {
    image: '🧲', name: 'Hall Effect Sensor',
    options: ['Reed Switch', 'Hall Effect Sensor', 'Rotary Encoder', 'Potentiometer'],
    correct: 'Hall Effect Sensor',
    hint: 'Detects magnetic fields — outputs a voltage, not a mechanical switch',
  },
];

// ── Buggy Arduino snippets ───────────────────────────────────────────────────
const BUG_SNIPPETS = [
  {
    title: "Blinking LED won't blink",
    code: `void setup() {
  pinMode(13, INPUT); // ← bug here
  Serial.begin(9600);
}
void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`,
    bugLine: 2,
    explanation: 'Line 2: pinMode should be OUTPUT, not INPUT. You cannot drive current through a pin configured as input.',
    hint: 'Check the direction of the pin mode.',
  },
  {
    title: 'Servo jitters uncontrollably',
    code: `#include <Servo.h>
Servo myServo;
void setup() {
  myServo.attach(9);
}
void loop() {
  myServo.write(180);
  delay(500);
  myServo.write(0);
  // delay missing! ← bug here
}`,
    bugLine: 10,
    explanation: 'Line 10: Missing delay after write(0). Without it, the servo is immediately commanded to 180° before finishing its movement — causing jitter.',
    hint: 'A servo needs time to physically reach its target angle.',
  },
  {
    title: 'Ultrasonic sensor always reads 0',
    code: `long duration, distance;
void loop() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  duration = pulseIn(ECHO, HIGH);
  distance = duration; // ← bug here
}`,
    bugLine: 9,
    explanation: 'Line 9: Raw duration is not distance! You must convert: distance = (duration * 0.034) / 2. Sound travels to the object AND back.',
    hint: 'Sound travels to the target and back — you need to account for the return trip.',
  },
];

// ── Timer hook ───────────────────────────────────────────────────────────────
function useCountdown(seconds, onExpire, active) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (!active) { setLeft(seconds); return; }
    setLeft(seconds);
    const id = setInterval(() => {
      setLeft(prev => {
        if (prev <= 1) { clearInterval(id); onExpire?.(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [seconds, active]);
  return left;
}

// ── Guess the Sensor ─────────────────────────────────────────────────────────
function GuessSensorGame({ onBack }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const q = SENSORS[idx];
  const SECS = 15;

  const timeLeft = useCountdown(SECS, () => {
    if (!selected) { setSelected('__timeout__'); setTimedOut(true); }
  }, !selected && !done);

  const pick = (opt) => {
    if (selected) return;
    setSelected(opt);
    if (opt === q.correct) setScore(s => s + 1);
  };

  const next = () => {
    if (idx + 1 >= SENSORS.length) { setDone(true); return; }
    setIdx(i => i + 1);
    setSelected(null);
    setTimedOut(false);
  };

  if (done) {
    return (
      <div className="glass-card p-10 text-center">
        <div className="text-5xl mb-4">{score >= 4 ? '🏆' : score >= 2 ? '⭐' : '🤖'}</div>
        <h2 className="text-2xl font-black text-white mb-2">Final Score: {score}/{SENSORS.length}</h2>
        <p className="text-gray-400 mb-6">
          {score >= 4 ? 'Sensor wizard! You know your components.' :
           score >= 2 ? 'Not bad — keep tinkering!' : 'Time to read more datasheets!'}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => { setIdx(0); setScore(0); setSelected(null); setDone(false); setTimedOut(false); }} className="btn-primary">Play Again</button>
          <button onClick={onBack} className="btn-secondary">Back</button>
        </div>
      </div>
    );
  }

  const pct = (timeLeft / SECS) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">Question {idx + 1}/{SENSORS.length} · Score: {score}</span>
        <span className={`font-mono font-bold text-lg ${timeLeft <= 5 ? 'text-neon-pink animate-pulse' : 'text-cyber-400'}`}>{timeLeft}s</span>
      </div>

      <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${pct > 50 ? 'bg-cyber-500' : pct > 20 ? 'bg-yellow-500' : 'bg-neon-pink'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="glass-card p-8 text-center">
        <div className="text-8xl mb-4">{q.image}</div>
        <p className="text-gray-500 text-sm mb-1">💡 Hint: {q.hint}</p>
        <h2 className="text-xl font-bold text-white">What component/sensor is this?</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {q.options.map(opt => (
          <button
            key={opt}
            onClick={() => pick(opt)}
            disabled={!!selected}
            className={`p-4 rounded-xl text-sm font-medium text-left border transition-all ${
              !selected ? 'glass-card-hover text-gray-300' :
              opt === q.correct ? 'bg-cyber-500/20 border-cyber-400 text-cyber-300' :
              opt === selected ? 'bg-neon-pink/20 border-neon-pink text-neon-pink' :
              'glass-card text-gray-600 opacity-40'
            }`}
          >
            {selected && opt === q.correct ? '✅ ' : selected && opt === selected && opt !== q.correct ? '❌ ' : ''}
            {opt}
          </button>
        ))}
      </div>

      {selected && (
        <div className="glass-card p-4 border-l-4 border-cyber-500 animate-fade-up">
          <p className="text-sm text-gray-300 mb-3">
            {timedOut ? "⏱️ Time's up! " : ''}{q.explanation}
          </p>
          <button onClick={next} className="btn-primary text-sm">
            {idx + 1 >= SENSORS.length ? 'See Results 🏆' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Debug-a-Bot ──────────────────────────────────────────────────────────────
function DebugGame({ onBack }) {
  const [idx, setIdx] = useState(0);
  const [selLine, setSelLine] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = BUG_SNIPPETS[idx];

  const clickLine = (n) => {
    if (selLine !== null) return;
    setSelLine(n);
    if (n === q.bugLine) setScore(s => s + 1);
  };

  const next = () => {
    if (idx + 1 >= BUG_SNIPPETS.length) { setDone(true); return; }
    setIdx(i => i + 1);
    setSelLine(null);
  };

  if (done) {
    return (
      <div className="glass-card p-10 text-center">
        <div className="text-5xl mb-4">{score >= 3 ? '🏆' : score >= 2 ? '⭐' : '🐛'}</div>
        <h2 className="text-2xl font-black text-white mb-2">Debug Score: {score}/{BUG_SNIPPETS.length}</h2>
        <p className="text-gray-400 mb-6">
          {score >= 3 ? 'Bug whisperer! Nothing escapes you.' :
           score >= 2 ? 'Decent debugging — keep reading code!' : 'Bugs win this round. Practice more!'}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => { setIdx(0); setScore(0); setSelLine(null); setDone(false); }} className="btn-primary">Play Again</button>
          <button onClick={onBack} className="btn-secondary">Back</button>
        </div>
      </div>
    );
  }

  const lines = q.code.split('\n');

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <h3 className="font-bold text-white mb-1">🐛 {q.title}</h3>
        <p className="text-gray-400 text-sm">Click the line containing the bug.</p>
        <p className="text-xs text-cyber-400 mt-1">💡 Hint: {q.hint}</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="bg-dark-800 px-4 py-2 border-b border-dark-600 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-neon-pink/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-cyber-500/60" />
          </div>
          <span className="text-xs text-gray-500 font-mono ml-2">sketch.ino</span>
        </div>
        <div className="p-3 overflow-x-auto">
          {lines.map((line, i) => {
            const n = i + 1;
            const isBug = n === q.bugLine;
            const isSel = n === selLine;
            return (
              <div
                key={i}
                onClick={() => clickLine(n)}
                className={`flex gap-3 px-2 py-0.5 rounded-md cursor-pointer transition-all font-mono text-sm select-none ${
                  selLine === null ? 'hover:bg-cyber-500/10' : ''
                } ${
                  isSel && isBug  ? 'bg-cyber-500/25 text-cyber-300' :
                  isSel && !isBug ? 'bg-neon-pink/20 text-neon-pink' :
                  selLine !== null && isBug ? 'bg-cyber-500/15 text-cyber-400' :
                  'text-gray-400'
                }`}
              >
                <span className="text-gray-600 w-5 text-right flex-shrink-0 tabular-nums">{n}</span>
                <span className="flex-1 whitespace-pre">{line}</span>
                {isSel && isBug  && <span className="flex-shrink-0">✅</span>}
                {isSel && !isBug && <span className="flex-shrink-0">❌</span>}
                {selLine !== null && isBug && !isSel && <span className="flex-shrink-0">👆</span>}
              </div>
            );
          })}
        </div>
      </div>

      {selLine !== null && (
        <div className="glass-card p-4 border-l-4 border-cyber-500 animate-fade-up">
          <p className="text-sm text-gray-300 mb-3">{q.explanation}</p>
          <button onClick={next} className="btn-primary text-sm">
            {idx + 1 >= BUG_SNIPPETS.length ? 'See Results 🏆' : 'Next Bug →'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Hub ──────────────────────────────────────────────────────────────────────
const GAMES = [
  { id: 'sensor', emoji: '📡', title: 'Guess the Sensor', desc: '15 seconds per question. Identify common robotics sensors and components.', difficulty: 'Medium', time: '~2 min' },
  { id: 'debug',  emoji: '🐛', title: 'Debug-a-Bot',      desc: 'Spot the bug in real Arduino/ESP32 code snippets. One click to mark the culprit.', difficulty: 'Hard', time: '~3 min' },
];

export default function MiniGames() {
  const [activeGame, setActiveGame] = useState(null);

  const startGame = (id) => {
    setActiveGame(id);
    try {
      const p = getProfile();
      p.gamesPlayed = (p.gamesPlayed || 0) + 1;
      saveProfile(p);
    } catch {}
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {activeGame ? (
          <>
            <button
              onClick={() => setActiveGame(null)}
              className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-all text-sm"
            >
              ← Back to Games
            </button>
            {activeGame === 'sensor' && <GuessSensorGame onBack={() => setActiveGame(null)} />}
            {activeGame === 'debug'  && <DebugGame onBack={() => setActiveGame(null)} />}
          </>
        ) : (
          <>
            <div className="text-center mb-10">
              <h1 className="section-title">🎮 Mini-Games Hub</h1>
              <p className="text-gray-400">Test your robotics and embedded systems knowledge.</p>
            </div>

            <div className="space-y-4">
              {GAMES.map(game => (
                <div key={game.id} className="glass-card-hover p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl flex-shrink-0">{game.emoji}</div>
                      <div>
                        <h2 className="text-xl font-bold text-white mb-1">{game.title}</h2>
                        <p className="text-gray-400 text-sm mb-3">{game.desc}</p>
                        <div className="flex gap-2">
                          <span className="badge-pill">⏱ {game.time}</span>
                          <span className={`badge-pill ${
                            game.difficulty === 'Hard' ? 'border-neon-pink/40 text-neon-pink' : 'border-yellow-500/40 text-yellow-400'
                          }`}>{game.difficulty}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => startGame(game.id)}
                      className="btn-primary flex-shrink-0 text-sm"
                      id={`game-${game.id}-btn`}
                    >
                      Play →
                    </button>
                  </div>
                </div>
              ))}

              {/* Coming soon */}
              <div className="glass-card p-6 opacity-60">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">⚔️</div>
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">
                      Community Face-off
                      <span className="badge-pill ml-2 text-xs">Coming Soon</span>
                    </h2>
                    <p className="text-gray-400 text-sm">Two random robots go head-to-head. You decide which is cooler.</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
