import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BookingProvider } from '../state/booking-context';
import { CheckoutPage } from './CheckoutPage';
import { appRoutes } from '../services/routes';
import type { TripSummary } from '../types/api';

const navigateMock = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

  return {
    ...actual,
    useNavigate: () => navigateMock,
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
    expect(await screen.findByText('Preencha nome, CPF e e-mail.')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Nome completo'), 'Marina Alves');
    await user.type(screen.getByLabelText('CPF'), '111.111.111-11');
    await user.type(screen.getByLabelText('E-mail'), 'marina@example.com');
    await user.click(screen.getByRole('button', { name: 'Confirmar reserva' }));

    expect(await screen.findByText('Informe um CPF válido.')).toBeInTheDocument();
  });
});
