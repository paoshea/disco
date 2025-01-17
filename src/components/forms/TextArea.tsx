import React from 'react';
import { UseFormRegister, FieldValues, Path } from 'react-hook-form';

interface TextAreaProps<T extends FieldValues>
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'> {
  label: string;
  name: Path<T>;
  error?: string;
  register?: UseFormRegister<T>;
  rules?: Record<string, unknown>;
}

export const TextArea = <T extends FieldValues>({
  label,
  name,
  error,
  register,
  rules,
  className = '',
  rows = 4,
  ...props
}: TextAreaProps<T>): JSX.Element => {
  return (
    <div>
      <label htmlFor={name.toString()} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <textarea
        id={name.toString()}
        rows={rows}
        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
          error ? 'border-red-300' : ''
        } ${className}`}
        {...(register ? register(name, rules) : {})}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
