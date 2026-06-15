import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithRouter } from '../test/render';
import { SeatSelectionPage } from './SeatSelectionPage';

describe('SeatSelectionPage', () => {
  it('blocks occupied seats and allows a free seat to be selected', async () => {
    renderWithRouter(
      [{ path: '/viagens/:id/assentos', element: <SeatSelectionPage /> }],
      { initialEntries: ['/viagens/trip-porto-alegre-santa-maria-1/assentos'] },
    );

    const occupiedSeat = await screen.findByText('3');
    expect(occupiedSeat.closest('button')).toBeDisabled();

    const freeSeat = screen.getByText('7').closest('button');
    expect(freeSeat).not.toBeNull();
    await userEvent.click(freeSeat!);

    expect(freeSeat).toHaveClass('bg-slate-900');
    expect(screen.getByRole('button', { name: 'Continuar para checkout' })).toBeEnabled();
  });
});
