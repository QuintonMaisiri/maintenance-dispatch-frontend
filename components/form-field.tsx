'use client';

import { type InputHTMLAttributes, type ReactNode } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: ReactNode;
}

export function FormField({ label, error, hint, id, ...rest }: FormFieldProps) {
  const inputId = id ?? `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <input
        id={inputId}
        {...rest}
        className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
        }`}
      />
      {hint && !error && (
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}