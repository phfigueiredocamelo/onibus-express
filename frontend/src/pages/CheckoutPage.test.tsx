import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BookingProvider } from '../state/booking-context';
import { CheckoutPage } from './CheckoutPage';
import { appRoutes } from '../services/routes';
import type { TripSummary } from '../types/api';

const navigateMock = vi.hoisted(() => vi.fn());
const createReservationMock = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('../services/api', async () => {
  const actual = await vi.importActual<typeof import('../services/api')>('../services/api');

  return {
    ...actual,
    createReservation: createReservationMock,
  };
});

describe('CheckoutPage', () => {
  const trip: TripSummary = {
    id: 'trip-porto-alegre-santa-maria-1',
    origin: 'Porto Alegre',
    destination: 'Santa Maria',
    departureAt: '2026-06-15T07:30:00-03:00',
    arrivalAt: '2026-06-15T12:05:00-03:00',
    price: 142.9,
    availableSeats: 8,
  };

  beforeEach(() => {
    navigateMock.mockClear();
    createReservationMock.mockReset();
  });

  it('redirects to search when no trip is selected', async () => {
    render(
      <BookingProvider>
        <CheckoutPage />
      </BookingProvider>,
    );

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith(appRoutes.search, { replace: true });
    });
  });

  it('validates required fields and cpf before submitting', async () => {
    render(
      <BookingProvider initialSelection={{ trip, seatNumber: 7 }}>
        <CheckoutPage />
      </BookingProvider>,
    );

    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Confirmar reserva' }));
    expect(await screen.findByText('Informe o nome completo do passageiro.')).toBeInTheDocument();
    expect(screen.getByText('Informe um CPF válido para continuar.')).toBeInTheDocument();
    expect(screen.getByText('Informe um e-mail para receber a confirmação.')).toBeInTheDocument();
    expect(createReservationMock).not.toHaveBeenCalled();

    await user.type(screen.getByPlaceholderText('Nome da pessoa'), 'Marina Alves');
    await user.type(screen.getByPlaceholderText('529.982.247-25'), '111.111.111-11');
    await user.type(screen.getByPlaceholderText('nome@exemplo.com'), 'marina@example.com');
    await user.click(screen.getByRole('button', { name: 'Confirmar reserva' }));

    expect(await screen.findByText('Confira o CPF informado.')).toBeInTheDocument();
  });

  it('shows field feedback for invalid email and keeps backend errors in a summary alert', async () => {
    createReservationMock.mockRejectedValueOnce(new Error('O assento informado já está ocupado.'));

    render(
      <BookingProvider initialSelection={{ trip, seatNumber: 7 }}>
        <CheckoutPage />
      </BookingProvider>,
    );

    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('Nome da pessoa'), 'Marina Alves');
    await user.type(screen.getByPlaceholderText('529.982.247-25'), '529.982.247-25');
    await user.type(screen.getByPlaceholderText('nome@exemplo.com'), 'marina');
    await user.click(screen.getByRole('button', { name: 'Confirmar reserva' }));

    expect(await screen.findByText('Digite um e-mail válido.')).toBeInTheDocument();
    expect(createReservationMock).not.toHaveBeenCalled();

    await user.clear(screen.getByPlaceholderText('nome@exemplo.com'));
    await user.type(screen.getByPlaceholderText('nome@exemplo.com'), 'marina@example.com');
    await user.click(screen.getByRole('button', { name: 'Confirmar reserva' }));

    expect(await screen.findByText('O assento informado já está ocupado.')).toBeInTheDocument();
  });
});
