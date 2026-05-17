import { OSRM_BIKE, OSRM_CAR } from './config.js';

export async function getBikeRoute(from, to, ghKey, prefs) {
  if (ghKey) {
    return _graphhopper(from, to, ghKey, prefs);
  }
  return _osrmBike(from, to);
}

async function _graphhopper(from, to, ghKey, prefs) {
  const profile = prefs.fastest ? 'racingbike' : 'bike';
  const url = `https://graphhopper.com/api/1/route`
    + `?point=${from.lat},${from.lng}&point=${to.lat},${to.lng}`
    + `&vehicle=${profile}&locale=en&instructions=true&calc_points=true&points_encoded=false&key=${ghKey}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error('GraphHopper error ' + r.status);
  const d = await r.json();
  if (d.message) throw new Error(d.message);
  const p = d.paths[0];
  return {
    points: p.points.coordinates.map(c => [c[1], c[0]]),
    distanceM: p.distance,
    durationS: p.time / 1000,
    instructions: p.instructions || [],
    ascent: p.ascend,
    descent: p.descend,
    source: 'GraphHopper'
  };
}

async function _osrmBike(from, to) {
  const url = `${OSRM_BIKE}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&steps=true`;
  const r = await fetch(url);
  if (!r.ok) throw new Error('Routing service unavailable');
  const d = await r.json();
  if (d.code !== 'Ok') throw new Error('No bike route found between these points');
  const route = d.routes[0];
  const steps = route.legs[0]?.steps || [];
  return {
    points: route.geometry.coordinates.map(c => [c[1], c[0]]),
    distanceM: route.distance,
    durationS: route.duration,
    instructions: steps.map(s => ({
      text: [s.maneuver?.type, s.name].filter(Boolean).join(' '),
      distance: s.distance
    })),
    ascent: null,
    descent: null,
    source: 'OSRM/OSM'
  };
}

export async function getCarRoute(from, to) {
  try {
    const url = `${OSRM_CAR}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&steps=true`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const d = await r.json();
    if (d.code !== 'Ok') return null;
    return {
      points: d.routes[0].geometry.coordinates.map(c => [c[1], c[0]]),
      distanceM: d.routes[0].distance,
      durationS: d.routes[0].duration
    };
  } catch {
    return null;
  }
}
