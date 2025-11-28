import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export default function FormField({
  label,
  htmlFor,
  error,
  required = false,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-semibold text-colonial-brown"
      >
        {label}
        {required && <span className="text-colonial-red ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-colonial-red">{error}</p>
      )}
    </div>
  );
}
