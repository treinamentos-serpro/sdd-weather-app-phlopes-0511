import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import App from '../../src/App';

describe('App', () => {
  it('renderiza a marca e o estado inicial vazio', () => {
    render(<App />);
    expect(screen.getByText('WeatherView')).toBeInTheDocument();
    expect(screen.getByText(/busque uma cidade para começar/i)).toBeInTheDocument();
  });

  it('mostra a barra de busca e o alternador de unidade', () => {
    render(<App />);
    expect(screen.getByLabelText(/buscar cidade/i)).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /unidade de temperatura/i })).toBeInTheDocument();
  });

  it('mostra loading e dados do mock ao buscar a cidade de demonstração', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole('searchbox'), 'Sao Paulo');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'São Paulo' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    expect(screen.getByText('68%')).toBeInTheDocument();
  });

  it('mostra empty para uma cidade que não existe no mock', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole('searchbox'), 'Lisboa');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    expect(await screen.findByText(/nenhuma cidade encontrada para "Lisboa"/i)).toBeInTheDocument();
  });

  it('mantém a unidade como estado de UI e converte clima atual e forecast', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole('searchbox'), 'São Paulo');
    await user.click(screen.getByRole('button', { name: /buscar/i }));
    await screen.findByRole('heading', { name: 'São Paulo' });

    expect(screen.getByText('22°')).toBeInTheDocument();
    const tomorrowCard = screen.getAllByRole('listitem')[1];
    if (!tomorrowCard) throw new Error('Card de amanhã não foi renderizado.');
    expect(within(tomorrowCard).getByText('26°')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '°F' }));

    expect(screen.getByText('72°')).toBeInTheDocument();
    expect(within(tomorrowCard).getByText('79°')).toBeInTheDocument();
  });
});
