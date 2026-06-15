import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { getReservationByCode } from '../services/api';
import { appRoutes } from '../services/routes';
import type { ReservationLookupResult } from '../types/api';

export function ReservationSuccessPage() {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<ReservationLookupResult>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadReservation() {
      if (!codigo) {
        if (active) {
          setMessage('Código da reserva ausente.');
          setIsLoading(false);
        }
        return;
      }

      try {
        const result = await getReservationByCode(codigo);
        if (!active) {
          return;
        }

        setReservation(result);
        setMessage(result ? null : 'Reserva não encontrada.');
      } catch (caughtError) {
        if (!active) {
          return;
        }

        setMessage(caughtError instanceof Error ? caughtError.message : 'Nao foi possivel carregar a reserva.');
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadReservation();

    return () => {
      active = false;
    };
  }, [codigo]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <Alert variant="success" title="Reserva confirmada">
        Sua reserva foi criada com sucesso.
      </Alert>

      {message ? <Alert variant="warning">{message}</Alert> : null}

      {isLoading ? (
        <Alert variant="info">Carregando detalhes da reserva...</Alert>
      ) : reservation ? (
        <div className="space-y-4">
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Código {codigo}</h1>
            <p className="text-sm leading-6 text-slate-600">
              Guarde este código para consultar ou cancelar a reserva depois.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500">Reserva {reservation.code}</p>
            <h2 className="text-xl font-semibold text-slate-900">{reservation.tripLabel}</h2>
            <p className="text-sm text-slate-600">
              {new Date(reservation.departureAt).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>

          <dl className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <div>
              <dt className="font-medium text-slate-500">Passageiro</dt>
              <dd>{reservation.passenger.fullName}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Assento</dt>
              <dd>{reservation.seatNumber}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">CPF</dt>
              <dd>{reservation.passenger.cpf}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Status</dt>
              <dd className="capitalize">{reservation.status}</dd>
            </div>
          </dl>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="secondary" onClick={() => navigate(appRoutes.reservationLookup)}>
          Consultar reserva
        </Button>
        <Button type="button" variant="ghost" onClick={() => navigate(appRoutes.search)}>
          Nova busca
        </Button>
      </div>
    </div>
  );
}
