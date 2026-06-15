import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import { CheckoutPage } from '../pages/CheckoutPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ReservationLookupPage } from '../pages/ReservationLookupPage';
import { ReservationSuccessPage } from '../pages/ReservationSuccessPage';
import { SearchPage } from '../pages/SearchPage';
import { SeatSelectionPage } from '../pages/SeatSelectionPage';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <SearchPage /> },
      { path: 'buscar', element: <SearchPage /> },
      { path: 'viagens/:id/assentos', element: <SeatSelectionPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'reservas/sucesso/:codigo', element: <ReservationSuccessPage /> },
      { path: 'reservas', element: <ReservationLookupPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
