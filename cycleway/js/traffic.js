import { TT_FLOW } from './config.js';

export async function getTrafficFlow(lat, lng, key) {
  if (!key) return null;
  try {
    const r = await fetch(`${TT_FLOW}/14/json?point=${lat},${lng}&key=${key}`);
    if (!r.ok) return null;
    const d = await r.json();
    const f = d.flowSegmentData;
    const ratio = f.currentSpeed / Math.max(f.freeFlowSpeed, 1);
    return {
      currentSpeed:  f.currentSpeed,
      freeFlowSpeed: f.freeFlowSpeed,
      ratio,
      level: ratio >= 0.8 ? 'free' : ratio >= 0.5 ? 'moderate' : 'heavy',
      label: ratio >= 0.8 ? 'Light traffic' : ratio >= 0.5 ? 'Moderate traffic' : 'Heavy congestion',
      emoji: ratio >= 0.8 ? '🟢' : ratio >= 0.5 ? '🟡' : '🔴'
    };
  } catch {
    return null;
  }
}
