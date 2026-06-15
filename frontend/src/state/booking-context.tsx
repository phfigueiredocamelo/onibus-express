import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
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
  const setTrip = useCallback((trip: TripSummary | null) => {
    setSelectionState((current) => ({ ...current, trip }));
  }, []);

  const setSeatNumber = useCallback((seatNumber: number | null) => {
    setSelectionState((current) => ({ ...current, seatNumber }));
  }, []);

  const setSelection = useCallback((nextSelection: BookingSelection) => {
    setSelectionState(nextSelection);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectionState(emptySelection);
  }, []);

  const value = useMemo<BookingContextValue>(
    () => ({
      selection,
      setTrip,
      setSeatNumber,
      setSelection,
      clearSelection,
    }),
    [clearSelection, selection, setSeatNumber, setSelection, setTrip],
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
