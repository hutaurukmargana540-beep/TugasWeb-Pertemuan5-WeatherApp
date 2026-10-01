const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

// Open-Meteo tidak membutuhkan API key untuk penggunaan non-komersial.
const state = {
  unit: localStorage.getItem('weatherUnit') || 'metric',
  history: JSON.parse(localStorage.getItem('weatherHistory') || '[]'),
  lastLocation: null
};

const $ = (selector) => document.querySelector(selector);
const els = {
  form: $('#searchForm'), city: $('#cityInput'), unit: $('#unitToggle'), status: $('#status'), history: $('#history'),
  weather: $('#weatherSection'), forecast: $('#forecastSection'), empty: $('#emptyState'),
  location: $('#locationName'), updated: $('#updatedAt'), icon: $('#weatherIcon'),
  temp: $('#temperature'), degree: $('#degree'), desc: $('#description'), feels: $('#feelsLike'),
  humidity: $('#humidity'), wind: $('#wind'), pressure: $('#pressure'), visibility: $('#visibility'),
  forecastGrid: $('#forecastGrid')
};

const weatherCodes = {
  0: ['Cerah', '☀️'],
  1: ['Sebagian besar cerah', '🌤️'],
  2: ['Berawan sebagian', '⛅'],
  3: ['Mendung', '☁️'],
  45: ['Berkabut', '🌫️'],
  48: ['Kabut beku', '🌫️'],
  51: ['Gerimis ringan', '🌦️'],
  53: ['Gerimis sedang', '🌦️'],
  55: ['Gerimis lebat', '🌧️'],
  56: ['Gerimis beku ringan', '🌧️'],
  57: ['Gerimis beku lebat', '🌧️'],
  61: ['Hujan ringan', '🌦️'],
  63: ['Hujan sedang', '🌧️'],
  65: ['Hujan lebat', '🌧️'],
  66: ['Hujan beku ringan', '🌨️'],
  67: ['Hujan beku lebat', '🌨️'],
  71: ['Salju ringan', '🌨️'],
  73: ['Salju sedang', '❄️'],
  75: ['Salju lebat', '❄️'],
  77: ['Butiran salju', '❄️'],
  80: ['Hujan sesekali ringan', '🌦️'],
  81: ['Hujan sesekali sedang', '🌧️'],
  82: ['Hujan sesekali lebat', '⛈️'],
  85: ['Hujan salju ringan', '🌨️'],
  86: ['Hujan salju lebat', '🌨️'],
  95: ['Badai petir', '⛈️'],
  96: ['Badai petir dengan hujan es ringan', '⛈️'],
  99: ['Badai petir dengan hujan es lebat', '⛈️']
};

function weatherInfo(code) {
  return weatherCodes[code] || ['Kondisi tidak diketahui', '🌡️'];
}

function setStatus(message = '', type = '') {
  els.status.textContent = message;
  els.status.className = `status ${type}`;
}

function updateUnitButton() {
  const symbol = state.unit === 'metric' ? '°C' : '°F';
  els.unit.textContent = symbol;
  els.degree.textContent = symbol;
}

function saveHistory(city) {
  state.history = [city, ...state.history.filter(item => item.toLowerCase() !== city.toLowerCase())].slice(0, 5);
  localStorage.setItem('weatherHistory', JSON.stringify(state.history));
  renderHistory();
}

function renderHistory() {
  els.history.innerHTML = state.history.length
    ? state.history.map(city => `<button type="button" data-city="${city.replace(/"/g, '&quot;')}">${city}</button>`).join('')
    : '';
}

function setLoading(isLoading) {
  const button = els.form.querySelector('button');
  button.disabled = isLoading;
  button.textContent = isLoading ? 'Memuat...' : 'Cari Cuaca';
  if (isLoading) setStatus('Mengambil data cuaca...', 'loading');
}

async function fetchJSON(url) {
  const response = await fetch(url);
  let data = {};
  try { data = await response.json(); } catch (_) { /* response bukan JSON */ }
  if (!response.ok) {
    const error = new Error(data.reason || data.message || 'Gagal mengambil data.');
    error.status = response.status;
    throw error;
  }
  return data;
}

async function geocodeCity(city) {
  const params = new URLSearchParams({ name: city, count: '1', language: 'id', format: 'json' });
  const data = await fetchJSON(`${GEOCODING_API}?${params}`);
  if (!data.results?.length) {
    const error = new Error(`Kota “${city}” tidak ditemukan (404). Coba nama kota lain.`);
    error.status = 404;
    throw error;
  }
  return data.results[0];
}

async function getWeather(city) {
  const place = await geocodeCity(city);
  const params = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: 'auto',
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure,visibility',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,precipitation_probability_max',
    forecast_days: '5'
  });
  const weather = await fetchJSON(`${WEATHER_API}?${params}`);
  return { place, weather };
}

function formatDate(dateString, options = {}) {
  return new Intl.DateTimeFormat('id-ID', options).format(new Date(`${dateString}T12:00:00`));
}

function formatCurrentTime(dateString) {
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(dateString));
}

function renderCurrent(place, data) {
  const unit = state.unit === 'metric' ? '°C' : '°F';
  const windUnit = state.unit === 'metric' ? 'km/j' : 'mph';
  const temp = state.unit === 'metric' ? data.current.temperature_2m : (data.current.temperature_2m * 9 / 5) + 32;
  const feels = state.unit === 'metric' ? data.current.apparent_temperature : (data.current.apparent_temperature * 9 / 5) + 32;
  const wind = state.unit === 'metric' ? data.current.wind_speed_10m : data.current.wind_speed_10m / 1.60934;
  const [description, icon] = weatherInfo(data.current.weather_code);

  els.location.textContent = `${place.name}${place.country ? `, ${place.country}` : ''}`;
  els.updated.textContent = `Diperbarui ${formatCurrentTime(data.current.time)}`;
  els.icon.textContent = icon;
  els.icon.alt = description;
  els.temp.textContent = Math.round(temp);
  els.degree.textContent = unit;
  els.desc.textContent = description;
  els.feels.textContent = `${Math.round(feels)}${unit}`;
  els.humidity.textContent = `${data.current.relative_humidity_2m}%`;
  els.wind.textContent = `${Math.round(wind * 10) / 10} ${windUnit}`;
  els.pressure.textContent = `${Math.round(data.current.surface_pressure)} hPa`;
  els.visibility.textContent = `${Math.round((data.current.visibility / 1000) * 10) / 10} km`;
}

function renderForecast(data) {
  const daily = data.daily;
  // Array method: map untuk membentuk kartu forecast dari data harian.
  els.forecastGrid.innerHTML = daily.time.map((date, index) => {
    const [description, icon] = weatherInfo(daily.weather_code[index]);
    const maxC = daily.temperature_2m_max[index];
    const minC = daily.temperature_2m_min[index];
    const convert = (value) => state.unit === 'metric' ? value : (value * 9 / 5) + 32;
    const unit = state.unit === 'metric' ? '°C' : '°F';
    return `
      <article class="forecast-item">
        <div class="day">${formatDate(date, { weekday: 'short', day: 'numeric', month: 'short' })}</div>
        <div class="forecast-icon" role="img" aria-label="${description}">${icon}</div>
        <div class="forecast-temp">${Math.round(convert(maxC))}${unit}</div>
        <div class="forecast-desc">${description}</div>
        <div class="range">Min ${Math.round(convert(minC))}${unit} · Hujan ${daily.precipitation_probability_max[index] ?? 0}%</div>
      </article>`;
  }).join('');
}

function showWeather(result) {
  renderCurrent(result.place, result.weather);
  renderForecast(result.weather);
  els.weather.classList.remove('hidden');
  els.forecast.classList.remove('hidden');
  els.empty.classList.add('hidden');
  els.weather.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function searchCity(city) {
  const cleanCity = city.trim();
  if (!cleanCity) return;
  setLoading(true);
  try {
    const result = await getWeather(cleanCity);
    state.lastLocation = result.place;
    showWeather(result);
    saveHistory(result.place.name);
    setStatus(`Data cuaca untuk ${result.place.name} berhasil dimuat.`, 'success');
  } catch (error) {
    if (error.status === 404) setStatus(error.message, 'error');
    else if (error instanceof TypeError) setStatus('Network error: periksa koneksi internet atau izin akses API.', 'error');
    else setStatus(error.message || 'Terjadi kesalahan saat mengambil data.', 'error');
  } finally {
    setLoading(false);
  }
}

els.form.addEventListener('submit', (event) => {
  event.preventDefault();
  searchCity(els.city.value);
});

els.unit.addEventListener('click', async () => {
  state.unit = state.unit === 'metric' ? 'imperial' : 'metric';
  localStorage.setItem('weatherUnit', state.unit);
  updateUnitButton();
  if (state.lastLocation) {
    const result = await getWeather(state.lastLocation.name);
    showWeather(result);
  }
});

els.history.addEventListener('click', (event) => {
  const button = event.target.closest('[data-city]');
  if (!button) return;
  els.city.value = button.dataset.city;
  searchCity(button.dataset.city);
});

updateUnitButton();
renderHistory();
