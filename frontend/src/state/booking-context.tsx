import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { TripSummary } from '../types/api';

export type BookingSelection = {
  trip: TripSummary | null;
  seatNumber: number | null;
};

type BookingContextValue = {
  selection: BookingSelection;
  setTrip: (trip: TripSummary | null) => void;
  setSeatNumber: (seatNumber: number | null) => void;
  setSelection: (selection: BookingSelection) => void;
  clearSelection: () => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

const emptySelection: BookingSelection = {
  trip: null,
  seatNumber: null,
};

type BookingProviderProps = {
  children: ReactNode;
  initialSelection?: BookingSelection;
};

export function BookingProvider({ children, initialSelection = emptySelection }: BookingProviderProps) {
  const [selection, setSelectionState] = useState<BookingSelection>(initialSelection);

  const value = useMemo<BookingContextValue>(
    () => ({
      selection,
      setTrip: (trip) => setSelectionState((current) => ({ ...current, trip })),
      setSeatNumber: (seatNumber) => setSelectionState((current) => ({ ...current, seatNumber })),
      setSelection: (nextSelection) => setSelectionState(nextSelection),
      clearSelection: () => setSelectionState(emptySelection),
    }),
    [selection],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider.');
  }

  return context;
}
