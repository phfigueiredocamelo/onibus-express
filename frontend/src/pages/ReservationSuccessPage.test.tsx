import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReservationSuccessPage } from './ReservationSuccessPage';
import { renderWithRouter } from '../test/render';

const getReservationByCodeMock = vi.hoisted(() => vi.fn());

vi.mock('../services/api', async () => {
  const actual = await vi.importActual<typeof import('../services/api')>('../services/api');

  return {
    ...actual,
    getReservationByCode: getReservationByCodeMock,
  };
});

describe('ReservationSuccessPage', () => {
  it('loads and displays reservation details from the reservation code', async () => {
    getReservationByCodeMock.mockResolvedValueOnce({
      code: 'RSV-48291',
      tripId: 'trip-porto-alegre-santa-maria-1',
      tripLabel: 'Porto Alegre -> Santa Maria',
      seatNumber: 7,
      passenger: {
        fullName: 'Marina Alves',
        cpf: '529.982.247-25',
        email: 'marina.alves@example.com',
      },
      status: 'active',
      departureAt: '2026-06-15T07:30:00-03:00',
    });

    renderWithRouter(
      [{ path: '/reservas/sucesso/:codigo', element: <ReservationSuccessPage /> }],
      { initialEntries: ['/reservas/sucesso/RSV-48291'] },
    );

    expect(await screen.findByText('Porto Alegre -> Santa Maria')).toBeInTheDocument();
    expect(screen.getByText('Marina Alves')).toBeInTheDocument();
    expect(screen.getByText('7', { selector: 'dd' })).toBeInTheDocument();
  });
});
