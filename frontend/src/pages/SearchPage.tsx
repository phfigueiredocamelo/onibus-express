import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { getDateInputValue } from '../lib/date';
import { appRoutes } from '../services/routes';
import { searchTrips } from '../services/api';
import type { TripSummary } from '../types/api';

const defaultDate = getDateInputValue();

export function SearchPage() {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TripSummary[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const resultCount = useMemo(() => results.length, [results]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setHasSearched(true);

    try {
      const trips = await searchTrips({ origin, destination, date });
      setResults(trips);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Busca de viagens</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Escolha a próxima saída</h1>
          <p className="text-sm leading-6 text-slate-600">
            Monitore rotas, datas e disponibilidade sem perder o foco na reserva.
          </p>
        </div>

        <form className="mt-6 grid gap-4 md:grid-cols-[1.2fr_1.2fr_0.8fr_auto] md:items-end" onSubmit={handleSubmit}>
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Origem</span>
            <Input value={origin} onChange={(event) => setOrigin(event.target.value)} placeholder="Porto Alegre" />
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Destino</span>
            <Input
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              placeholder="Santa Maria"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Data</span>
            <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Buscando...' : 'Buscar viagens'}
          </Button>
        </form>
      </section>

      <section className="space-y-3">
        {isLoading ? (
          <Alert variant="info" title="Carregando resultados">
            Estamos consultando as saídas disponíveis.
          </Alert>
        ) : null}

        {!isLoading && hasSearched && resultCount === 0 ? (
          <Alert variant="warning" title="Nenhuma viagem encontrada">
            Tente uma rota diferente ou remova filtros para ver as opções disponíveis.
          </Alert>
        ) : null}

        <div className="grid gap-3">
          {results.map((trip) => (
            <article
              key={trip.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500">{trip.origin} para {trip.destination}</p>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
                    <span>{new Date(trip.departureAt).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    <span className="text-slate-300">•</span>
                    <span>{trip.availableSeats} assentos livres</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-slate-900">
                      {trip.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate(appRoutes.seatSelection(trip.id))}
                >
                  Selecionar assento
                </Button>
              </div>
            </article>
          ))}
        </div>

        {!hasSearched ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            Use o formulário acima para carregar as saídas demo.
          </div>
        ) : null}
      </section>

      <div className="text-sm text-slate-600">
        Acompanhe também as <Link className="font-medium text-slate-900 underline" to={appRoutes.reservationLookup}>reservas</Link>.
      </div>
    </div>
  );
}
