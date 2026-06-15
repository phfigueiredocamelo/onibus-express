import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export function Input({ className, invalid = false, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-2',
        invalid
          ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-100'
          : 'border-slate-300 focus:border-slate-400 focus:ring-slate-200',
        className,
      )}
      aria-invalid={invalid || props['aria-invalid'] ? true : undefined}
      {...props}
    />
  );
}
