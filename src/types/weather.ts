/**
 * Contratos de domínio compartilhados do Weather App.
 *
 * Decisão de arquitetura: as temperaturas são sempre armazenadas em Celsius
 * internamente e convertidas apenas na camada de apresentação. Assim, a troca
 * de unidade (C/F) nunca dispara um novo request.
 */

export type Unit = 'celsius' | 'fahrenheit';
export type TemperatureUnit = Unit;

export type WeatherValue<T> = T | null;

/** Localização normalizada a partir do geocoding. */
export interface City {
  id: number;
  name: string;
  country: string | null;
  region: string | null;
  latitude: number;
  longitude: number;
}

/** Condições atuais normalizadas; temperatura sempre em °C. */
export interface CurrentWeather {
  temperatureC: WeatherValue<number>;
  weatherCode: WeatherValue<number>;
  humidityPercent: WeatherValue<number>;
  windSpeedKmh: WeatherValue<number>;
  pressureHpa: WeatherValue<number>;
  precipitationMm: WeatherValue<number>;
  observedAtLocal: string | null;
}

/** Dados diários da previsão no fuso local da cidade. */
export interface ForecastDay {
  date: string; // YYYY-MM-DD
  weatherCode: WeatherValue<number>;
  minTemperatureC: WeatherValue<number>;
  maxTemperatureC: WeatherValue<number>;
  precipitationProbabilityMaxPercent: WeatherValue<number>;
}

/** Cidade, condições atuais e cinco posições da previsão. */
export interface WeatherData {
  city: City;
  current: CurrentWeather;
  forecast: ForecastDay[];
  timezone: string | null;
  utcOffsetSeconds: number | null;
  receivedAt: string;
}
