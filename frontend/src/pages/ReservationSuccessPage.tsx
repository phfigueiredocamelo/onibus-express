import { useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { appRoutes } from '../services/routes';

export function ReservationSuccessPage() {
  const { codigo } = useParams();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <Alert variant="success" title="Reserva confirmada">
        Sua reserva foi criada com sucesso.
      </Alert>

      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Código {codigo}</h1>
        <p className="text-sm leading-6 text-slate-600">
          Guarde este código para consultar ou cancelar a reserva depois.
        </p>
      </div>

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
