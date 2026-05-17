/* global L */
import { fmtDist, fmtTime } from './utils.js';

let map, routeLayer, carLayer;

export function initMap() {
  map = L.map('map', { zoomControl: true, attributionControl: true }).setView([48.573, 7.752], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);

  L.tileLayer('https://tile.waymarkedtrails.org/cycling/{z}/{x}/{y}.png', {
    opacity: 0.4,
    maxZoom: 19
  }).addTo(map);
}

export function renderMapRoute(from, to, bike, car, prefs) {
  [routeLayer, carLayer].forEach(l => { if (l) map.removeLayer(l); });

  // Recalculate container size in case the panel grew (mobile layout reflow)
  map.invalidateSize();

  if (bike?.points?.length > 1) {
    routeLayer = L.polyline(bike.points, { color: '#2d5a3d', weight: 5, opacity: 0.9 }).addTo(map);
    routeLayer.bindPopup(`🚲 ${fmtDist(bike.distanceM)} · ${fmtTime(bike.durationS)}`);
  }

  if (car?.points?.length > 1 && prefs['avoid-traffic']) {
    carLayer = L.polyline(car.points, {
      color: '#c47a00', weight: 2, opacity: 0.35, dashArray: '6,8'
    }).addTo(map);
  }

  const dot = (color) => L.divIcon({
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
    iconSize: [14, 14], iconAnchor: [7, 7]
  });

  L.marker([from.lat, from.lng], { icon: dot('#2d5a3d') }).addTo(map).bindPopup(`🟢 ${from.name}`);
  L.marker([to.lat, to.lng],     { icon: dot('#c0392b') }).addTo(map).bindPopup(`🔴 ${to.name}`);

  const pts = bike?.points || [];
  if (pts.length > 0) map.fitBounds(L.latLngBounds(pts), { padding: [50, 50] });

  document.getElementById('mapLegend').style.display = 'block';
  const emptyMap = document.getElementById('emptyMap');
  emptyMap.style.opacity = '0';
  setTimeout(() => (emptyMap.style.display = 'none'), 300);

  // On mobile, scroll the map into view so the user can see the route
  if (window.innerWidth <= 860) {
    setTimeout(() => {
      document.querySelector('.map-col')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 350);
  }
}
