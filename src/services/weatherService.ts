import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 10_000;

/** Erro tipado da camada de dados, com mensagem amigável ao usuário. */
export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

/** Faz um fetch com timeout via AbortController. */
async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new WeatherServiceError('A requisição demorou demais. Tente novamente.');
    }
    throw new WeatherServiceError('Falha de rede. Verifique sua conexão.');
  } finally {
    clearTimeout(timeout);
  }
}

interface GeocodingResult {
  id: number;
  name: string;
  country?: string | null;
  admin1?: string | null;
  latitude: number;
  longitude: number;
}

/**
 * Busca cidades por nome (geocoding). Retorna lista vazia quando não há
 * resultados — o estado "vazio" é tratado pela camada de UI.
 */
export async function searchCities(name: string): Promise<City[]> {
  const query = name.trim();
  if (!query) return [];

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=5&language=pt&format=json`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) {
    throw new WeatherServiceError('Não foi possível buscar a cidade. Tente novamente.');
  }

  const data = (await res.json()) as { results?: GeocodingResult[] };
  if (!data.results) return [];

  return data.results.map((r) => ({
    id: r.id,
    name: r.name,
    country: r.country ?? null,
    region: r.admin1 ?? null,
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

interface ForecastResponse {
  timezone?: string;
  utc_offset_seconds?: number;
  current?: {
    time?: string;
    temperature_2m?: number | null;
    relative_humidity_2m?: number | null;
    wind_speed_10m?: number | null;
    surface_pressure?: number | null;
    precipitation?: number | null;
    weather_code?: number | null;
  };
  daily?: {
    time?: Array<string | null>;
    weather_code?: Array<number | null>;
    temperature_2m_max?: Array<number | null>;
    temperature_2m_min?: Array<number | null>;
    precipitation_probability_max?: Array<number | null>;
  };
}

function mapCurrent(c: NonNullable<ForecastResponse['current']>): CurrentWeather {
  return {
    observedAtLocal: c.time ?? null,
    temperatureC: c.temperature_2m ?? null,
    humidityPercent: c.relative_humidity_2m ?? null,
    windSpeedKmh: c.wind_speed_10m ?? null,
    pressureHpa: c.surface_pressure ?? null,
    precipitationMm: c.precipitation ?? null,
    weatherCode: c.weather_code ?? null,
  };
}

function addCalendarDays(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const value = new Date(Date.UTC(year, month - 1, day + days));
  const monthText = String(value.getUTCMonth() + 1).padStart(2, '0');
  const dayText = String(value.getUTCDate()).padStart(2, '0');
  return `${value.getUTCFullYear()}-${monthText}-${dayText}`;
}

function mapForecast(
  daily: NonNullable<ForecastResponse['daily']>,
  currentTime: string | undefined,
): ForecastDay[] {
  const dates = daily.time ?? [];
  const startDate = dates[0] ?? currentTime?.slice(0, 10);
  if (!startDate) {
    throw new WeatherServiceError('Resposta de previsão sem data de referência.');
  }

  return Array.from({ length: 5 }, (_, index) => ({
    date: dates[index] ?? addCalendarDays(startDate, index),
    weatherCode: daily.weather_code?.[index] ?? null,
    minTemperatureC: daily.temperature_2m_min?.[index] ?? null,
    maxTemperatureC: daily.temperature_2m_max?.[index] ?? null,
    precipitationProbabilityMaxPercent:
      daily.precipitation_probability_max?.[index] ?? null,
  }));
}

/**
 * Busca o clima atual e a previsão de 5 dias para uma cidade.
 * Temperaturas retornam em Celsius (conversão fica na UI).
 */
export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,precipitation,weather_code',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    forecast_days: '5',
    timezone: 'auto',
  });

  const res = await fetchWithTimeout(`${FORECAST_URL}?${params.toString()}`);
  if (!res.ok) {
    throw new WeatherServiceError('Não foi possível carregar o clima. Tente novamente.');
  }

  const data = (await res.json()) as ForecastResponse;
  if (!data.current || !data.daily) {
    throw new WeatherServiceError('Resposta de clima incompleta. Tente novamente.');
  }

  return {
    city,
    current: mapCurrent(data.current),
    forecast: mapForecast(data.daily, data.current.time),
    timezone: data.timezone ?? null,
    utcOffsetSeconds: data.utc_offset_seconds ?? null,
    receivedAt: new Date().toISOString(),
  };
}
