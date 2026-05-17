// Ollama API client — OpenAI-compatible endpoint at localhost:11434

const BASE = 'http://localhost:11434/v1';
export const MODEL = 'llama3.2:1b';

const SYSTEM_PROMPT = `You are a concise GitHub Copilot certification tutor (GH-300 exam).
Help the student understand concepts for these exam domains:
1. Responsible AI (15-20%) — risks, ethics, validation
2. Copilot Features (25-30%) — Agent Mode, Edit Mode, MCP, Sub-Agents, CLI, Spaces, Spark
3. Data & Architecture (10-15%) — data flow, prompts, proxy, LLM limits
4. Prompt Engineering (10-15%) — zero-shot, few-shot, context crafting
5. Developer Productivity (10-15%) — code gen, tests, docs, legacy modernization
6. Privacy & Safeguards (10-15%) — content exclusions, duplication detection, org policies

Keep answers under 120 words. Use bullet points for lists. Be accurate and exam-focused.`;

export async function* streamChat(messages) {
  const response = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ],
      stream: true,
      temperature: 0.3,
      max_tokens: 300
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama error ${response.status}: ${await response.text()}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') return;
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        // skip malformed chunks
      }
    }
  }
}

export async function checkOllama() {
  try {
    const r = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(2000) });
    if (!r.ok) return false;
    const d = await r.json();
    return d.models?.some(m => m.name.startsWith('llama3.2'));
  } catch {
    return false;
  }
}
