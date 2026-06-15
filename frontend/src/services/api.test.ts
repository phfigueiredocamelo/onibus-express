import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  cancelReservation,
  createReservation,
  getReservationByCode,
  getTripById,
  searchTrips,
} from './api';

const fetchMock = vi.fn<typeof fetch>();

describe('api service', () => {
  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it('searches trips using the backend query parameters and maps the response', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify([
          {
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
          },
        ]),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await searchTrips({
      origin: 'Porto Alegre',
      destination: 'Santa Maria',
      date: '2026-06-15',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/viagens?origem=Porto+Alegre&destino=Santa+Maria&data=2026-06-15',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result).toEqual([
      {
        id: '11111111-1111-1111-1111-111111111111',
        origin: 'Porto Alegre',
        destination: 'Santa Maria',
        departureAt: '2026-06-15T07:30:00-03:00',
        arrivalAt: '2026-06-15T12:05:00-03:00',
        price: 142.9,
        availableSeats: 8,
      },
    ]);
  });

  it('loads trip details and maps seat status to occupied flags', async () => {
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
            { seatNumber: 7, status: 'Available' },
            { seatNumber: 8, status: 'Occupied' },
          ],
        }),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await getTripById('11111111-1111-1111-1111-111111111111');

    expect(result).toEqual({
      id: '11111111-1111-1111-1111-111111111111',
      origin: 'Porto Alegre',
      destination: 'Santa Maria',
      departureAt: '2026-06-15T07:30:00-03:00',
      arrivalAt: '2026-06-15T12:05:00-03:00',
      price: 142.9,
      availableSeats: 8,
      vehicleName: '42 lugares',
      seats: [
        { number: 7, occupied: false },
        { number: 8, occupied: true },
      ],
    });
  });

  it('creates reservations using the backend payload and maps the response', async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: '33333333-3333-3333-3333-333333333333',
            tripId: '11111111-1111-1111-1111-111111111111',
            seatNumber: 7,
            status: 'Active',
            code: 'RSV-48291',
            createdAt: '2026-06-15T10:00:00-03:00',
            cancelledAt: null,
            passenger: {
              id: '44444444-4444-4444-4444-444444444444',
              fullName: 'Marina Alves',
              cpf: '529.982.247-25',
              email: 'marina@example.com',
              birthDate: null,
            },
          }),
          { status: 201 },
        ),
      )
      .mockResolvedValueOnce(
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
            seats: [],
          }),
        ),
      );
    vi.stubGlobal('fetch', fetchMock);

    const result = await createReservation({
      tripId: '11111111-1111-1111-1111-111111111111',
      seatNumber: 7,
      fullName: 'Marina Alves',
      cpf: '529.982.247-25',
      email: 'marina@example.com',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/reservas',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          tripId: '11111111-1111-1111-1111-111111111111',
          seatNumber: 7,
          passengerName: 'Marina Alves',
          passengerCpf: '529.982.247-25',
          passengerEmail: 'marina@example.com',
          passengerBirthDate: null,
        }),
      }),
    );
    expect(result).toEqual({
      code: 'RSV-48291',
      tripId: '11111111-1111-1111-1111-111111111111',
      tripLabel: 'Porto Alegre -> Santa Maria',
      seatNumber: 7,
      passenger: {
        fullName: 'Marina Alves',
        cpf: '529.982.247-25',
        email: 'marina@example.com',
      },
      status: 'active',
      departureAt: '2026-06-15T07:30:00-03:00',
    });
  });

  it('returns null for missing resources and surfaces API messages for backend failures', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'seat_occupied', message: 'O assento informado já está ocupado.' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    vi.stubGlobal('fetch', fetchMock);

    await expect(getReservationByCode('RSV-00000')).resolves.toBeNull();
    await expect(cancelReservation('RSV-48291')).rejects.toThrow('O assento informado já está ocupado.');
  });
});
