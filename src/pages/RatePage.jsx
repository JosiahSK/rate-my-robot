import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { rateRobot, submitToGallery } from '../utils/api';
import { getProfile, saveProfile, updateStreak, checkAndAwardBadges } from '../utils/profile';
import ScoreCard from '../components/ScoreCard';
import Confetti from '../components/Confetti';

const STEPS = ['Upload', 'Analyzing', 'Result'];

export default function RatePage() {
  const [step, setStep] = useState('upload'); // 'upload' | 'rating' | 'result'
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gallerySubmitted, setGallerySubmitted] = useState(false);
  const [newBadges, setNewBadges] = useState([]);

  const onDrop = useCallback((acceptedFiles, rejections) => {
    if (rejections.length) {
      setError(rejections[0].errors[0]?.message || 'Invalid file.');
      return;
    }
    const f = acceptedFiles[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const handleRate = async () => {
    if (!file) return;
    setStep('rating');
    setError(null);
    try {
      const data = await rateRobot(file);
      setResult(data);

      // Gamification
      let profile = getProfile();
      profile = updateStreak(profile);
      profile.uploads = [
        { ...data, imageUrl: preview, ratedAt: new Date().toISOString() },
        ...(profile.uploads || []),
      ].slice(0, 50);
      const { profile: updated, newBadges: earned } = checkAndAwardBadges(profile);
      saveProfile(updated);
      setNewBadges(earned);

      setStep('result');
      if (data.overall_score >= 70) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }
    } catch (err) {
      setError(err.message || 'Rating failed. Please try again.');
      setStep('upload');
    }
  };

  const handleReset = () => {
    setStep('upload');
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setResult(null);
    setError(null);
    setGallerySubmitted(false);
    setNewBadges([]);
    setShowConfetti(false);
  };

  const handleSubmitToGallery = async () => {
    if (!result) return;
    try {
      await submitToGallery({
        ...result,
        imageUrl: null,
        submittedAt: new Date().toISOString(),
        deviceId: localStorage.getItem('rmr_device_id'),
      });
      setGallerySubmitted(true);
    } catch {
      alert('Failed to submit. Please try again.');
    }
  };

  const stepIdx = step === 'upload' ? 0 : step === 'rating' ? 1 : 2;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <Confetti active={showConfetti} />

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="section-title">🤖 Rate My Robot</h1>
          <p className="text-gray-400">Upload a photo of your build. Our AI judge will score it and deliver a verdict.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 border ${
                i === stepIdx ? 'bg-cyber-500/20 text-cyber-400 border-cyber-500/50 shadow-neon-teal' :
                i < stepIdx  ? 'bg-cyber-900/40 text-cyber-600 border-cyber-900/40' :
                               'bg-dark-700 text-gray-600 border-dark-600'
              }`}>
                <span className="font-mono text-xs">{i < stepIdx ? '✓' : i + 1}</span>
                <span className="hidden sm:block">{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-6 transition-all ${i < stepIdx ? 'bg-cyber-600' : 'bg-dark-600'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="glass-card p-4 border border-neon-pink/30 bg-neon-pink/5 mb-6 flex items-start gap-3">
            <span className="text-xl flex-shrink-0">⚠️</span>
            <div>
              <p className="text-neon-pink font-semibold text-sm">Rating failed</p>
              <p className="text-gray-400 text-sm mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* New badge unlock */}
        {newBadges.length > 0 && (
          <div className="glass-card p-4 border border-yellow-500/30 bg-yellow-500/5 mb-6">
            <p className="text-yellow-400 font-bold text-sm mb-2">
              🎉 Badge{newBadges.length > 1 ? 's' : ''} Unlocked!
            </p>
            <div className="flex flex-wrap gap-2">
              {newBadges.map(b => (
                <span key={b.id} className="badge-pill border-yellow-500/40 text-yellow-300">
                  {b.emoji} {b.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Upload ── */}
        {step === 'upload' && (
          <div className="space-y-5">
            <div
              {...getRootProps()}
              className={`drop-zone ${isDragActive ? 'active' : ''}`}
              id="robot-upload-dropzone"
            >
              <input {...getInputProps()} id="robot-image-input" />
              {preview ? (
                <div className="space-y-3">
                  <img src={preview} alt="Preview" className="max-h-60 mx-auto rounded-xl object-cover ring-2 ring-cyber-500/30" />
                  <p className="text-cyber-400 text-sm font-medium">{file?.name}</p>
                  <p className="text-gray-500 text-xs">Click or drag to change image</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-6xl animate-bounce-gentle">{isDragActive ? '📥' : '📸'}</div>
                  <p className="text-white font-semibold text-lg">
                    {isDragActive ? "Drop it like it's hot!" : 'Drop your robot photo here'}
                  </p>
                  <p className="text-gray-500 text-sm">or click to browse · JPG, PNG, WebP up to 10 MB</p>
                </div>
              )}
            </div>

            <p className="text-center text-gray-600 text-xs">
              💡 Works best with: robot builds, circuit boards, Arduino/ESP32 projects, 3D-printed bots, RC vehicles
            </p>

            <button
              onClick={handleRate}
              disabled={!file}
              className="btn-primary w-full py-4 text-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
              id="rate-robot-btn"
            >
              🤖 Rate This Robot!
            </button>
          </div>
        )}

        {/* ── Rating (loading) ── */}
        {step === 'rating' && (
          <div className="glass-card p-10 text-center">
            {preview && (
              <div className="relative mb-6 inline-block">
                <img src={preview} alt="Your robot" className="max-h-44 rounded-xl object-cover mx-auto opacity-50" />
                <div className="absolute inset-0 scanline rounded-xl overflow-hidden" />
              </div>
            )}
            <div className="flex justify-center mb-5">
              <div className="w-12 h-12 border-4 border-cyber-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">AI Judge is deliberating…</h2>
            <p className="text-gray-400 text-sm">Analyzing wiring chaos, structural confidence, and sci-fi vibes…</p>
            <div className="flex justify-center gap-2 mt-5">
              {['⚡', '🔧', '🤖', '💡', '🚀'].map((e, i) => (
                <span
                  key={i}
                  className="text-xl"
                  style={{ animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }}
                >{e}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── Result ── */}
        {step === 'result' && result && (
          <div className="space-y-5">
            {preview && (
              <div className="glass-card p-2">
                <img src={preview} alt="Your robot" className="w-full max-h-60 object-cover rounded-xl" />
              </div>
            )}
            <ScoreCard
              result={result}
              imageUrl={preview}
              onSubmitToGallery={gallerySubmitted ? null : handleSubmitToGallery}
            />
            {gallerySubmitted && (
              <div className="glass-card p-4 border-cyber-500/30 text-center">
                <span className="text-cyber-400 font-semibold">✅ Added to the public gallery!</span>
              </div>
            )}
            <button
              onClick={handleReset}
              className="btn-secondary w-full"
              id="rate-another-btn"
            >
              📸 Rate Another Robot
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
