import type {
  ReservationCreateInput,
  ReservationLookupResult,
  ReservationSummary,
  SearchTripsQuery,
  TripDetail,
  TripSummary,
} from '../types/api';
import { getDateInputValue } from '../lib/date';

const delay = async (ms = 120) => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

const today = getDateInputValue();

const demoTrips: TripDetail[] = [
  {
    id: 'trip-porto-alegre-santa-maria-1',
    origin: 'Porto Alegre',
    destination: 'Santa Maria',
    departureAt: `${today}T07:30:00-03:00`,
    arrivalAt: `${today}T12:05:00-03:00`,
    price: 142.9,
    availableSeats: 8,
    vehicleName: 'Executivo 42 lugares',
    seats: Array.from({ length: 42 }, (_, index) => ({
      number: index + 1,
      occupied: [3, 4, 11, 12, 17, 23, 24, 33, 34, 41].includes(index + 1),
    })),
  },
  {
    id: 'trip-florianopolis-curitiba-1',
    origin: 'Florianópolis',
    destination: 'Curitiba',
    departureAt: `${getDateInputValue(1)}T09:10:00-03:00`,
    arrivalAt: `${getDateInputValue(1)}T14:20:00-03:00`,
    price: 186.4,
    availableSeats: 12,
    vehicleName: 'Semi-leito 46 lugares',
    seats: Array.from({ length: 46 }, (_, index) => ({
      number: index + 1,
      occupied: [2, 5, 6, 15, 16, 27, 28, 35, 36, 44, 45].includes(index + 1),
    })),
  },
  {
    id: 'trip-sao-paulo-rio-1',
    origin: 'São Paulo',
    destination: 'Rio de Janeiro',
    departureAt: `${getDateInputValue(2)}T08:45:00-03:00`,
    arrivalAt: `${getDateInputValue(2)}T14:30:00-03:00`,
    price: 154.0,
    availableSeats: 6,
    vehicleName: 'Leito 40 lugares',
    seats: Array.from({ length: 40 }, (_, index) => ({
      number: index + 1,
      occupied: [1, 2, 10, 11, 18, 19, 25, 30, 31, 40].includes(index + 1),
    })),
  },
];

const reservationStore = new Map<string, ReservationSummary>([
  [
    'ONB-48291',
    {
      code: 'ONB-48291',
      tripId: 'trip-porto-alegre-santa-maria-1',
      tripLabel: 'Porto Alegre -> Santa Maria',
      seatNumber: 7,
      passenger: {
        fullName: 'Marina Alves',
        cpf: '529.982.247-25',
        email: 'marina.alves@example.com',
      },
      status: 'active',
      departureAt: `${today}T07:30:00-03:00`,
    },
  ],
]);

const tripById = new Map(demoTrips.map((trip) => [trip.id, trip]));

const normalize = (value: string) => value.trim().toLocaleLowerCase('pt-BR');

export async function searchTrips(query: SearchTripsQuery): Promise<TripSummary[]> {
  await delay();

  const origin = normalize(query.origin);
  const destination = normalize(query.destination);
  const date = query.date.trim();

  return demoTrips
    .filter((trip) => {
      const matchesOrigin = !origin || normalize(trip.origin).includes(origin);
      const matchesDestination = !destination || normalize(trip.destination).includes(destination);
      const matchesDate = !date || trip.departureAt.slice(0, 10) === date;

      return matchesOrigin && matchesDestination && matchesDate;
    })
    .map(({ seats: _seats, vehicleName: _vehicleName, ...summary }) => summary);
}

export async function getTripById(id: string): Promise<TripDetail | null> {
  await delay();
  return tripById.get(id) ?? null;
}

export async function createReservation(input: ReservationCreateInput): Promise<ReservationSummary> {
  await delay();

  const trip = tripById.get(input.tripId);
  if (!trip) {
    throw new Error('Trip not found.');
  }

  const code = `ONB-${Math.floor(10000 + Math.random() * 90000)}`;
  const reservation: ReservationSummary = {
    code,
    tripId: trip.id,
    tripLabel: `${trip.origin} -> ${trip.destination}`,
    seatNumber: input.seatNumber,
    passenger: {
      fullName: input.fullName,
      cpf: input.cpf,
      email: input.email,
    },
    status: 'active',
    departureAt: trip.departureAt,
  };

  reservationStore.set(code, reservation);
  return reservation;
}

export async function getReservationByCode(code: string): Promise<ReservationLookupResult> {
  await delay();
  return reservationStore.get(code.trim().toUpperCase()) ?? null;
}

export async function cancelReservation(code: string): Promise<ReservationLookupResult> {
  await delay();

  const reservation = reservationStore.get(code.trim().toUpperCase());
  if (!reservation) {
    return null;
  }

  const updated = { ...reservation, status: 'cancelled' as const };
  reservationStore.set(updated.code, updated);
  return updated;
}
