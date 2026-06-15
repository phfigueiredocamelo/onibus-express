import type {
  ReservationCreateInput,
  ReservationLookupResult,
  ReservationSummary,
  SearchTripsQuery,
  TripDetail,
  TripSummary,
} from '../types/api';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') ?? 'http://localhost:8080';

type BackendRoute = {
  id: string;
  origin: string;
  destination: string;
  estimatedDuration: string;
};

type BackendTripSummary = {
  id: string;
  route: BackendRoute;
  departureAt: string;
  basePrice: number;
  totalSeats: number;
  availableSeats: number;
};

type BackendTripDetail = BackendTripSummary & {
  seats: Array<{
    seatNumber: number;
    status: 'Available' | 'Occupied';
  }>;
};

type BackendReservation = {
  id: string;
  tripId: string;
  seatNumber: number;
  status: 'Active' | 'Cancelled';
  code: string;
  createdAt: string;
  cancelledAt: string | null;
  passenger: {
    id: string;
    fullName: string;
    cpf: string;
    email: string;
    birthDate: string | null;
  };
};

type BackendApiError = {
  code: string;
  message: string;
};

function addDuration(departureAt: string, estimatedDuration: string) {
  const [hours, minutes, seconds] = estimatedDuration.split(':').map(Number);
  const match = departureAt.match(
    /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?([+-]\d{2}:\d{2}|Z)$/,
  );

  if (!match) {
    return departureAt;
  }

  const [, datePart, hourPart, minutePart, secondPart, offsetPart] = match;
  const [year, month, day] = datePart.split('-').map(Number);
  const localDate = new Date(Date.UTC(year, month - 1, day, Number(hourPart), Number(minutePart), Number(secondPart)));
  localDate.setUTCSeconds(localDate.getUTCSeconds() + hours * 3600 + minutes * 60 + seconds);

  const paddedMonth = String(localDate.getUTCMonth() + 1).padStart(2, '0');
  const paddedDay = String(localDate.getUTCDate()).padStart(2, '0');
  const paddedHours = String(localDate.getUTCHours()).padStart(2, '0');
  const paddedMinutes = String(localDate.getUTCMinutes()).padStart(2, '0');
  const paddedSeconds = String(localDate.getUTCSeconds()).padStart(2, '0');

  return `${localDate.getUTCFullYear()}-${paddedMonth}-${paddedDay}T${paddedHours}:${paddedMinutes}:${paddedSeconds}${offsetPart}`;
}

function mapTripSummary(trip: BackendTripSummary): TripSummary {
  return {
    id: trip.id,
    origin: trip.route.origin,
    destination: trip.route.destination,
    departureAt: trip.departureAt,
    arrivalAt: addDuration(trip.departureAt, trip.route.estimatedDuration),
    price: trip.basePrice,
    availableSeats: trip.availableSeats,
  };
}

function mapTripDetail(trip: BackendTripDetail): TripDetail {
  return {
    ...mapTripSummary(trip),
    vehicleName: `${trip.totalSeats} lugares`,
    seats: trip.seats.map((seat) => ({
      number: seat.seatNumber,
      occupied: seat.status === 'Occupied',
    })),
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T | null> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    let message = 'Nao foi possivel processar a solicitacao.';

    try {
      const error = (await response.json()) as BackendApiError;
      if (error.message) {
        message = error.message;
      }
    } catch {
      // Ignore non-JSON error payloads and fall back to the generic message.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

async function mapReservation(reservation: BackendReservation): Promise<ReservationSummary> {
  const trip = await getTripById(reservation.tripId);

  return {
    code: reservation.code,
    tripId: reservation.tripId,
    tripLabel: trip ? `${trip.origin} -> ${trip.destination}` : `Viagem ${reservation.tripId.slice(0, 8)}`,
    seatNumber: reservation.seatNumber,
    passenger: {
      fullName: reservation.passenger.fullName,
      cpf: reservation.passenger.cpf,
      email: reservation.passenger.email,
    },
    status: reservation.status === 'Cancelled' ? 'cancelled' : 'active',
    departureAt: trip?.departureAt ?? reservation.createdAt,
  };
}

export async function searchTrips(query: SearchTripsQuery): Promise<TripSummary[]> {
  const params = new URLSearchParams();

  if (query.origin.trim()) {
    params.set('origem', query.origin.trim());
  }

  if (query.destination.trim()) {
    params.set('destino', query.destination.trim());
  }

  if (query.date.trim()) {
    params.set('data', query.date.trim());
  }

  const path = params.size > 0 ? `/viagens?${params.toString()}` : '/viagens';
  const trips = await request<BackendTripSummary[]>(path, { method: 'GET' });
  return (trips ?? []).map(mapTripSummary);
}

export async function getTripById(id: string): Promise<TripDetail | null> {
  const trip = await request<BackendTripDetail>(`/viagens/${id}`, { method: 'GET' });
  return trip ? mapTripDetail(trip) : null;
}

export async function createReservation(input: ReservationCreateInput): Promise<ReservationSummary> {
  const reservation = await request<BackendReservation>('/reservas', {
    method: 'POST',
    body: JSON.stringify({
      tripId: input.tripId,
      seatNumber: input.seatNumber,
      passengerName: input.fullName,
      passengerCpf: input.cpf,
      passengerEmail: input.email,
      passengerBirthDate: null,
    }),
  });

  if (!reservation) {
    throw new Error('Nao foi possivel criar a reserva.');
  }

  return mapReservation(reservation);
}

export async function getReservationByCode(code: string): Promise<ReservationLookupResult> {
  const reservation = await request<BackendReservation>(`/reservas/${code.trim().toUpperCase()}`, { method: 'GET' });
  return reservation ? mapReservation(reservation) : null;
}

export async function cancelReservation(code: string): Promise<ReservationLookupResult> {
  const reservation = await request<BackendReservation>(`/reservas/${code.trim().toUpperCase()}`, { method: 'DELETE' });
  return reservation ? mapReservation(reservation) : null;
}
