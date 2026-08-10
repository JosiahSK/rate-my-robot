// Device ID utility — creates a persistent anonymous ID stored in localStorage
export function getDeviceId() {
  let id = localStorage.getItem('rmr_device_id');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    localStorage.setItem('rmr_device_id', id);
  }
  return id;
}

// Profile/gamification data
export function getProfile() {
  const raw = localStorage.getItem('rmr_profile');
  if (raw) return JSON.parse(raw);
  return {
    deviceId: getDeviceId(),
    uploads: [],
    gamesPlayed: 0,
    totalScore: 0,
    streak: 0,
    lastActivity: null,
    badges: [],
    upvotedRobots: [],
    downvotedRobots: [],
  };
}

export function saveProfile(profile) {
  localStorage.setItem('rmr_profile', JSON.stringify(profile));
}

export function updateStreak(profile) {
  const today = new Date().toDateString();
  const last = profile.lastActivity;
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (last === today) {
    // Already active today — no change
    return profile;
  } else if (last === yesterday) {
    profile.streak = (profile.streak || 0) + 1;
  } else {
    profile.streak = 1;
  }
  profile.lastActivity = today;
  return profile;
}

export function checkAndAwardBadges(profile) {
  const badges = profile.badges || [];
  const uploads = profile.uploads || [];
  const streak = profile.streak || 0;

  const earned = [];

  if (uploads.length >= 1 && !badges.includes('first_upload')) {
    earned.push({ id: 'first_upload', name: 'First Upload', emoji: '🚀', desc: 'Uploaded your first robot!' });
  }
  if (uploads.length >= 5 && !badges.includes('five_robots')) {
    earned.push({ id: 'five_robots', name: '5 Robots Rated', emoji: '🤖', desc: 'Rated 5 robots total.' });
  }
  if (uploads.length >= 10 && !badges.includes('ten_robots')) {
    earned.push({ id: 'ten_robots', name: 'Double Digits', emoji: '💪', desc: 'Rated 10 robots!' });
  }
  if (streak >= 3 && !badges.includes('streak_3')) {
    earned.push({ id: 'streak_3', name: '3-Day Streak', emoji: '🔥', desc: '3 days in a row!' });
  }
  if (streak >= 7 && !badges.includes('streak_7')) {
    earned.push({ id: 'streak_7', name: '7-Day Streak', emoji: '⚡', desc: '7 days in a row — unstoppable!' });
  }
  if ((profile.gamesPlayed || 0) >= 5 && !badges.includes('gamer')) {
    earned.push({ id: 'gamer', name: 'Gamer Bot', emoji: '🎮', desc: 'Played 5 mini-games.' });
  }

  // "Survived the Roast" — got a score < 50
  const lowScore = uploads.find(u => u.overall_score < 50);
  if (lowScore && !badges.includes('survived_roast')) {
    earned.push({ id: 'survived_roast', name: 'Survived the Roast', emoji: '🌡️', desc: 'Got roasted and lived to tell the tale.' });
  }

  // "Top Scorer" — got a score > 90
  const highScore = uploads.find(u => u.overall_score > 90);
  if (highScore && !badges.includes('top_scorer')) {
    earned.push({ id: 'top_scorer', name: 'Top Scorer', emoji: '🏆', desc: 'Scored above 90!' });
  }

  if (earned.length > 0) {
    profile.badges = [...badges, ...earned.map(b => b.id)];
  }

  return { profile, newBadges: earned };
}

export const ALL_BADGES = [
  { id: 'first_upload',   name: 'First Upload',      emoji: '🚀', desc: 'Uploaded your first robot!' },
  { id: 'five_robots',    name: '5 Robots Rated',    emoji: '🤖', desc: 'Rated 5 robots total.' },
  { id: 'ten_robots',     name: 'Double Digits',     emoji: '💪', desc: 'Rated 10 robots!' },
  { id: 'streak_3',       name: '3-Day Streak',      emoji: '🔥', desc: '3 days in a row!' },
  { id: 'streak_7',       name: '7-Day Streak',      emoji: '⚡', desc: '7 days in a row!' },
  { id: 'gamer',          name: 'Gamer Bot',         emoji: '🎮', desc: 'Played 5 mini-games.' },
  { id: 'survived_roast', name: 'Survived the Roast',emoji: '🌡️', desc: 'Got roasted and lived.' },
  { id: 'top_scorer',     name: 'Top Scorer',        emoji: '🏆', desc: 'Scored above 90!' },
];
