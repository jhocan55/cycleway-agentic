// localStorage-based progress tracking per exam domain

const KEY = 'gh300_progress';

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function recordAttempt(domainKey, questionId, correct) {
  const data = load();
  if (!data[domainKey]) data[domainKey] = {};
  if (!data[domainKey][questionId]) {
    data[domainKey][questionId] = { attempts: 0, correct: 0, lastAttempt: null };
  }
  data[domainKey][questionId].attempts++;
  if (correct) data[domainKey][questionId].correct++;
  data[domainKey][questionId].lastAttempt = Date.now();
  save(data);
}

export function getDomainStats(domainKey) {
  const data = load();
  const domain = data[domainKey] || {};
  const questions = Object.values(domain);
  const attempted = questions.length;
  const correct   = questions.filter(q => q.correct > 0).length;
  const total     = questions.reduce((s, q) => s + q.attempts, 0);
  return { attempted, correct, total };
}

export function getAllStats() {
  const data = load();
  return Object.fromEntries(
    Object.entries(data).map(([key, domain]) => {
      const questions = Object.values(domain);
      return [key, {
        attempted: questions.length,
        correct:   questions.filter(q => q.correct > 0).length,
        total:     questions.reduce((s, q) => s + q.attempts, 0)
      }];
    })
  );
}

export function resetProgress() {
  localStorage.removeItem(KEY);
}
