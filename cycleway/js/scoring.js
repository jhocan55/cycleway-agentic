export function cyclingScore(wx) {
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

export function windDirLabel(deg) {
  return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(deg / 45) % 8];
}

export function clothingAdvice(wx) {
  const t      = wx.temp;
  const rain   = wx.precipProb > 35 || wx.precip > 0.2;
  const wind   = wx.windSpeed > 20;
  const freeze = t <= 0;
  const cold   = t > 0  && t <= 5;
  const cool   = t > 5  && t <= 15;
  const warm   = t > 15 && t <= 25;

  const items = [
    _top(freeze, cold, cool, warm, rain),
    _legs(freeze, cold, cool, warm, rain),
    _hands(freeze, cold, cool, warm),
    _feet(freeze, cold, cool, rain),
    _head(freeze, cold, cool, wind, wx.uv)
  ];

  const extras = [];
  if (rain)        extras.push('🌧️ Mudguards strongly recommended today');
  if (wind)        extras.push(`💨 Headwind ${wx.windDir ? windDirLabel(wx.windDir) : ''} — plan effort for return leg`);
  if (wx.uv > 7)  extras.push('☀️ UV index very high — apply sunscreen');
  if (freeze)      extras.push('🧊 Ice possible — check route surface before riding');
  if (wx.windGust > 40) extras.push('⚡ Strong gusts — extra care on exposed sections');

  return { items, extras };
}

function _top(freeze, cold, cool, warm, rain) {
  if (freeze) return { zone: 'Top', rec: 'Heavy thermal base + fleece jersey + windproof jacket', tag: 'cold' };
  if (cold)   return { zone: 'Top', rec: 'Thermal base layer + thermal jacket', tag: 'cold' };
  if (cool)   return { zone: 'Top', rec: rain ? 'Long-sleeve jersey + waterproof jacket' : 'Long-sleeve jersey + wind vest', tag: rain ? 'rain' : 'cold' };
  if (warm)   return { zone: 'Top', rec: rain ? 'Short-sleeve jersey + light rain jacket' : 'Short-sleeve jersey + arm warmers', tag: rain ? 'rain' : 'fine' };
  return       { zone: 'Top', rec: 'Short-sleeve jersey, breathable fabric, sunscreen', tag: 'warm' };
}

function _legs(freeze, cold, cool, warm, rain) {
  if (freeze) return { zone: 'Legs', rec: 'Thermal bib tights + leg warmers', tag: 'cold' };
  if (cold)   return { zone: 'Legs', rec: 'Thermal bib tights', tag: 'cold' };
  if (cool)   return { zone: 'Legs', rec: rain ? 'Bib tights + waterproof overpants' : 'Bib tights or shorts + knee warmers', tag: rain ? 'rain' : 'cold' };
  if (warm)   return { zone: 'Legs', rec: 'Cycling bibs or shorts + optional leg warmers', tag: 'fine' };
  return       { zone: 'Legs', rec: 'Lightweight cycling shorts / bibs', tag: 'warm' };
}

function _hands(freeze, cold, cool, warm) {
  if (freeze || cold) return { zone: 'Hands', rec: 'Winter gloves (insulated, windproof)', tag: 'cold' };
  if (cool)           return { zone: 'Hands', rec: 'Full-finger gloves, wind-resistant', tag: 'cold' };
  if (warm)           return { zone: 'Hands', rec: 'Fingerless gloves recommended', tag: 'fine' };
  return               { zone: 'Hands', rec: 'No gloves or fingerless only', tag: 'warm' };
}

function _feet(freeze, cold, cool, rain) {
  if (freeze)       return { zone: 'Feet', rec: 'Winter boots or shoe covers + wool socks (2 pairs)', tag: 'cold' };
  if (cold || cool) return { zone: 'Feet', rec: rain ? 'Waterproof overshoes + wool socks' : 'Shoe covers + wool/thermal socks', tag: rain ? 'rain' : 'cold' };
  return             { zone: 'Feet', rec: 'Lightweight cycling shoes + thin socks', tag: 'fine' };
}

function _head(freeze, cold, cool, wind, uv) {
  if (freeze || cold)  return { zone: 'Head', rec: 'Thermal cap under helmet + buff/neck gaiter', tag: 'cold' };
  if (cool && wind)    return { zone: 'Head', rec: 'Thin skull cap under helmet', tag: 'cold' };
  return                { zone: 'Head', rec: uv > 5 ? 'Helmet + sunglasses (UV index high)' : 'Helmet + cycling cap', tag: uv > 5 ? 'warm' : 'fine' };
}
