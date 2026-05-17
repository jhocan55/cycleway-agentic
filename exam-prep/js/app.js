import { DOMAINS, getTotalQuestions } from './questions.js';
import { startDomainQuiz, startFullQuiz, submitAnswer, nextQuestion } from './quiz.js';
import { getAllStats, resetProgress } from './progress.js';
import { streamChat, checkOllama, MODEL } from './ollama.js';

// ── Tab navigation ─────────────────────────────────────────────────────────────
let activeTab = 'study';
const chatHistory = [];

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === tab)
  );
  document.querySelectorAll('.tab-content').forEach(c =>
    c.classList.toggle('active', c.id === 'tab-' + tab)
  );
  if (tab === 'progress') renderProgressTab();
  if (tab === 'patterns') renderPatternsTab();
}

// ── Quiz tab ──────────────────────────────────────────────────────────────────
function renderDomainSelector() {
  const el = document.getElementById('quiz-area');
  const stats = getAllStats();
  el.innerHTML = `
    <div class="quiz-header">
      <h2>Choose a domain to practice</h2>
      <p style="color:var(--ink-soft);font-size:13px;margin-top:4px">${getTotalQuestions()} questions across ${Object.keys(DOMAINS).length} domains · Pass mark: 70%</p>
    </div>
    <div class="domain-grid">
      ${Object.entries(DOMAINS).map(([key, d]) => {
        const s = stats[key] || { attempted: 0, correct: 0 };
        const pct = s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : null;
        return `
          <div class="domain-card" data-domain="${key}" style="--dc:${d.color}">
            <div class="dc-icon">${d.icon}</div>
            <div class="dc-title">${d.title}</div>
            <div class="dc-weight">${d.weight}</div>
            <div class="dc-desc">${d.description}</div>
            ${pct !== null
              ? `<div class="dc-score" style="color:${pct>=70?'var(--sage)':'var(--red)'}">Best: ${pct}%</div>`
              : '<div class="dc-score" style="color:var(--ink-soft)">Not started</div>'
            }
          </div>`;
      }).join('')}
    </div>
    <button class="btn-full-quiz" id="fullQuizBtn">🎯 Full practice exam (all domains)</button>
  `;

  document.querySelectorAll('.domain-card').forEach(card =>
    card.addEventListener('click', () => {
      startDomainQuiz(card.dataset.domain, renderQuizView);
    })
  );
  document.getElementById('fullQuizBtn').addEventListener('click', () => {
    startFullQuiz(renderQuizView);
  });
}

function renderQuizView(view) {
  const el = document.getElementById('quiz-area');
  if (view.type === 'question') {
    el.innerHTML = `
      <div class="quiz-progress">
        <div class="qp-label" style="color:${view.domainColor}">${view.domainLabel}</div>
        <div class="qp-counter">${view.progress.current} / ${view.progress.total}</div>
        <div class="qp-bar"><div class="qp-fill" style="width:${(view.progress.current/view.progress.total)*100}%;background:${view.domainColor}"></div></div>
      </div>
      <div class="quiz-question">${view.question}</div>
      <div class="quiz-options">
        ${view.options.map((opt, i) => `
          <button class="option-btn" data-index="${i}">${String.fromCharCode(65+i)}. ${opt}</button>
        `).join('')}
      </div>
      <button class="btn-back" id="backBtn">← Back to domains</button>
    `;
    document.querySelectorAll('.option-btn').forEach(btn =>
      btn.addEventListener('click', () => submitAnswer(+btn.dataset.index, renderQuizView))
    );
    document.getElementById('backBtn').addEventListener('click', renderDomainSelector);
  }

  else if (view.type === 'result') {
    const opts = document.querySelectorAll('.option-btn');
    opts.forEach((btn, i) => {
      btn.disabled = true;
      if (i === view.correctIndex) btn.classList.add('correct');
      else if (i === view.chosen) btn.classList.add('wrong');
    });
    const existing = document.querySelector('.quiz-result');
    if (existing) existing.remove();

    const div = document.createElement('div');
    div.className = 'quiz-result ' + (view.correct ? 'result-correct' : 'result-wrong');
    div.innerHTML = `
      <div class="qr-verdict">${view.correct ? '✅ Correct!' : '❌ Incorrect'}</div>
      <div class="qr-score">Score: ${view.score.correct}/${view.score.total}</div>
      <div class="qr-explanation">${view.explanation}</div>
      <button class="btn-next" id="nextBtn">Next question →</button>
    `;
    document.querySelector('.quiz-options').after(div);
    document.getElementById('nextBtn').addEventListener('click', () => nextQuestion(renderQuizView));
  }

  else if (view.type === 'summary') {
    el.innerHTML = `
      <div class="quiz-summary">
        <div class="qs-score" style="color:${view.pass?'var(--sage)':'var(--red)'}">
          ${view.pct}%
        </div>
        <div class="qs-verdict">${view.pass ? '🎉 Pass — above 70%!' : '📚 Keep studying — below 70%'}</div>
        <div class="qs-detail">${view.score.correct} correct out of ${view.score.total} questions</div>
        ${view.stats ? `
          <div class="qs-total-note">
            All-time in this domain: ${view.stats.correct}/${view.stats.attempted} correct
          </div>` : ''}
        <div class="qs-actions">
          <button class="btn-retry" id="retryBtn">Retry domain</button>
          <button class="btn-back-domains" id="backDomainsBtn">← All domains</button>
        </div>
      </div>
    `;
    document.getElementById('backDomainsBtn').addEventListener('click', renderDomainSelector);
    document.getElementById('retryBtn').addEventListener('click', () => {
      if (view.domainKey && view.domainKey !== 'all') {
        startDomainQuiz(view.domainKey, renderQuizView);
      } else {
        startFullQuiz(renderQuizView);
      }
    });
  }
}

// ── Study assistant tab ───────────────────────────────────────────────────────
async function initStudyTab() {
  const statusEl = document.getElementById('ollama-status');
  const ok = await checkOllama();
  if (ok) {
    statusEl.innerHTML = `<span class="status-dot ok"></span> Ollama running · ${MODEL}`;
    statusEl.className = 'ollama-status ok';
  } else {
    statusEl.innerHTML = `<span class="status-dot off"></span> Ollama offline — run <code>ollama serve</code> in a terminal`;
    statusEl.className = 'ollama-status off';
  }

  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    await sendMessage(msg);
  });

  const chips = document.querySelectorAll('.prompt-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = chip.textContent;
      input.focus();
    });
  });
}

async function sendMessage(userMsg) {
  chatHistory.push({ role: 'user', content: userMsg });
  appendMessage('user', userMsg);

  const aiEl = appendMessage('assistant', '');
  const spinEl = document.createElement('span');
  spinEl.className = 'typing-dots';
  spinEl.textContent = '●●●';
  aiEl.appendChild(spinEl);

  let full = '';
  try {
    for await (const chunk of streamChat(chatHistory)) {
      full += chunk;
      spinEl.remove();
      aiEl.textContent = full;
    }
  } catch (err) {
    spinEl.remove();
    aiEl.textContent = `⚠️ ${err.message}. Make sure Ollama is running: ollama serve`;
    aiEl.style.color = 'var(--red)';
    chatHistory.pop();
    return;
  }
  chatHistory.push({ role: 'assistant', content: full });
}

function appendMessage(role, text) {
  const log = document.getElementById('chat-log');
  const div = document.createElement('div');
  div.className = 'chat-msg ' + role;
  div.textContent = text;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
  return div;
}

// ── Progress tab ──────────────────────────────────────────────────────────────
function renderProgressTab() {
  const stats = getAllStats();
  const el = document.getElementById('progress-content');
  const domains = Object.entries(DOMAINS);
  const totalQ = getTotalQuestions();
  const totalAttempted = Object.values(stats).reduce((s, d) => s + d.attempted, 0);
  const totalCorrect  = Object.values(stats).reduce((s, d) => s + d.correct, 0);
  const overallPct = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  el.innerHTML = `
    <div class="progress-overview">
      <div class="po-score" style="color:${overallPct>=70?'var(--sage)':overallPct>0?'var(--amber)':'var(--ink-soft)'}">
        ${totalAttempted > 0 ? overallPct + '%' : '—'}
      </div>
      <div class="po-label">Overall · ${totalCorrect}/${totalAttempted} answered</div>
      <div class="po-subtext">${totalQ} total questions available</div>
    </div>

    <div class="domain-progress-list">
      ${domains.map(([key, d]) => {
        const s = stats[key] || { attempted: 0, correct: 0 };
        const pct = s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : 0;
        const barColor = pct >= 70 ? 'var(--sage)' : pct > 0 ? 'var(--amber)' : 'var(--rule)';
        return `
          <div class="dp-row">
            <div class="dp-icon">${d.icon}</div>
            <div class="dp-info">
              <div class="dp-title">${d.title} <span class="dp-weight">${d.weight}</span></div>
              <div class="dp-bar-wrap">
                <div class="dp-bar" style="width:${pct}%;background:${barColor}"></div>
              </div>
            </div>
            <div class="dp-stat" style="color:${pct>=70?'var(--sage)':pct>0?'var(--amber)':'var(--ink-soft)'}">
              ${s.attempted > 0 ? pct + '%' : '—'}
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <button id="resetBtn" class="btn-reset">Reset all progress</button>
  `;

  document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Reset all quiz progress? This cannot be undone.')) {
      resetProgress();
      renderProgressTab();
    }
  });
}

// ── Agentic Patterns tab ──────────────────────────────────────────────────────
function renderPatternsTab() {
  const el = document.getElementById('patterns-content');
  el.innerHTML = `
    <div class="patterns-intro">
      <h2>Agentic Patterns — Live in CycleWay</h2>
      <p>The CycleWay bicycle navigator app in this project demonstrates the core agentic AI patterns tested in the certification. Open <code>cycleway/index.html</code> to see them in action.</p>
    </div>

    <div class="pattern-list">

      <div class="pattern-card">
        <div class="pc-header">
          <span class="pc-icon">🔧</span>
          <div>
            <div class="pc-title">Tool Use / Function Calling</div>
            <div class="pc-tag">Core agentic concept</div>
          </div>
        </div>
        <div class="pc-desc">In agentic AI, tools are functions the agent can call to take actions or retrieve data. Each CycleWay module is a tool with a clean contract.</div>
        <div class="pc-code">
// geocoding.js — a "geocode" tool
export async function geocode(q) → Coordinate

// weather.js — a "weather" tool
export async function getWeather(lat, lng) → WeatherData

// routing.js — a "routing" tool
export async function getBikeRoute(from, to, key, prefs) → RouteResult
        </div>
        <div class="pc-exam-tip">💡 Exam tip: Tools must have defined input/output schemas, graceful error handling, and be independently testable.</div>
      </div>

      <div class="pattern-card">
        <div class="pc-header">
          <span class="pc-icon">🎭</span>
          <div>
            <div class="pc-title">Agent Orchestrator Pattern</div>
            <div class="pc-tag">Agent Mode concept</div>
          </div>
        </div>
        <div class="pc-desc">The orchestrator decides which tools to call, in what order, and with what inputs. It holds state and assembles results into a coherent response.</div>
        <div class="pc-code">
// app.js — the orchestrator (findRoute function)
async function findRoute() {
  const [from, to] = await geocode()      // Tool 1
  const wx = await getWeather()           // Tool 2
  const bike = await getBikeRoute()       // Tool 3
  const [car, traffic] = await Promise.all([
    getCarRoute(),      // Tool 4 (parallel)
    getTrafficFlow()    // Tool 5 (parallel)
  ])
  renderWeather(wx)     // Assemble results
  renderRoute(...)
}
        </div>
        <div class="pc-exam-tip">💡 Exam tip: Agents run tools in parallel when independent (like car + traffic here), sequentially when dependent (geocode before route).</div>
      </div>

      <div class="pattern-card">
        <div class="pc-header">
          <span class="pc-icon">🔄</span>
          <div>
            <div class="pc-title">Fallback / Error Boundary Pattern</div>
            <div class="pc-tag">Resilient agents</div>
          </div>
        </div>
        <div class="pc-desc">Agents must handle tool failures gracefully. CycleWay falls back from GraphHopper to OSRM, and returns null (not a crash) for optional tools.</div>
        <div class="pc-code">
// routing.js — fallback pattern
export async function getBikeRoute(from, to, ghKey, prefs) {
  if (ghKey) {
    return _graphhopper(...)  // Primary tool
    // If this throws → caught by orchestrator → toast
  }
  return _osrmBike(...)       // Fallback tool (no key needed)
}

// traffic.js — optional tool returning null on failure
export async function getTrafficFlow(lat, lng, key) {
  if (!key) return null        // Graceful no-op
  try { ... } catch { return null }
}
        </div>
        <div class="pc-exam-tip">💡 Exam tip: Good agents degrade gracefully — optional tool failures should not block the critical path.</div>
      </div>

      <div class="pattern-card">
        <div class="pc-header">
          <span class="pc-icon">🔌</span>
          <div>
            <div class="pc-title">MCP (Model Context Protocol)</div>
            <div class="pc-tag">GitHub Copilot + MCP</div>
          </div>
        </div>
        <div class="pc-desc">MCP is an open standard for connecting AI models to external tools and data. It's the same pattern used in CycleWay — each API is a "tool server".</div>
        <div class="pc-code">
// MCP architecture mirrors CycleWay's design:

MCP Server (tool provider):
  nominatim-server → geocode(query) tool
  osrm-server      → route(from, to) tool
  open-meteo-server → weather(lat, lng) tool
  tomtom-server    → traffic(lat, lng) tool

MCP Client (agent/orchestrator):
  Copilot Agent Mode ≈ app.js findRoute()
  Calls tools, combines results, renders output

MCP Primitives:
  Tools     → functions the agent can call
  Resources → data sources (files, databases)
  Prompts   → reusable instruction templates
        </div>
        <div class="pc-exam-tip">💡 Exam tip: MCP uses JSON-RPC 2.0. Servers expose tools, resources, and prompts. Clients (agents) discover and invoke them at runtime.</div>
      </div>

      <div class="pattern-card">
        <div class="pc-header">
          <span class="pc-icon">🛡️</span>
          <div>
            <div class="pc-title">Responsible Agentic AI</div>
            <div class="pc-tag">Exam domain — always tested</div>
          </div>
        </div>
        <div class="pc-desc">Agentic systems that take real-world actions need extra safety measures: scope limitation, human-in-the-loop checkpoints, and audit trails.</div>
        <div class="pc-code">
// CycleWay applies responsible agentic design:

1. Scope limitation
   → App only reads data (GET calls), never writes
   → No user data stored server-side

2. Human-in-the-loop
   → User must click "Find Route" (no auto-execution)
   → User reviews and accepts route before acting on it

3. Transparency
   → Shows data source badge ("GraphHopper" vs "OSRM")
   → Shows all tool outputs (weather, traffic) visibly

4. Error transparency
   → Toast messages show exactly what failed and why
   → Never silently fails or hides errors from user
        </div>
        <div class="pc-exam-tip">💡 Exam tip: Agents that take irreversible actions (sending emails, making purchases) MUST have explicit human confirmation before acting.</div>
      </div>

      <div class="pattern-card">
        <div class="pc-header">
          <span class="pc-icon">🤖</span>
          <div>
            <div class="pc-title">Local LLM with Ollama</div>
            <div class="pc-tag">Free agentic AI — this app</div>
          </div>
        </div>
        <div class="pc-desc">This study app uses Ollama to run llama3.2:1b locally — free, private, no API key. It demonstrates how to integrate any OpenAI-compatible LLM into an agent.</div>
        <div class="pc-code">
// ollama.js — OpenAI-compatible streaming client
const BASE = 'http://localhost:11434/v1'

async function* streamChat(messages) {
  const response = await fetch(BASE + '/chat/completions', {
    method: 'POST',
    body: JSON.stringify({
      model: 'llama3.2:1b',
      messages: [systemPrompt, ...messages],
      stream: true
    })
  })
  // Parse SSE stream, yield each text delta
  for await (const chunk of parseSSE(response)) {
    yield chunk.choices[0].delta.content
  }
}
        </div>
        <div class="pc-exam-tip">💡 Exam tip: GitHub Models provides free LLM inference (GPT-4o, Llama, etc.) via the same OpenAI-compatible API — useful for agentic apps without local Ollama.</div>
      </div>

    </div>
  `;
}

// ── Boot ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  document.querySelectorAll('.tab-btn').forEach(btn =>
    btn.addEventListener('click', () => switchTab(btn.dataset.tab))
  );

  await initStudyTab();
  renderDomainSelector();
  switchTab('study');
});
