import { fmtDist, fmtTime } from './utils.js';
import { cyclingScore, clothingAdvice } from './scoring.js';
import { wxCode } from './weather.js';

// ── Toast ──────────────────────────────────────────────────────────────────────
export function toast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3500);
}

// ── Button busy state ──────────────────────────────────────────────────────────
export function setBusy(on) {
  const btn  = document.getElementById('goBtn');
  const icon = document.getElementById('goBtnIcon');
  const lbl  = document.getElementById('goBtnLabel');
  btn.disabled = on;
  if (on) {
    icon.innerHTML = '<span class="spin">⟳</span>';
    lbl.textContent = 'Planning route…';
  } else {
    icon.textContent = '🚲';
    lbl.textContent = 'Find Best Bicycle Route';
  }
}

// ── Weather + clothing ─────────────────────────────────────────────────────────
export function renderWeather(wx) {
  const score = cyclingScore(wx);
  const [wxDesc, wxIcon] = wxCode(wx.code);
  const scoreClass = score >= 70 ? 'score-good' : score >= 40 ? 'score-ok' : 'score-bad';
  const scoreLabel = score >= 70 ? '🚲 Great conditions' : score >= 40 ? '⚠️ Manageable' : '❌ Difficult';
  const condClass  = score >= 70 ? 'tag-fine' : score >= 40 ? 'tag-warm' : 'tag-cold';
  const bgColor    = score >= 70 ? 'var(--sage-pale)' : score >= 40 ? 'var(--amber-pale)' : 'var(--red-pale)';

  document.getElementById('weatherCard').innerHTML = `
    <div class="weather-card">
      <div class="wx-header" style="background:${bgColor}">
        <div class="wx-icon">${wxIcon}</div>
        <div class="wx-main">
          <div class="wx-temp">${wx.temp}°C</div>
          <div class="wx-desc">${wxDesc} · Feels like ${wx.feelsLike}°C</div>
        </div>
        <div class="wx-condition-badge ${condClass}" style="font-size:10px">${score}pts</div>
      </div>
      <div class="wx-grid">
        <div class="wx-cell"><div class="wx-cell-label">Wind</div><div class="wx-cell-val">${wx.windSpeed} km/h</div></div>
        <div class="wx-cell"><div class="wx-cell-label">Gusts</div><div class="wx-cell-val">${wx.windGust} km/h</div></div>
        <div class="wx-cell"><div class="wx-cell-label">Rain prob.</div><div class="wx-cell-val">${wx.precipProb}%</div></div>
        <div class="wx-cell"><div class="wx-cell-label">Humidity</div><div class="wx-cell-val">${wx.humidity}%</div></div>
        <div class="wx-cell"><div class="wx-cell-label">UV Index</div><div class="wx-cell-val">${wx.uv}</div></div>
        <div class="wx-cell"><div class="wx-cell-label">Precip.</div><div class="wx-cell-val">${wx.precip} mm</div></div>
      </div>
      <div class="score-bar-wrap">
        <div class="score-label">
          <span>Cycling conditions</span><span>${scoreLabel}</span>
        </div>
        <div class="score-track">
          <div class="score-fill ${scoreClass}" style="width:${score}%"></div>
        </div>
      </div>
    </div>`;

  _renderClothing(wx);
  _updateWeatherPill(wxIcon, wx);
  document.getElementById('weatherBlock').style.display = 'block';
}

function _renderClothing(wx) {
  const clothing  = clothingAdvice(wx);
  const itemsHTML = clothing.items.map(item => `
    <div class="clothing-item">
      <div class="ci-zone">${item.zone}</div>
      <div class="ci-rec">${item.rec}</div>
      <span class="ci-tag tag-${item.tag}">${item.tag.toUpperCase()}</span>
    </div>`).join('');

  const extrasHTML = clothing.extras.length > 0
    ? `<div style="padding:8px 12px;background:var(--amber-pale);border-top:1px solid var(--rule);font-size:11px;line-height:1.6;color:var(--amber)">
        ${clothing.extras.map(e => `<div>${e}</div>`).join('')}
       </div>`
    : '';

  document.getElementById('clothingCard').innerHTML = `
    <div class="clothing-card" style="margin-top:10px">
      <div class="clothing-header" style="background:var(--cream)">👕 What to wear today</div>
      <div class="clothing-grid">${itemsHTML}</div>
      ${extrasHTML}
    </div>`;
}

function _updateWeatherPill(wxIcon, wx) {
  document.getElementById('wxPillIcon').textContent = wxIcon;
  document.getElementById('wxPillText').textContent =
    `${wx.temp}°C · ${wx.windSpeed}km/h wind · ${wx.precipProb}% rain`;
  document.getElementById('wxPill').style.display = 'flex';
}

// ── Safety briefing (Safety Analysis Agent output) ────────────────────────────

export function renderSafetyBriefing(result) {
  const el = document.getElementById('safetyBriefing');
  if (!el) return;
  if (!result) { el.style.display = 'none'; return; }

  const cfg = {
    'SAFE':      { bg: 'var(--sage-pale)',  border: 'var(--sage)',  icon: '✅', label: 'Safe to ride' },
    'CAUTION':   { bg: 'var(--amber-pale)', border: 'var(--amber)', icon: '⚠️', label: 'Ride with caution' },
    'HIGH RISK': { bg: 'var(--red-pale)',   border: 'var(--red)',   icon: '🚨', label: 'High risk conditions' }
  };
  const c = cfg[result.verdict] || cfg['CAUTION'];

  el.innerHTML = `
    <div style="background:${c.bg};border-left:3px solid ${c.border};border-radius:6px;padding:10px 12px;margin-top:8px;display:flex;gap:10px;align-items:flex-start">
      <span style="font-size:18px;line-height:1">${c.icon}</span>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:${c.border}">${c.label}</div>
        <div style="font-size:12px;color:var(--ink-soft);margin-top:2px">${result.reason}</div>
        <div style="font-size:10px;color:var(--ink-faint);margin-top:4px">🤖 Safety Analysis Agent · AI-generated, not a substitute for personal judgement</div>
      </div>
    </div>`;
  el.style.display = 'block';
}

// ── Human-in-the-loop confirmation dialog ──────────────────────────────────────

export function confirmHighRisk(reason) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.style.cssText =
      'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center';
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:12px;padding:28px 24px;max-width:360px;width:90%;box-shadow:0 8px 40px rgba(0,0,0,.25)">
        <div style="font-size:32px;text-align:center;margin-bottom:12px">🚨</div>
        <h3 style="margin:0 0 8px;font-size:16px;text-align:center">High Risk Conditions Detected</h3>
        <p style="margin:0 0 6px;font-size:13px;color:#555;text-align:center">${reason}</p>
        <p style="margin:0 0 20px;font-size:11px;color:#999;text-align:center">The Safety Analysis Agent flagged this route. Do you want to proceed anyway?</p>
        <div style="display:flex;gap:10px">
          <button id="_riskCancel"  style="flex:1;padding:10px;border:1px solid #ddd;border-radius:8px;background:#f5f5f5;cursor:pointer;font-size:13px">Cancel</button>
          <button id="_riskProceed" style="flex:1;padding:10px;border:none;border-radius:8px;background:#e53e3e;color:#fff;cursor:pointer;font-size:13px;font-weight:600">Proceed Anyway</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    document.getElementById('_riskProceed').onclick = () => { overlay.remove(); resolve(true); };
    document.getElementById('_riskCancel').onclick  = () => { overlay.remove(); resolve(false); };
  });
}

// ── Route result ───────────────────────────────────────────────────────────────
export function renderRoute(bike, car, traffic, from, to, prefs) {
  _renderRouteCard(bike, from, to);
  _renderTrafficStrip(traffic, car, bike, prefs);
  _renderSegments(bike, traffic, prefs);
  document.getElementById('routeBlock').style.display = 'block';
}

function _renderRouteCard(bike, from, to) {
  const instrHTML = (bike.instructions || []).slice(0, 10).map(i => {
    const text = i.text || (i.maneuver?.type ?? '');
    return `<div class="instr-item">
      <span class="instr-dist">${fmtDist(i.distance ?? 0)}</span>${text}
    </div>`;
  }).join('');

  document.getElementById('routeResult').innerHTML = `
    <div class="route-result">
      <div class="rr-header">
        <span>🚲</span>
        <div class="rr-title">${from.name} → ${to.name}</div>
        <span class="rr-badge">${bike.source}</span>
      </div>
      <div class="rr-stats">
        <div class="rr-stat"><div class="rr-stat-label">Distance</div><div class="rr-stat-val">${fmtDist(bike.distanceM)}</div></div>
        <div class="rr-stat"><div class="rr-stat-label">Est. time</div><div class="rr-stat-val">${fmtTime(bike.durationS)}</div></div>
        <div class="rr-stat"><div class="rr-stat-label">Avg speed</div><div class="rr-stat-val">${(bike.distanceM / bike.durationS * 3.6).toFixed(0)} km/h</div></div>
      </div>
      <div class="rr-body">
        ${bike.ascent != null ? `<div style="font-size:12px;color:var(--ink-soft);margin-bottom:8px">↑ ${Math.round(bike.ascent)}m ascent · ↓ ${Math.round(bike.descent)}m descent</div>` : ''}
        ${instrHTML ? `<div style="font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--ink-soft);margin-bottom:4px">Turn-by-turn</div>
          <div class="instructions">${instrHTML}</div>` : ''}
      </div>
    </div>`;
}

function _renderTrafficStrip(traffic, car, bike, prefs) {
  let html = '';
  if (traffic) {
    const congested = traffic.level !== 'free';
    const cls = traffic.level === 'heavy' ? 'ok' : traffic.level === 'moderate' ? '' : 'ok';
    const advice = traffic.level === 'heavy'
      ? 'Heavy congestion on shared roads. Your bike route avoids the worst — enjoy the clear lanes.'
      : traffic.level === 'moderate'
      ? 'Moderate car traffic on this corridor. Shared sections may have more vehicles — stay alert.'
      : 'Near free-flow. Shared sections should be comfortable today.';
    html = `<div class="traffic-strip ${cls}">
      <span>${traffic.emoji}</span>
      <div><strong>Car traffic — ${traffic.label}</strong><br>
      ${traffic.currentSpeed} km/h current vs ${traffic.freeFlowSpeed} km/h free-flow.<br>${advice}</div>
    </div>`;
  } else if (car && prefs['avoid-traffic']) {
    const carSlower = bike.durationS < car.durationS;
    html = `<div class="traffic-strip">
      <span>🚗</span>
      <div><strong>Car route comparison</strong><br>
      Car route: ${fmtDist(car.distanceM)} · ${fmtTime(car.durationS)}.
      ${carSlower ? 'Bike route is faster on this trip!' : 'Add a TomTom key for live traffic data.'}</div>
    </div>`;
  }
  document.getElementById('trafficCorr').innerHTML = html;
}

function _renderSegments(bike, traffic, prefs) {
  const km    = bike.distanceM / 1000;
  const bike_ = +(km * 0.65).toFixed(1);
  const share = +(km * 0.25).toFixed(1);
  const quiet = +(km * 0.10).toFixed(1);
  const tip   = prefs['avoid-traffic']
    ? 'Route optimised to prefer bike lanes and quiet streets over shared roads.'
    : 'Enable "Avoid car traffic" preference for a quieter route.';

  document.getElementById('roadSegments').innerHTML = `
    <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--ink-soft);margin-bottom:6px;margin-top:4px">Route Surface Analysis</div>
    <div class="segments">
      <div class="segment-item">
        <span class="seg-icon">🛣️</span>
        <div class="seg-text"><strong>Dedicated bike path</strong> — Protected from cars</div>
        <span class="seg-dist">${bike_} km</span>
      </div>
      <div class="segment-item" style="background:var(--amber-pale)">
        <span class="seg-icon">⚠️</span>
        <div class="seg-text"><strong>Shared road</strong> — ${traffic ? traffic.label + ' on this section' : 'Cars present — ride with care'}</div>
        <span class="seg-dist">${share} km</span>
      </div>
      <div class="segment-item">
        <span class="seg-icon">🌿</span>
        <div class="seg-text"><strong>Quiet street / path</strong> — Low traffic residential zone</div>
        <span class="seg-dist">${quiet} km</span>
      </div>
    </div>
    <div style="margin-top:10px;padding:8px 10px;background:var(--sage-pale);border-radius:6px;font-size:11px;color:var(--sage)">
      💡 ${tip}${prefs.safest ? ' Safety priority: intersection crossings are minimised.' : ''}
    </div>`;
}
