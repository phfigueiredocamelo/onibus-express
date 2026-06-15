export type TripSummary = {
  id: string;
  origin: string;
  destination: string;
  departureAt: string;
  arrivalAt: string;
  price: number;
  availableSeats: number;
};

export type TripSeat = {
  number: number;
  occupied: boolean;
};

export type TripDetail = TripSummary & {
  vehicleName: string;
  seats: TripSeat[];
};

export type SearchTripsQuery = {
  origin: string;
  destination: string;
  date: string;
};

export type PassengerForm = {
  fullName: string;
  cpf: string;
  email: string;
};

export type ReservationCreateInput = PassengerForm & {
  tripId: string;
  seatNumber: number;
};

export type ReservationSummary = {
  code: string;
  tripId: string;
  tripLabel: string;
  seatNumber: number;
  passenger: PassengerForm;
  status: 'active' | 'cancelled';
  departureAt: string;
};

export type ReservationLookupResult = ReservationSummary | null;
