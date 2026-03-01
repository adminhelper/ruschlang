import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-text">{label}</label>
        )}
        <input
          ref={ref}
          className={[
            'w-full px-4 py-3 bg-surface-dark border rounded-xl text-sm text-text',
            'placeholder:text-text-muted/60',
            'focus:outline-none focus:border-primary focus:bg-surface transition-colors',
            error ? 'border-red-400 bg-red-50/50' : 'border-transparent',
            className,
          ].filter(Boolean).join(' ')}
          {...rest}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {!error && helperText && <p className="text-xs text-text-muted">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
