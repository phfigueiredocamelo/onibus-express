import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { appRoutes } from '../services/routes';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Página não encontrada</h1>
      <p className="mt-2 max-w-prose text-sm leading-6 text-slate-600">
        O endereço não corresponde a nenhuma etapa do fluxo de reserva.
      </p>
      <div className="mt-5">
        <Button type="button" onClick={() => navigate(appRoutes.search)}>
          Voltar para a busca
        </Button>
      </div>
    </div>
  );
}
