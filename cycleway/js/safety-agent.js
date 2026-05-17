// Safety Analysis Agent — sub-agent that auto-evaluates route risk on load
// Demonstrates multi-agent pattern: app.js (orchestrator) spawns this in parallel
// with the main AI advisor, each with its own system prompt and purpose.

const LITELLM_URL  = 'http://localhost:4000/v1/chat/completions';
const LITELLM_KEY  = 'cycleway-dev-key';
const OLLAMA_URL   = 'http://localhost:11434/v1/chat/completions';

const SYSTEM_PROMPT = `You are a cycling safety analyst. Reply in EXACTLY this format — no other text:
VERDICT: [SAFE|CAUTION|HIGH RISK]
REASON: [one sentence, max 20 words explaining the main risk or why it is safe]`;

async function _endpoint() {
  try {
    const r = await fetch('http://localhost:4000/health', { signal: AbortSignal.timeout(1500) });
    if (r.ok || r.status === 401) return { url: LITELLM_URL, model: 'local/llama3.2', key: LITELLM_KEY };
  } catch { /* connection refused or timeout */ }
  return { url: OLLAMA_URL, model: 'llama3.2:1b', key: '' };
}

export async function analyzeRouteSafety(bike, wx, traffic, from, to) {
  const { url, model, key } = await _endpoint();
  const headers = { 'Content-Type': 'application/json' };
  if (key) headers['Authorization'] = `Bearer ${key}`;

  const userMsg =
    `Route: ${from.name} → ${to.name} | ${(bike.distanceM / 1000).toFixed(1)} km | ↑${Math.round(bike.ascent || 0)}m ascent\n` +
    `Weather: ${wx.temp}°C, wind ${wx.windSpeed} km/h (gusts ${wx.windGust} km/h), rain ${wx.precipProb}%, UV index ${wx.uv}\n` +
    `Traffic: ${traffic ? `${traffic.label} — ${traffic.currentSpeed} km/h current vs ${traffic.freeFlowSpeed} km/h free-flow` : 'no live data'}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: userMsg }
        ],
        stream: false,
        temperature: 0.1,
        max_tokens: 60
      }),
      signal: AbortSignal.timeout(20000)
    });

    if (!res.ok) return null;
    const data = await res.json();
    return _parse(data.choices?.[0]?.message?.content || '');
  } catch {
    return null;
  }
}

function _parse(text) {
  const v = text.match(/VERDICT:\s*(SAFE|CAUTION|HIGH RISK)/i);
  const r = text.match(/REASON:\s*(.+)/i);
  if (!v) return null;
  return {
    verdict: v[1].toUpperCase(),
    reason:  r ? r[1].trim() : text.replace(/VERDICT:[^\n]+\n?/i, '').trim()
  };
}
