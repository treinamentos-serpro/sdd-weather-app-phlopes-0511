import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ForecastDay } from '../../src/types/weather';
import ForecastList from '../../src/components/ForecastList';

const forecast: ForecastDay[] = [
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
    minTemperatureC: 18.4,
    maxTemperatureC: 27,
    precipitationProbabilityMaxPercent: 20,
  },
  {
    date: '2026-11-07',
    weatherCode: 61,
    minTemperatureC: 16,
    maxTemperatureC: 23,
    precipitationProbabilityMaxPercent: 70,
  },
  {
    date: '2026-11-08',
    weatherCode: 3,
    minTemperatureC: 17,
    maxTemperatureC: 24,
    precipitationProbabilityMaxPercent: 35,
  },
  {
    date: '2026-11-09',
    weatherCode: 0,
    minTemperatureC: 18,
    maxTemperatureC: 28,
    precipitationProbabilityMaxPercent: 5,
  },
];

describe('ForecastList', () => {
  it('exibe cinco dias, rótulos, condições, temperaturas e probabilidade de chuva', () => {
    render(<ForecastList forecast={forecast} unit="celsius" />);

    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    expect(screen.getByText('Hoje')).toBeInTheDocument();
    expect(screen.getByText('Amanhã')).toBeInTheDocument();
    expect(screen.getByText('Parcialmente nublado')).toBeInTheDocument();
    const tomorrowCard = screen.getAllByRole('listitem')[1];
    if (!tomorrowCard) throw new Error('Card de amanhã não foi renderizado.');
    expect(within(tomorrowCard).getByText('27°')).toBeInTheDocument();
    expect(within(tomorrowCard).getByText('18°')).toBeInTheDocument();
    expect(within(tomorrowCard).getByText('Probabilidade de chuva: 20%')).toBeInTheDocument();
  });

  it('converte máximas e mínimas para Fahrenheit', () => {
    render(<ForecastList forecast={forecast} unit="fahrenheit" />);

    const tomorrowCard = screen.getAllByRole('listitem')[1];
    if (!tomorrowCard) throw new Error('Card de amanhã não foi renderizado.');
    expect(within(tomorrowCard).getByText('81°')).toBeInTheDocument();
    expect(within(tomorrowCard).getByText('65°')).toBeInTheDocument();
  });

  it('mantém o card e sinaliza dados ausentes', () => {
    const partialForecast = forecast.map((day, index) =>
      index === 0
        ? {
            ...day,
            weatherCode: null,
            minTemperatureC: null,
            maxTemperatureC: null,
            precipitationProbabilityMaxPercent: null,
          }
        : day,
    );

    render(<ForecastList forecast={partialForecast} unit="celsius" />);

    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    const todayCard = screen.getAllByRole('listitem')[0];
    if (!todayCard) throw new Error('Card de hoje não foi renderizado.');
    expect(within(todayCard).getByText('Condição indisponível')).toBeInTheDocument();
    expect(within(todayCard).getAllByText('—')).toHaveLength(2);
    expect(within(todayCard).getByText('Probabilidade de chuva: indisponível')).toBeInTheDocument();
  });
});