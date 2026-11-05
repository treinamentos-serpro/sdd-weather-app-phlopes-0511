import type { ForecastDay, Unit } from '../types/weather';
import { formatTemperature } from '../lib/temperature';
import { getWeatherIcon, getWeatherLabel } from '../lib/weatherCodes';
import { getDayLabel, getShortDate } from '../lib/format';

interface ForecastCardProps {
  day: ForecastDay;
  index: number;
  unit: Unit;
}

/** Card de um dia da previsão. */
export default function ForecastCard({ day, index, unit }: ForecastCardProps) {
  const weatherLabel =
    day.weatherCode === null ? 'Condição indisponível' : getWeatherLabel(day.weatherCode);
  const weatherIcon = getWeatherIcon(day.weatherCode ?? -1);
  const precipitationProbability =
    day.precipitationProbabilityMaxPercent === null
      ? null
      : `${day.precipitationProbabilityMaxPercent}%`;

  return (
    <li className="flex min-w-0 flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur-md sm:p-4">
      <p className="font-semibold">{getDayLabel(day.date, index)}</p>
      <p className="text-xs text-white/70">{getShortDate(day.date)}</p>
      <span aria-hidden="true" className="text-3xl" title={weatherLabel}>
        {weatherIcon}
      </span>
      <p className="break-words text-xs text-white/70">{weatherLabel}</p>
      <p className="text-sm">
        <span className="font-semibold">
          {day.maxTemperatureC === null ? '—' : formatTemperature(day.maxTemperatureC, unit)}
        </span>{' '}
        <span className="text-white/50">
          {day.minTemperatureC === null ? '—' : formatTemperature(day.minTemperatureC, unit)}
        </span>
      </p>
      <p className="text-xs text-accent-400">
        <span aria-hidden="true">💧 {precipitationProbability ?? '—'}</span>
        <span className="sr-only">
          Probabilidade de chuva: {precipitationProbability ?? 'indisponível'}
        </span>
      </p>
    </li>
  );
}
