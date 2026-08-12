import React, { useState, useEffect } from 'react';
import { Gamepad2, Radio, Bug, Swords, Clock, ChevronLeft, CheckCircle } from 'lucide-react';
import { getProfile, saveProfile } from '../utils/profile';

// ── Sensor data ──────────────────────────────────────────────────────────────
const SENSORS = [
  { image: 'HC-SR04', name: 'HC-SR04 Ultrasonic',
    options: ['HC-SR04 Ultrasonic', 'IR Proximity Sensor', 'PIR Motion Sensor', 'Hall Effect Sensor'],
    correct: 'HC-SR04 Ultrasonic', hint: 'Measures distance using high-frequency sound waves' },
  { image: 'DHT22', name: 'DHT22 Temp/Humidity',
    options: ['DS18B20 Temperature', 'DHT22 Temp/Humidity', 'BMP280 Barometer', 'MQ-2 Gas Sensor'],
    correct: 'DHT22 Temp/Humidity', hint: 'Measures both temperature AND humidity in one package' },
  { image: 'MPU-6050', name: 'MPU-6050 IMU',
    options: ['ADXL345 Accelerometer', 'L298N Motor Driver', 'MPU-6050 IMU', 'ACS712 Current Sensor'],
    correct: 'MPU-6050 IMU', hint: '6-axis: 3-axis accelerometer + 3-axis gyroscope' },
  { image: 'LDR', name: 'LDR Photo Resistor',
    options: ['LDR Photo Resistor', 'NPN Transistor', 'Electrolytic Capacitor', 'Zener Diode'],
    correct: 'LDR Photo Resistor', hint: 'Resistance changes inversely with light intensity' },
  { image: 'A3144', name: 'Hall Effect Sensor',
    options: ['Reed Switch', 'Hall Effect Sensor', 'Rotary Encoder', 'Potentiometer'],
    correct: 'Hall Effect Sensor', hint: 'Detects magnetic fields — outputs a voltage, not a mechanical switch' },
];

// ── Bug snippets ─────────────────────────────────────────────────────────────
const BUG_SNIPPETS = [
  {
    title: "Blinking LED won't blink",
    code: `void setup() {
  pinMode(13, INPUT); // bug on this line
  Serial.begin(9600);
}
void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`,
    bugLine: 2,
    explanation: 'Line 2: pinMode should be OUTPUT, not INPUT. You cannot drive current through a pin set as input.',
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
  // delay missing here — bug on this line
}`,
    bugLine: 10,
    explanation: 'Line 10: Missing delay after write(0). Without it the servo is commanded back to 180° before finishing its move, causing jitter.',
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
  distance = duration; // bug on this line
}`,
    bugLine: 9,
    explanation: 'Line 9: Raw duration is not distance. Correct formula: distance = (duration * 0.034) / 2. Sound travels to the target and back.',
    hint: 'Sound travels to the object AND back — account for the return trip.',
  },
];

// ── Timer hook ────────────────────────────────────────────────────────────────
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

// ── Guess the Sensor ──────────────────────────────────────────────────────────
function GuessSensorGame({ onBack }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const SECS = 15;
  const q = SENSORS[idx];

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
        <CheckCircle size={48} className={`mx-auto mb-4 ${score >= 4 ? 'text-cyber-400' : score >= 2 ? 'text-yellow-400' : 'text-gray-500'}`} />
        <h2 className="text-2xl font-black text-white mb-2">Final Score: {score}/{SENSORS.length}</h2>
        <p className="text-gray-400 mb-6">
          {score >= 4 ? 'Sensor wizard — you know your components.' :
           score >= 2 ? 'Not bad. Keep tinkering!' : 'Time to read more datasheets.'}
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
        <span className={`font-bold text-lg tabular-nums ${timeLeft <= 5 ? 'text-neon-pink' : 'text-cyber-400'}`}>
          {timeLeft}s
        </span>
      </div>
      <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${pct > 50 ? 'bg-cyber-500' : pct > 20 ? 'bg-yellow-500' : 'bg-neon-pink'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="glass-card p-8 text-center">
        <div className="inline-block px-6 py-4 bg-dark-700 border border-dark-500 rounded-xl mb-4">
          <span className="font-mono text-2xl font-bold text-white tracking-wider">{q.image}</span>
        </div>
        <p className="text-gray-500 text-sm mb-1">Hint: {q.hint}</p>
        <h2 className="text-xl font-bold text-white">What component / sensor is this?</h2>
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
            {selected && opt === q.correct ? '+ ' : selected && opt === selected && opt !== q.correct ? 'x ' : ''}
            {opt}
          </button>
        ))}
      </div>

      {selected && (
        <div className="glass-card p-4 border-l-4 border-cyber-500 animate-fade-up">
          <p className="text-sm text-gray-300 mb-3">
            {timedOut ? "Time's up! " : ''}{q.explanation}
          </p>
          <button onClick={next} className="btn-primary text-sm">
            {idx + 1 >= SENSORS.length ? 'See Results' : 'Next Question'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Debug-a-Bot ───────────────────────────────────────────────────────────────
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
        <CheckCircle size={48} className={`mx-auto mb-4 ${score >= 3 ? 'text-cyber-400' : score >= 2 ? 'text-yellow-400' : 'text-gray-500'}`} />
        <h2 className="text-2xl font-black text-white mb-2">Debug Score: {score}/{BUG_SNIPPETS.length}</h2>
        <p className="text-gray-400 mb-6">
          {score >= 3 ? 'Bug whisperer — nothing escapes you.' :
           score >= 2 ? 'Decent debugging. Keep reading code.' : 'Bugs win this round. Practice more.'}
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
        <h3 className="font-bold text-white mb-1">{q.title}</h3>
        <p className="text-gray-400 text-sm">Click the line containing the bug.</p>
        <p className="text-xs text-cyber-400 mt-1">Hint: {q.hint}</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="bg-dark-800 px-4 py-2 border-b border-dark-600 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-dark-500" />
            <div className="w-3 h-3 rounded-full bg-dark-500" />
            <div className="w-3 h-3 rounded-full bg-dark-500" />
          </div>
          <span className="text-xs text-gray-500 ml-2">sketch.ino</span>
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
                {isSel && isBug  && <span className="text-cyber-400 text-xs font-bold flex-shrink-0">FOUND</span>}
                {isSel && !isBug && <span className="text-neon-pink text-xs font-bold flex-shrink-0">WRONG</span>}
                {selLine !== null && isBug && !isSel && <span className="text-cyber-400 text-xs font-bold flex-shrink-0">HERE</span>}
              </div>
            );
          })}
        </div>
      </div>

      {selLine !== null && (
        <div className="glass-card p-4 border-l-4 border-cyber-500 animate-fade-up">
          <p className="text-sm text-gray-300 mb-3">{q.explanation}</p>
          <button onClick={next} className="btn-primary text-sm">
            {idx + 1 >= BUG_SNIPPETS.length ? 'See Results' : 'Next Bug'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Hub ───────────────────────────────────────────────────────────────────────
const GAMES = [
  { id: 'sensor', Icon: Radio, title: 'Guess the Sensor', desc: '15 seconds per question. Identify common robotics sensors and components from their part names.', difficulty: 'Medium', time: '~2 min' },
  { id: 'debug',  Icon: Bug,   title: 'Debug-a-Bot',      desc: 'Spot the bug in real Arduino/ESP32 code snippets. One click to mark the culprit line.', difficulty: 'Hard', time: '~3 min' },
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
              <ChevronLeft size={16} /> Back to Games
            </button>
            {activeGame === 'sensor' && <GuessSensorGame onBack={() => setActiveGame(null)} />}
            {activeGame === 'debug'  && <DebugGame onBack={() => setActiveGame(null)} />}
          </>
        ) : (
          <>
            <div className="text-center mb-10">
              <h1 className="section-title">Mini-Games Hub</h1>
              <p className="text-gray-400">Test your robotics and embedded systems knowledge.</p>
            </div>

            <div className="space-y-4">
              {GAMES.map(({ id, Icon, title, desc, difficulty, time }) => (
                <div key={id} className="glass-card-hover p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-cyber-500/15 border border-cyber-500/20 flex items-center justify-center flex-shrink-0">
                        <Icon size={22} className="text-cyber-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
                        <p className="text-gray-400 text-sm mb-3">{desc}</p>
                        <div className="flex gap-2">
                          <span className="badge-pill flex items-center gap-1">
                            <Clock size={10} /> {time}
                          </span>
                          <span className={`badge-pill ${
                            difficulty === 'Hard' ? 'border-neon-pink/40 text-neon-pink' : 'border-yellow-500/40 text-yellow-400'
                          }`}>{difficulty}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => startGame(id)}
                      className="btn-primary flex-shrink-0 text-sm"
                      id={`game-${id}-btn`}
                    >
                      Play
                    </button>
                  </div>
                </div>
              ))}

              {/* Coming soon */}
              <div className="glass-card p-6 opacity-50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-dark-600 border border-dark-500 flex items-center justify-center flex-shrink-0">
                    <Swords size={22} className="text-gray-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">
                      Community Face-off
                      <span className="badge-pill ml-2 text-xs align-middle">Coming Soon</span>
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
