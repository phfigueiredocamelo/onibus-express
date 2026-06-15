import { Link, NavLink, Outlet } from 'react-router-dom';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-full px-3 py-1.5 text-sm transition',
    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ');

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <Link to="/" className="text-sm font-semibold tracking-tight text-slate-900">
              OniBus Express
            </Link>
            <p className="text-xs text-slate-500">Reserva de viagens rodoviárias</p>
          </div>
          <nav aria-label="Primary" className="flex items-center gap-2">
            <NavLink to="/buscar" className={navLinkClass}>
              Buscar
            </NavLink>
            <NavLink to="/reservas" className={navLinkClass}>
              Reservas
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
