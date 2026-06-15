import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithRouter } from '../test/render';
import { SeatSelectionPage } from './SeatSelectionPage';

const fetchMock = vi.fn<typeof fetch>();

describe('SeatSelectionPage', () => {
  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it('blocks occupied seats and allows a free seat to be selected', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: '11111111-1111-1111-1111-111111111111',
          route: {
            id: '22222222-2222-2222-2222-222222222222',
            origin: 'Porto Alegre',
            destination: 'Santa Maria',
            estimatedDuration: '04:35:00',
          },
          departureAt: '2026-06-15T07:30:00-03:00',
          basePrice: 142.9,
          totalSeats: 42,
          availableSeats: 8,
          seats: [
            { seatNumber: 3, status: 'Occupied' },
            { seatNumber: 7, status: 'Available' },
          ],
        }),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    renderWithRouter(
      [{ path: '/viagens/:id/assentos', element: <SeatSelectionPage /> }],
      { initialEntries: ['/viagens/11111111-1111-1111-1111-111111111111/assentos'] },
    );
    const user = userEvent.setup();

    const occupiedSeat = await screen.findByRole('button', { name: /assento\s*3/i });
    expect(occupiedSeat).toBeDisabled();

    const freeSeat = screen.getByRole('button', { name: /assento\s*7/i });
    await user.click(freeSeat);

    expect(
      screen.getByText((_, element) => element?.textContent?.replace(/\s+/g, ' ').trim() === 'Selecionado: 7'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar para checkout' })).toBeEnabled();
  });
});
