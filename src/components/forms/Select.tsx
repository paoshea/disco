import React from 'react';
import { UseFormRegister } from 'react-hook-form';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  options: Option[];
  error?: string;
  register?: UseFormRegister<any>;
  rules?: Record<string, any>;
}

export const Select: React.FC<SelectProps> = ({
  label,
  name,
  options,
  error,
  register,
  rules,
  ...props
}) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1">
        <select
          id={name}
          {...(register ? register(name, rules) : {})}
          {...props}
          className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
};
