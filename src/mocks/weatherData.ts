import type { WeatherData } from '../types/weather';

export const mockWeatherData: WeatherData = {
  city: {
    id: 3448439,
    name: 'São Paulo',
    country: 'Brasil',
    region: 'São Paulo',
    latitude: -23.5505,
    longitude: -46.6333,
  },
  current: {
    temperatureC: 22.4,
    weatherCode: 1,
    humidityPercent: 68,
    windSpeedKmh: 11,
    pressureHpa: 1013,
    precipitationMm: 0,
    observedAtLocal: '2026-11-05T12:00',
  },
  forecast: [
    {
      date: '2026-11-05',
      weatherCode: 1,
      minTemperatureC: 17.2,
      maxTemperatureC: 25.6,
      precipitationProbabilityMaxPercent: 10,
    },
    {
      date: '2026-11-06',
      weatherCode: 2,
      minTemperatureC: 18.1,
      maxTemperatureC: 26.3,
      precipitationProbabilityMaxPercent: 20,
    },
    {
      date: '2026-11-07',
      weatherCode: 61,
      minTemperatureC: 16.8,
      maxTemperatureC: 23.4,
      precipitationProbabilityMaxPercent: 70,
    },
    {
      date: '2026-11-08',
      weatherCode: 3,
      minTemperatureC: 17.5,
      maxTemperatureC: 24.1,
      precipitationProbabilityMaxPercent: 35,
    },
    {
      date: '2026-11-09',
      weatherCode: 0,
      minTemperatureC: 18.3,
      maxTemperatureC: 27.2,
      precipitationProbabilityMaxPercent: 5,
    },
  ],
  timezone: 'America/Sao_Paulo',
  utcOffsetSeconds: -10800,
  receivedAt: '2026-11-05T15:00:00.000Z',
};