import { FormEvent, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { cancelReservation, getReservationByCode } from '../services/api';
import type { ReservationLookupResult } from '../types/api';

const reservationCodePattern = /^RSV-[0-9A-F]{10}$/i;

export function ReservationLookupPage() {
  const [code, setCode] = useState('RSV-22A5DED4A0');
  const [reservation, setReservation] = useState<ReservationLookupResult>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  const handleLookup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      setCodeError('Informe o código da reserva.');
      setReservation(null);
      return;
    }

    if (!reservationCodePattern.test(normalizedCode)) {
      setCodeError('Use o formato RSV-22A5DED4A0.');
      setReservation(null);
      return;
    }

    setCodeError(null);
    setIsLoading(true);

    try {
      const result = await getReservationByCode(normalizedCode);
      setReservation(result);
      if (!result) {
        setMessage('Reserva não encontrada.');
      }
    } catch (caughtError) {
      setReservation(null);
      setMessage(caughtError instanceof Error ? caughtError.message : 'Nao foi possivel consultar a reserva.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!reservation) {
      return;
    }

    try {
      const cancelled = await cancelReservation(reservation.code);
      setReservation(cancelled);
      setMessage('Reserva cancelada com sucesso.');
    } catch (caughtError) {
      setMessage(caughtError instanceof Error ? caughtError.message : 'Nao foi possivel cancelar a reserva.');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Reservas</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Consultar código</h1>
          <p className="text-sm text-slate-600">Abra uma reserva por código e veja os detalhes ou o status atual.</p>
        </div>

        <form className="mt-6 grid gap-4" onSubmit={handleLookup}>
          <label className="space-y-1.5" htmlFor="reservation-code">
            <span className="text-sm font-medium text-slate-700">Código da reserva</span>
            <Input
              id="reservation-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="RSV-22A5DED4A0"
              invalid={Boolean(codeError)}
              aria-describedby={codeError ? 'reservation-code-error' : undefined}
            />
            {codeError ? (
              <p id="reservation-code-error" className="text-sm text-rose-700">
                {codeError}
              </p>
            ) : null}
          </label>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Consultando...' : 'Consultar'}
          </Button>
        </form>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        {message ? <Alert variant="info">{message}</Alert> : null}

        {reservation ? (
          <div className="space-y-4">
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

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="danger"
                disabled={reservation.status === 'cancelled'}
                onClick={handleCancel}
              >
                Cancelar reserva
              </Button>
            </div>
          </div>
        ) : (
          <Alert variant="info" title="Nenhum resultado">
            Digite um código para carregar os detalhes.
          </Alert>
        )}
      </section>
    </div>
  );
}
