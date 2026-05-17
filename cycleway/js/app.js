import { geocode }                    from './geocoding.js';
import { getBikeRoute, getCarRoute }  from './routing.js';
import { getWeather }                 from './weather.js';
import { getTrafficFlow }             from './traffic.js';
import { initMap, renderMapRoute, scrollToMap } from './map.js';
import { toast, setBusy, renderWeather, renderRoute, renderSafetyBriefing, confirmHighRisk } from './ui.js';
import { initAssistant, setContext }  from './assistant.js';
import { analyzeRouteSafety }         from './safety-agent.js';

// ── Preference state ───────────────────────────────────────────────────────────
const prefs = {
  safest: true,
  fastest: false,
  lanes: true,
  scenic: false,
  'avoid-traffic': true
};

function togglePref(key) {
  prefs[key] = !prefs[key];
  document.getElementById('pref-' + key).classList.toggle('on', prefs[key]);
}

function swapLocs() {
  const a = document.getElementById('fromIn');
  const b = document.getElementById('toIn');
  [a.value, b.value] = [b.value, a.value];
}

// ── API key persistence ────────────────────────────────────────────────────────
function loadKeys() {
  ['ghKey', 'ttKey'].forEach(id => {
    const saved = localStorage.getItem('cw_' + id);
    if (saved) document.getElementById(id).value = saved;
    document.getElementById(id).addEventListener('change', e =>
      localStorage.setItem('cw_' + id, e.target.value)
    );
  });
}

// ── Main route flow ────────────────────────────────────────────────────────────
async function findRoute() {
  const fromQ = document.getElementById('fromIn').value.trim();
  const toQ   = document.getElementById('toIn').value.trim();
  if (!fromQ || !toQ) { toast('Enter both origin and destination', 'err'); return; }

  const ghKey = document.getElementById('ghKey').value.trim();
  const ttKey = document.getElementById('ttKey').value.trim();

  setBusy(true);

  try {
    toast('📍 Finding locations…');
    let from, to;
    try {
      [from, to] = await Promise.all([geocode(fromQ), geocode(toQ)]);
    } catch (e) { throw new Error(`Geocode: ${e.message}`); }

    toast('🌤️ Loading weather from Open-Meteo…');
    let wx;
    try {
      wx = await getWeather(from.lat, from.lng);
    } catch (e) { throw new Error(`Weather: ${e.message}`); }

    toast('🚲 Planning bicycle route…');
    let bike;
    try {
      bike = await getBikeRoute(from, to, ghKey, prefs);
    } catch (e) { throw new Error(`Routing: ${e.message}`); }

    toast('🚗 Correlating car traffic data…');
    const [car, traffic] = await Promise.all([
      getCarRoute(from, to),
      getTrafficFlow((from.lat + to.lat) / 2, (from.lng + to.lng) / 2, ttKey)
    ]);

    renderWeather(wx);
    renderRoute(bike, car, traffic, from, to, prefs);
    renderMapRoute(from, to, bike, car, prefs);

    // ── Safety Analysis Agent (sub-agent, runs in parallel with UI render) ──
    toast('🛡️ Safety agent analysing conditions…');
    const safety = await analyzeRouteSafety(bike, wx, traffic, from, to);
    renderSafetyBriefing(safety);

    // ── Human-in-the-loop: require confirmation for HIGH RISK routes ─────────
    if (safety?.verdict === 'HIGH RISK') {
      setBusy(false);
      const proceed = await confirmHighRisk(safety.reason);
      if (!proceed) {
        toast('Route cancelled — check conditions before riding.', 'err');
        return;
      }
      setBusy(true);
    }

    setContext(bike, wx, traffic, from, to);
    scrollToMap(); // after all panel content is in the DOM
    toast('✅ Route ready — happy cycling!', 'ok');
  } catch (err) {
    toast(`❌ ${err.message}`, 'err');
    console.error('[CycleWay]', err);
  }

  setBusy(false);
}

// ── Init ───────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  loadKeys();
  initAssistant();

  document.getElementById('goBtn').addEventListener('click', findRoute);
  document.getElementById('swapBtn').addEventListener('click', swapLocs);
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') findRoute();
  });

  document.querySelectorAll('[data-pref]').forEach(chip => {
    chip.addEventListener('click', () => togglePref(chip.dataset.pref));
  });
});
