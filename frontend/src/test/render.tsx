import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router-dom';
import { BookingProvider, type BookingSelection } from '../state/booking-context';

type RenderRouteOptions = {
  initialEntries?: string[];
  selection?: BookingSelection;
};

export function renderWithRouter(routes: RouteObject[], options: RenderRouteOptions = {}) {
  const { initialEntries = ['/'], selection } = options;
  const router = createMemoryRouter(routes, { initialEntries });

  return {
    router,
    ...render(
      <BookingProvider initialSelection={selection}>
        <RouterProvider router={router} />
      </BookingProvider>,
    ),
  };
}
