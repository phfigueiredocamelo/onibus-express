import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { appRoutes } from '../services/routes';
import { getTripById } from '../services/api';
import { useBooking } from '../state/booking-context';
import type { TripDetail } from '../types/api';

export function SeatSelectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setTrip, setSeatNumber, selection } = useBooking();
  const [trip, setTripState] = useState<TripDetail | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(selection.seatNumber);

  useEffect(() => {
    if (!id) {
      return;
    }

    void (async () => {
      const detail = await getTripById(id);
      setTripState(detail);
      if (detail) {
        setTrip({
          id: detail.id,
          origin: detail.origin,
          destination: detail.destination,
          departureAt: detail.departureAt,
          arrivalAt: detail.arrivalAt,
          price: detail.price,
          availableSeats: detail.availableSeats,
        });
      }
    })();
  }, [id, setTrip]);

  const seats = useMemo(() => trip?.seats ?? [], [trip]);

  const handleContinue = () => {
    if (!trip || selectedSeat === null) {
      return;
    }

    setSeatNumber(selectedSeat);
    navigate(appRoutes.checkout);
  };

  if (!id) {
    return <Alert variant="error">O identificador da viagem está ausente.</Alert>;
  }

  if (!trip) {
    return <Alert variant="info">Carregando mapa de assentos...</Alert>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Assentos</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {trip.origin} para {trip.destination}
          </h1>
          <p className="text-sm text-slate-600">
            {new Date(trip.departureAt).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })} · {trip.vehicleName}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {seats.map((seat) => {
            const active = seat.number === selectedSeat;
            const className = seat.occupied
              ? 'border-slate-200 bg-slate-100 text-slate-400'
              : active
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-300 bg-white text-slate-900 hover:border-slate-500 hover:bg-slate-50';

            return (
              <button
                key={seat.number}
                type="button"
                disabled={seat.occupied}
                className={`flex h-16 flex-col items-center justify-center rounded-xl border text-sm font-medium transition ${className}`}
                onClick={() => setSelectedSeat(seat.number)}
              >
                <span>Assento</span>
                <span>{seat.number}</span>
              </button>
            );
          })}
        </div>
      </section>

      <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">Resumo da viagem</h2>
          <p className="text-sm text-slate-600">{trip.origin} • {trip.destination}</p>
          <p className="text-sm text-slate-600">
            {new Date(trip.departureAt).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
          <p className="text-sm font-semibold text-slate-900">
            {trip.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>

        <Alert variant="info" title="Estado dos lugares">
          Assentos cinza já estão ocupados. Clique em um lugar livre para seguir para o checkout.
        </Alert>

        <div className="space-y-2 text-sm text-slate-600">
          <p>
            Selecionado: <span className="font-medium text-slate-900">{selectedSeat ?? 'nenhum'}</span>
          </p>
          <p>
            Livres: <span className="font-medium text-slate-900">{trip.availableSeats}</span>
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button type="button" disabled={selectedSeat === null} onClick={handleContinue}>
            Continuar para checkout
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate(appRoutes.search)}>
            Voltar para a busca
          </Button>
        </div>
      </aside>
    </div>
  );
}
