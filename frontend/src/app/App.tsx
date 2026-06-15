import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { BookingProvider } from '../state/booking-context';

export function App() {
  return (
    <BookingProvider>
      <RouterProvider router={router} />
    </BookingProvider>
  );
}
