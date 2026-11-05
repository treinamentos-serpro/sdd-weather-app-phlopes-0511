import { useEffect, useState } from 'react';
import type { Unit, WeatherData } from './types/weather';
import SearchBar from './components/SearchBar';
import UnitToggle from './components/UnitToggle';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import LoadingState from './components/states/LoadingState';
import ErrorState from './components/states/ErrorState';
import EmptyState from './components/states/EmptyState';
import { mockWeatherData } from './mocks/weatherData';

type AppState =
  | { status: 'idle' }
  | { status: 'loading'; query: string }
  | { status: 'empty'; query: string }
  | { status: 'error'; query: string; message: string }
  | { status: 'success'; data: WeatherData };

const MOCK_SEARCH_DELAY_MS = 180;

function normalizeCityName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLocaleLowerCase('pt-BR');
}

/**
 * WeatherView — aplicação completa de previsão do tempo.
 *
 * Construída ao longo do treinamento de Spec-Driven Development com GitHub
 * Copilot, do briefing à entrega.
 */
export default function App() {
  const [state, setState] = useState<AppState>({ status: 'idle' });
  const [unit, setUnit] = useState<Unit>('celsius');

  function search(query: string) {
    const trimmedQuery = query.trim();
    if (trimmedQuery) setState({ status: 'loading', query: trimmedQuery });
  }

  function retry() {
    if (state.status === 'error') search(state.query);
  }

  useEffect(() => {
    if (state.status !== 'loading') return;

    const timeout = window.setTimeout(() => {
      try {
        const query = normalizeCityName(state.query);
        const mockCity = normalizeCityName(mockWeatherData.city.name);

        if (query === mockCity) {
          setState({ status: 'success', data: mockWeatherData });
        } else {
          setState({ status: 'empty', query: state.query });
        }
      } catch {
        setState({
          status: 'error',
          query: state.query,
          message: 'Não foi possível carregar os dados de demonstração.',
        });
      }
    }, MOCK_SEARCH_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [state]);

  return (
    <div className="min-h-screen text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="text-2xl text-sun">
              ☀️
            </span>
            <span className="text-lg font-bold">WeatherView</span>
          </div>
          <div className="flex items-center gap-3">
            <SearchBar onSearch={search} disabled={state.status === 'loading'} />
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        {state.status === 'idle' && (
          <EmptyState
            title="Busque uma cidade para começar"
            hint="Ex.: São Paulo"
          />
        )}

        {state.status === 'loading' && <LoadingState />}

        {state.status === 'empty' && (
          <EmptyState
            title={`Nenhuma cidade encontrada para "${state.query}"`}
            hint="Verifique a grafia e tente novamente."
          />
        )}

        {state.status === 'error' && (
          <ErrorState message={state.message} onRetry={retry} />
        )}

        {state.status === 'success' && (
          <>
            <CurrentWeather
              city={state.data.city}
              current={state.data.current}
              unit={unit}
            />
            <ForecastList forecast={state.data.forecast} unit={unit} />
          </>
        )}
      </main>

      <footer className="py-8 text-center text-sm text-white/40">
        Dados de demonstração
      </footer>
    </div>
  );
}
