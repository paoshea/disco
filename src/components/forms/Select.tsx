import React from 'react';
import { UseFormRegister, FieldValues, Path } from 'react-hook-form';

interface Option {
  value: string;
  label: string;
}

interface SelectProps<T extends FieldValues>
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'name'> {
  label: string;
  name: Path<T>;
  options: Option[];
  error?: string;
  register?: UseFormRegister<T>;
  rules?: Record<string, unknown>;
}

export const Select = <T extends FieldValues>({
  label,
  name,
  options,
  error,
  register,
  rules,
  className = '',
  ...props
}: SelectProps<T>): JSX.Element => {
  return (
    <div>
      <label
        htmlFor={name.toString()}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <select
        id={name.toString()}
        className={`mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm ${
          error ? 'border-red-300' : ''
        } ${className}`}
        {...(register ? register(name, rules) : {})}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
