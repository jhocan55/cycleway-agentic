import { QUESTIONS, DOMAINS, getQuestionsByDomain, getAllQuestions } from './questions.js';
import { recordAttempt, getDomainStats } from './progress.js';

let currentDomain = null;
let currentQuestions = [];
let currentIndex = 0;
let sessionScore = { correct: 0, total: 0 };
let answered = false;

// ── Public API ────────────────────────────────────────────────────────────────

export function startDomainQuiz(domainKey, renderFn) {
  currentDomain = domainKey;
  currentQuestions = shuffle([...getQuestionsByDomain(domainKey)]);
  currentIndex = 0;
  sessionScore = { correct: 0, total: 0 };
  answered = false;
  renderFn(buildQuestion(currentQuestions[0], 0, currentQuestions.length));
}

export function startFullQuiz(renderFn) {
  currentDomain = 'all';
  currentQuestions = shuffle(getAllQuestions());
  currentIndex = 0;
  sessionScore = { correct: 0, total: 0 };
  answered = false;
  renderFn(buildQuestion(currentQuestions[0], 0, currentQuestions.length));
}

export function submitAnswer(optionIndex, renderFn) {
  if (answered) return;
  answered = true;

  const q = currentQuestions[currentIndex];
  const correct = optionIndex === q.answer;
  sessionScore.total++;
  if (correct) sessionScore.correct++;

  const domain = q.domain || currentDomain;
  recordAttempt(domain, q.id, correct);

  renderFn(buildResult(q, optionIndex, correct, sessionScore));
}

export function nextQuestion(renderFn) {
  currentIndex++;
  answered = false;
  if (currentIndex >= currentQuestions.length) {
    renderFn(buildSummary(sessionScore, currentDomain));
    return;
  }
  renderFn(buildQuestion(currentQuestions[currentIndex], currentIndex, currentQuestions.length));
}

export function getSessionScore() {
  return sessionScore;
}

// ── View builders ─────────────────────────────────────────────────────────────

function buildQuestion(q, index, total) {
  const domain = q.domain || currentDomain;
  const d = DOMAINS[domain];
  return {
    type: 'question',
    domainLabel: d ? `${d.icon} ${d.title}` : '',
    domainColor: d?.color || '#374151',
    progress: { current: index + 1, total },
    question: q.q,
    options: q.options,
    id: q.id
  };
}

function buildResult(q, chosen, correct, score) {
  const domain = q.domain || currentDomain;
  const d = DOMAINS[domain];
  return {
    type: 'result',
    correct,
    chosen,
    correctIndex: q.answer,
    explanation: q.explanation,
    domainLabel: d ? `${d.icon} ${d.title}` : '',
    domainColor: d?.color || '#374151',
    score
  };
}

function buildSummary(score, domainKey) {
  const pct = Math.round((score.correct / score.total) * 100);
  const pass = pct >= 70;
  const stats = domainKey && domainKey !== 'all' ? getDomainStats(domainKey) : null;
  return {
    type: 'summary',
    score,
    pct,
    pass,
    stats,
    domainKey
  };
}

// ── Utils ─────────────────────────────────────────────────────────────────────

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
