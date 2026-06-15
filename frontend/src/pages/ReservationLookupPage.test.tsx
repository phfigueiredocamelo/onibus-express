import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
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
  beforeEach(() => {
    getReservationByCodeMock.mockReset();
    cancelReservationMock.mockReset();
  });

  it('shows inline validation before lookup', async () => {
    renderWithRouter([{ path: '/reservas', element: <ReservationLookupPage /> }], {
      initialEntries: ['/reservas'],
    });

    const user = userEvent.setup();

    await user.clear(screen.getByLabelText('Código da reserva'));
    await user.click(screen.getByRole('button', { name: 'Consultar' }));

    expect(await screen.findByText('Informe o código da reserva.')).toBeInTheDocument();
    expect(getReservationByCodeMock).not.toHaveBeenCalled();
  });

  it('displays reservation details and cancel feedback', async () => {
    getReservationByCodeMock.mockResolvedValueOnce({
      code: 'RSV-22A5DED4A0',
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
      code: 'RSV-22A5DED4A0',
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

  it('shows code format help inline and keeps API failures in the result panel alert', async () => {
    getReservationByCodeMock.mockRejectedValueOnce(new Error('Reserva indisponível no momento.'));

    renderWithRouter([{ path: '/reservas', element: <ReservationLookupPage /> }], {
      initialEntries: ['/reservas'],
    });

    const user = userEvent.setup();

    await user.clear(screen.getByPlaceholderText('RSV-22A5DED4A0'));
    await user.type(screen.getByPlaceholderText('RSV-22A5DED4A0'), '123');
    await user.click(screen.getByRole('button', { name: 'Consultar' }));

    expect(await screen.findByText('Use o formato RSV-22A5DED4A0.')).toBeInTheDocument();
    expect(getReservationByCodeMock).not.toHaveBeenCalled();

    await user.clear(screen.getByPlaceholderText('RSV-22A5DED4A0'));
    await user.type(screen.getByPlaceholderText('RSV-22A5DED4A0'), 'RSV-22A5DED4A0');
    await user.click(screen.getByRole('button', { name: 'Consultar' }));

    expect(await screen.findByText('Reserva indisponível no momento.')).toBeInTheDocument();
  });
});
