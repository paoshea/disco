import React from 'react';
import { UseFormRegister, FieldValues } from 'react-hook-form';

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps<T extends FieldValues> extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  options: Option[];
  error?: string;
  register?: UseFormRegister<T>;
  rules?: Partial<{
    required: boolean | string;
    min: number;
    max: number;
    pattern: RegExp;
    validate: (value: string) => boolean | string;
  }>;
}

export const Select = <T extends FieldValues>({
  label,
  name,
  options,
  error,
  register,
  rules,
  ...props
}: SelectProps<T>): JSX.Element => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1">
        <select
          id={name}
          className={`block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md ${
            error ? 'border-red-300' : ''
          }`}
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
    </div>
  );
};
