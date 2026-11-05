import type { CurrentWeather as CurrentWeatherType, City, Unit } from '../types/weather';
import { formatTemperature } from '../lib/temperature';
import { getWeatherIcon, getWeatherLabel } from '../lib/weatherCodes';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherType;
  unit: Unit;
}

interface MetricProps {
  icon: string;
  label: string;
  value: string;
}

function Metric({ icon, label, value }: MetricProps) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-md sm:px-4">
      <span aria-hidden="true" className="text-xl">
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="break-words text-xs text-white/70">{label}</dt>
        <dd className="break-words font-semibold">{value}</dd>
      </div>
    </div>
  );
}

/** Seção "hero" com as condições atuais da cidade selecionada. */
export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const location = [city.region, city.country].filter(Boolean).join(', ');

  return (
    <section
      aria-label="Clima atual"
      className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-glass md:p-8"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="break-words text-2xl font-bold md:text-3xl">{city.name}</h2>
          {location && <p className="break-words text-white/70">{location}</p>}

          <div className="mt-6 flex items-center gap-4">
            {current.weatherCode !== null && (
              <span aria-hidden="true" className="text-6xl">
                {getWeatherIcon(current.weatherCode)}
              </span>
            )}
            <span className="whitespace-nowrap text-5xl font-light sm:text-6xl md:text-7xl">
              {current.temperatureC === null ? '—' : formatTemperature(current.temperatureC, unit)}
            </span>
          </div>
          <p className="mt-2 text-white/70">
            {current.weatherCode === null
              ? 'Condição indisponível'
              : getWeatherLabel(current.weatherCode)}
          </p>
        </div>

        <dl className="grid min-w-0 grid-cols-2 gap-3">
          <Metric
            icon="💧"
            label="Umidade"
            value={current.humidityPercent === null ? '—' : `${Math.round(current.humidityPercent)}%`}
          />
          <Metric
            icon="💨"
            label="Vento"
            value={current.windSpeedKmh === null ? '—' : `${Math.round(current.windSpeedKmh)} km/h`}
          />
          <Metric
            icon="🌧️"
            label="Precipitação"
            value={current.precipitationMm === null ? '—' : `${current.precipitationMm} mm`}
          />
          <Metric
            icon="📊"
            label="Pressão"
            value={current.pressureHpa === null ? '—' : `${Math.round(current.pressureHpa)} hPa`}
          />
        </dl>
      </div>
    </section>
  );
}
