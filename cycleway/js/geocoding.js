import { NOMINATIM } from './config.js';

export async function geocode(q) {
  const r = await fetch(
    `${NOMINATIM}?format=json&q=${encodeURIComponent(q)}&limit=1`,
    { headers: { 'Accept-Language': 'en', 'User-Agent': 'CycleWay/1.0 (route-intelligence)' } }
  );
  const d = await r.json();
  if (!d.length) throw new Error(`Place not found: "${q}"`);
  return {
    lat: +d[0].lat,
    lng: +d[0].lon,
    name: d[0].display_name.split(',').slice(0, 2).join(', ')
  };
}
