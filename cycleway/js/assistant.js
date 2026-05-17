// Cycling advisor — routes through LiteLLM proxy (falls back to Ollama directly)
// LiteLLM: http://localhost:4000  →  Ollama (local) or GitHub Models (free)

const LITELLM_URL  = 'http://localhost:4000/v1/chat/completions';
const LITELLM_KEY  = 'cycleway-dev-key';
const OLLAMA_URL   = 'http://localhost:11434/v1/chat/completions';
const MODEL        = 'local/llama3.2';   // LiteLLM model name (see litellm-config.yaml)
const MODEL_DIRECT = 'llama3.2:1b';     // Direct Ollama fallback

async function _resolveEndpoint() {
  try {
    const r = await fetch('http://localhost:4000/health', { signal: AbortSignal.timeout(1000) });
    if (r.ok) return { url: LITELLM_URL, model: MODEL, key: LITELLM_KEY, via: 'LiteLLM' };
  } catch { /* fall through */ }
  return { url: OLLAMA_URL, model: MODEL_DIRECT, key: '', via: 'Ollama' };
}

let systemPrompt = _basePrompt();
let chatHistory  = [];

// ── Context ────────────────────────────────────────────────────────────────────

export function setContext(bike, wx, traffic, from, to) {
  chatHistory = [];

  const dist  = _fmtDist(bike.distanceM);
  const time  = _fmtTime(bike.durationS);
  const speed = (bike.distanceM / bike.durationS * 3.6).toFixed(0);
  const score = _cyclingScore(wx);
  const scoreLabel = score >= 70 ? 'great' : score >= 40 ? 'manageable' : 'difficult';
  const trafficLine = traffic
    ? `Car traffic at midpoint: ${traffic.label} (${traffic.currentSpeed} km/h vs ${traffic.freeFlowSpeed} km/h free-flow)`
    : 'No live traffic data available.';
  const elevLine = bike.ascent != null
    ? `Elevation: ↑${Math.round(bike.ascent)}m ascent, ↓${Math.round(bike.descent)}m descent`
    : '';

  systemPrompt = `You are CycleWay's AI cycling advisor. Be concise (max 80 words). Give practical, specific advice.

CURRENT ROUTE CONTEXT:
Route: ${from.name} → ${to.name}
Distance: ${dist} | Est. time: ${time} | Avg speed: ${speed} km/h
${elevLine}
Source: ${bike.source}

WEATHER AT START:
Temperature: ${wx.temp}°C (feels like ${wx.feelsLike}°C)
Wind: ${wx.windSpeed} km/h | Gusts: ${wx.windGust} km/h
Rain probability: ${wx.precipProb}% | Precipitation: ${wx.precip} mm
Humidity: ${wx.humidity}% | UV index: ${wx.uv}
Cycling conditions score: ${score}/100 — ${scoreLabel} conditions

TRAFFIC:
${trafficLine}

Answer questions about this specific route and conditions. Be direct and actionable.`;

  _resetLog();
  document.getElementById('aiBlock').style.display = 'block';
}

export function initAssistant() {
  const form  = document.getElementById('ai-form');
  const input = document.getElementById('ai-input');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    await _send(msg);
  });

  document.querySelectorAll('.ai-chip').forEach(chip => {
    chip.addEventListener('click', () => _send(chip.dataset.msg));
  });
}

// ── Guardrails ─────────────────────────────────────────────────────────────────

const _BLOCKED = [
  /ignore (previous|all|your) (instructions?|prompt|rules)/i,
  /you are now|pretend (you are|to be)|roleplay as/i,
  /jailbreak|dan mode|developer mode/i,
  /forget (you are|your instructions?|everything)/i,
];

function _guardrail(msg) {
  if (!msg.trim()) return 'Please type a message.';
  if (msg.length > 500) return 'Message too long — please keep questions under 500 characters.';
  for (const re of _BLOCKED) {
    if (re.test(msg)) return 'I can only answer questions about your current cycling route and conditions.';
  }
  return null;
}

// ── Chat ───────────────────────────────────────────────────────────────────────

async function _send(userMsg) {
  const blocked = _guardrail(userMsg);
  if (blocked) { _appendMsg('ai', `⚠️ ${blocked}`); return; }

  chatHistory.push({ role: 'user', content: userMsg });
  _appendMsg('user', userMsg);

  const aiEl = _appendMsg('ai', '');
  const dot  = document.createElement('span');
  dot.className = 'ai-typing';
  dot.textContent = '●●●';
  aiEl.appendChild(dot);

  let full = '';
  try {
    for await (const chunk of _stream(chatHistory)) {
      full += chunk;
      dot.remove();
      aiEl.textContent = full;
      document.getElementById('ai-log').scrollTop = 99999;
    }
  } catch (err) {
    dot.remove();
    aiEl.textContent = `⚠️ ${err.message}`;
    aiEl.style.color = 'var(--red)';
    chatHistory.pop();
    return;
  }
  chatHistory.push({ role: 'assistant', content: full });
}

async function* _stream(messages) {
  const { url, model, key, via } = await _resolveEndpoint();
  _updateBadge(via);

  const headers = { 'Content-Type': 'application/json' };
  if (key) headers['Authorization'] = `Bearer ${key}`;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      stream: true,
      temperature: 0.4,
      max_tokens: 200
    })
  });

  if (!res.ok) throw new Error(`LLM not responding (${res.status}). Run: ollama serve`);

  const reader  = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop();
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') return;
      try {
        const delta = JSON.parse(data).choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch { /* skip */ }
    }
  }
}

// ── DOM helpers ────────────────────────────────────────────────────────────────

function _appendMsg(role, text) {
  const log = document.getElementById('ai-log');
  const div = document.createElement('div');
  div.className = 'ai-msg ' + role;
  div.textContent = text;
  log.appendChild(div);
  log.scrollTop = 99999;
  return div;
}

function _updateBadge(via) {
  const badge = document.querySelector('.ai-badge');
  if (badge) badge.textContent = `🤖 ${via} · llama3.2`;
}

function _resetLog() {
  const log = document.getElementById('ai-log');
  log.innerHTML = '';
  const intro = document.createElement('div');
  intro.className = 'ai-msg ai';
  intro.textContent = 'Route loaded. Ask me anything about your ride!';
  log.appendChild(intro);
}

// ── Pure helpers (no external deps) ───────────────────────────────────────────

function _basePrompt() {
  return 'You are CycleWay\'s AI cycling advisor. No route loaded yet — ask the user to plan a route first.';
}

function _fmtDist(m) {
  return m >= 1000 ? (m / 1000).toFixed(2) + ' km' : Math.round(m) + ' m';
}

function _fmtTime(s) {
  const m = Math.round(s / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}min` : `${m} min`;
}

function _cyclingScore(wx) {
  let score = 100;
  if      (wx.temp < 0)  score -= 35;
  else if (wx.temp < 5)  score -= 25;
  else if (wx.temp < 10) score -= 10;
  else if (wx.temp > 35) score -= 20;
  else if (wx.temp > 28) score -= 8;
  if      (wx.windSpeed > 40) score -= 30;
  else if (wx.windSpeed > 25) score -= 15;
  else if (wx.windSpeed > 15) score -= 5;
  if      (wx.precipProb > 80) score -= 25;
  else if (wx.precipProb > 50) score -= 15;
  else if (wx.precipProb > 30) score -= 5;
  if (wx.precip > 2) score -= 15;
  if (wx.feelsLike < wx.temp - 5) score -= 10;
  if ([95, 96, 99].includes(wx.code)) score -= 40;
  if ([71, 73, 75, 77, 85, 86].includes(wx.code)) score -= 30;
  return Math.max(0, Math.min(100, score));
}
