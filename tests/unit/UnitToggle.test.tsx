import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { useState } from 'react';
import UnitToggle from '../../src/components/UnitToggle';
import CurrentWeather from '../../src/components/CurrentWeather';
import ForecastList from '../../src/components/ForecastList';
import { mockWeatherData } from '../../src/mocks/weatherData';
import type { Unit } from '../../src/types/weather';

function Harness() {
  const [unit, setUnit] = useState<Unit>('celsius');
  return (
    <>
      <UnitToggle unit={unit} onChange={setUnit} />
      <CurrentWeather
        city={mockWeatherData.city}
        current={mockWeatherData.current}
        unit={unit}
      />
      <ForecastList forecast={mockWeatherData.forecast} unit={unit} />
    </>
  );
}

describe('UI meteorológica com mock', () => {
  it('exibe o clima atual do mock e cinco dias de previsão sem API', () => {
    render(<Harness />);

    expect(screen.getByText('São Paulo')).toBeInTheDocument();
    expect(
      within(screen.getByRole('region', { name: 'Clima atual' })).getByText('Predomínio de sol'),
    ).toBeInTheDocument();
    expect(screen.getByText('68%')).toBeInTheDocument();
    expect(screen.getByText('11 km/h')).toBeInTheDocument();
    expect(screen.getByText('0 mm')).toBeInTheDocument();
    expect(screen.getByText('1013 hPa')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
  });

  it('converte os valores atuais e previstos do mock ao alternar a unidade', async () => {
    render(<Harness />);
    expect(screen.getByText('22°')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '°F' }));
    expect(screen.getByText('72°')).toBeInTheDocument();

    const tomorrowCard = screen.getAllByRole('listitem')[1];
    if (!tomorrowCard) throw new Error('Card de amanhã não foi renderizado.');
    expect(within(tomorrowCard).getByText('79°')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('expõe os botões com estado pressionado acessível', () => {
    render(<Harness />);
    expect(screen.getByRole('button', { name: '°C' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('permite navegar entre as unidades por teclado', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<UnitToggle unit="celsius" onChange={onChange} />);

    await user.tab();
    expect(screen.getByRole('button', { name: '°C' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: '°F' })).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('fahrenheit');
  });
});
