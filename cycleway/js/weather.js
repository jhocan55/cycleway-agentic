import { OPEN_METEO } from './config.js';

const WMO = {
  0:  ['Clear sky', '☀️'],         1:  ['Mainly clear', '🌤️'],       2:  ['Partly cloudy', '⛅'],
  3:  ['Overcast', '☁️'],           45: ['Foggy', '🌫️'],              48: ['Icy fog', '🌫️'],
  51: ['Light drizzle', '🌦️'],     53: ['Drizzle', '🌧️'],            55: ['Heavy drizzle', '🌧️'],
  61: ['Light rain', '🌦️'],        63: ['Rain', '🌧️'],               65: ['Heavy rain', '🌧️'],
  71: ['Light snow', '🌨️'],        73: ['Snow', '❄️'],               75: ['Heavy snow', '❄️'],
  77: ['Snow grains', '❄️'],       80: ['Light showers', '🌦️'],      81: ['Showers', '🌧️'],
  82: ['Violent showers', '⛈️'],   85: ['Snow showers', '🌨️'],      86: ['Heavy snow showers', '❄️'],
  95: ['Thunderstorm', '⛈️'],      96: ['Thunderstorm w/ hail', '⛈️'], 99: ['Severe thunderstorm', '⛈️']
};

export function wxCode(code) {
  return WMO[code] || ['Unknown', '🌡️'];
}

export async function getWeather(lat, lng) {
  const vars = [
    'temperature_2m', 'apparent_temperature', 'precipitation_probability',
    'precipitation', 'wind_speed_10m', 'wind_direction_10m',
    'wind_gusts_10m', 'weathercode', 'relative_humidity_2m', 'uv_index'
  ].join(',');
  const r = await fetch(
    `${OPEN_METEO}?latitude=${lat}&longitude=${lng}&current=${vars}&wind_speed_unit=kmh&timezone=auto`
  );
  if (!r.ok) throw new Error('Weather unavailable');
  const d = await r.json();
  const c = d.current;
  return {
    temp:       Math.round(c.temperature_2m),
    feelsLike:  Math.round(c.apparent_temperature),
    precipProb: c.precipitation_probability,
    precip:     c.precipitation,
    windSpeed:  Math.round(c.wind_speed_10m),
    windGust:   Math.round(c.wind_gusts_10m),
    windDir:    c.wind_direction_10m,
    humidity:   c.relative_humidity_2m,
    code:       c.weathercode,
    uv:         c.uv_index
  };
}
