import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithRouter } from '../test/render';
import { SearchPage } from './SearchPage';

const searchTripsMock = vi.hoisted(() => vi.fn());

vi.mock('../services/api', async () => {
  const actual = await vi.importActual<typeof import('../services/api')>('../services/api');

  return {
    ...actual,
    searchTrips: searchTripsMock,
  };
});

describe('SearchPage', () => {
  beforeEach(() => {
    searchTripsMock.mockReset();
  });

  it('shows inline validation before searching', async () => {
    renderWithRouter(
      [
        { path: '/buscar', element: <SearchPage /> },
        { path: '*', element: <SearchPage /> },
      ],
      { initialEntries: ['/buscar'] },
    );

    const user = userEvent.setup();

    await user.clear(screen.getByLabelText('Data'));
    await user.click(screen.getByRole('button', { name: 'Buscar viagens' }));

    expect(await screen.findByText('Informe a cidade de origem.')).toBeInTheDocument();
    expect(screen.getByText('Informe a cidade de destino.')).toBeInTheDocument();
    expect(screen.getByText('Escolha uma data para a viagem.')).toBeInTheDocument();
    expect(searchTripsMock).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('fills fields, searches, and shows the results', async () => {
    searchTripsMock.mockResolvedValueOnce([
      {
        id: 'trip-1',
        origin: 'Porto Alegre',
        destination: 'Santa Maria',
        departureAt: '2026-06-15T07:30:00-03:00',
        arrivalAt: '2026-06-15T12:05:00-03:00',
        price: 142.9,
        availableSeats: 8,
      },
    ]);

    renderWithRouter([
      { path: '/buscar', element: <SearchPage /> },
      { path: '*', element: <SearchPage /> },
    ], { initialEntries: ['/buscar'] });

    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Origem'), 'Porto Alegre');
    await user.type(screen.getByLabelText('Destino'), 'Santa Maria');
    await user.clear(screen.getByLabelText('Data'));
    await user.type(screen.getByLabelText('Data'), '2026-06-15');
    await user.click(screen.getByRole('button', { name: 'Buscar viagens' }));

    expect(searchTripsMock).toHaveBeenCalledWith({
      origin: 'Porto Alegre',
      destination: 'Santa Maria',
      date: '2026-06-15',
    });

    expect(await screen.findByText('Porto Alegre para Santa Maria')).toBeInTheDocument();
    expect(screen.getByText('8 assentos livres')).toBeInTheDocument();
  });

  it('keeps API failures in a top-level alert without field validation copy', async () => {
    searchTripsMock.mockRejectedValueOnce(new Error('Servidor indisponível.'));

    renderWithRouter(
      [
        { path: '/buscar', element: <SearchPage /> },
        { path: '*', element: <SearchPage /> },
      ],
      { initialEntries: ['/buscar'] },
    );

    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Origem'), 'Porto Alegre');
    await user.type(screen.getByLabelText('Destino'), 'Santa Maria');
    await user.clear(screen.getByLabelText('Data'));
    await user.type(screen.getByLabelText('Data'), '2026-06-15');
    await user.click(screen.getByRole('button', { name: 'Buscar viagens' }));

    expect(await screen.findByText('Servidor indisponível.')).toBeInTheDocument();
    expect(screen.queryByText('Informe a cidade de origem.')).not.toBeInTheDocument();
  });
});
