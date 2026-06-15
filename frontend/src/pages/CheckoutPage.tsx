import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { isValidCpf } from '../lib/cpf';
import { appRoutes } from '../services/routes';
import { createReservation } from '../services/api';
import { useBooking } from '../state/booking-context';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { selection } = useBooking();
  const [fullName, setFullName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const trip = selection.trip;
  const seatNumber = selection.seatNumber;
  const canContinue = Boolean(trip && seatNumber);

  useEffect(() => {
    if (!canContinue) {
      navigate(appRoutes.search, { replace: true });
    }
  }, [canContinue, navigate]);

  if (!canContinue) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!trip || seatNumber === null) {
      setError('Selecione uma viagem e um assento antes de concluir.');
      return;
    }

    if (!fullName.trim() || !cpf.trim() || !email.trim()) {
      setError('Preencha nome, CPF e e-mail.');
      return;
    }

    if (!isValidCpf(cpf)) {
      setError('Informe um CPF válido.');
      return;
    }

    setIsSaving(true);
    try {
      const reservation = await createReservation({
        tripId: trip.id,
        seatNumber,
        fullName,
        cpf,
        email,
      });

      navigate(appRoutes.reservationSuccess(reservation.code));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Nao foi possivel criar a reserva.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Checkout</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dados do passageiro</h1>
          <p className="text-sm text-slate-600">Revise os dados e finalize a reserva quando tudo estiver certo.</p>
        </div>

        {error ? (
          <Alert variant="error" title="Não foi possível continuar" className="mt-5">
            {error}
          </Alert>
        ) : null}

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Nome completo</span>
            <Input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Nome da pessoa" />
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-slate-700">CPF</span>
            <Input value={cpf} onChange={(event) => setCpf(event.target.value)} placeholder="529.982.247-25" />
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-slate-700">E-mail</span>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nome@exemplo.com"
            />
          </label>

          <Button type="submit" disabled={isSaving || !canContinue}>
            {isSaving ? 'Concluindo...' : 'Confirmar reserva'}
          </Button>
        </form>
      </section>

      <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Resumo</h2>

        {trip ? (
          <div className="space-y-2 text-sm text-slate-600">
            <p className="font-medium text-slate-900">
              {trip.origin} para {trip.destination}
            </p>
            <p>
              {new Date(trip.departureAt).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
            <p>Assento {seatNumber ?? '-'}</p>
            <p className="font-semibold text-slate-900">
              {trip.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        ) : (
          <Alert variant="info">Sem seleção carregada.</Alert>
        )}

        <Alert variant="info" title="Validação local">
          O formulário rejeita campos vazios e CPF inválido antes de enviar a reserva para a API.
        </Alert>
      </aside>
    </div>
  );
}
