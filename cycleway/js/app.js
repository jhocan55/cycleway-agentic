import { geocode }                    from './geocoding.js';
import { getBikeRoute, getCarRoute }  from './routing.js';
import { getWeather }                 from './weather.js';
import { getTrafficFlow }             from './traffic.js';
import { initMap, renderMapRoute }    from './map.js';
import { toast, setBusy, renderWeather, renderRoute } from './ui.js';
import { initAssistant, setContext }  from './assistant.js';

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
    const [from, to] = await Promise.all([geocode(fromQ), geocode(toQ)]);

    toast('🌤️ Loading weather from Open-Meteo…');
    const wx = await getWeather(from.lat, from.lng);

    toast('🚲 Planning bicycle route…');
    const bike = await getBikeRoute(from, to, ghKey, prefs);

    toast('🚗 Correlating car traffic data…');
    const [car, traffic] = await Promise.all([
      getCarRoute(from, to),
      getTrafficFlow((from.lat + to.lat) / 2, (from.lng + to.lng) / 2, ttKey)
    ]);

    renderWeather(wx);
    renderRoute(bike, car, traffic, from, to, prefs);
    renderMapRoute(from, to, bike, car, prefs);
    setContext(bike, wx, traffic, from, to);

    toast('✅ Route ready — happy cycling!', 'ok');
  } catch (err) {
    toast(`❌ ${err.message}`, 'err');
    console.error(err);
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
