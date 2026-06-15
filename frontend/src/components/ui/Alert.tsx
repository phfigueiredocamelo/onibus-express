import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

type AlertProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  variant?: AlertVariant;
};

const styles: Record<AlertVariant, string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-900',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  error: 'border-rose-200 bg-rose-50 text-rose-900',
};

export function Alert({ children, className, title, variant = 'info' }: AlertProps) {
  return (
    <div role="alert" className={cn('rounded-xl border p-4 text-sm', styles[variant], className)}>
      {title ? <p className="mb-1 font-semibold">{title}</p> : null}
      <div className="leading-6">{children}</div>
    </div>
  );
}
