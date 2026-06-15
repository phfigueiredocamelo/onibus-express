import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ReservationLookupPage } from './ReservationLookupPage';
import { renderWithRouter } from '../test/render';

const getReservationByCodeMock = vi.hoisted(() => vi.fn());
const cancelReservationMock = vi.hoisted(() => vi.fn());

vi.mock('../services/api', async () => {
  const actual = await vi.importActual<typeof import('../services/api')>('../services/api');

  return {
    ...actual,
    getReservationByCode: getReservationByCodeMock,
    cancelReservation: cancelReservationMock,
  };
});

describe('ReservationLookupPage', () => {
  it('displays reservation details and cancel feedback', async () => {
    getReservationByCodeMock.mockResolvedValueOnce({
      code: 'ONB-48291',
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
    cancelReservationMock.mockResolvedValueOnce({
      code: 'ONB-48291',
      tripId: 'trip-porto-alegre-santa-maria-1',
      tripLabel: 'Porto Alegre -> Santa Maria',
      seatNumber: 7,
      passenger: {
        fullName: 'Marina Alves',
        cpf: '529.982.247-25',
        email: 'marina.alves@example.com',
      },
      status: 'cancelled',
      departureAt: '2026-06-15T07:30:00-03:00',
    });

    renderWithRouter([{ path: '/reservas', element: <ReservationLookupPage /> }], {
      initialEntries: ['/reservas'],
    });

    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Consultar' }));

    expect(await screen.findByText('Porto Alegre -> Santa Maria')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancelar reserva' }));

    expect(await screen.findByText('Reserva cancelada com sucesso.')).toBeInTheDocument();
    expect(screen.getByText('cancelled')).toBeInTheDocument();
  });
});
