import React from 'react';
import { UseFormRegister } from 'react-hook-form';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  register?: UseFormRegister<any>;
  rules?: Record<string, any>;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  name,
  error,
  register,
  rules,
  ...props
}) => {
  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          type="checkbox"
          id={name}
          {...(register ? register(name, rules) : {})}
          {...props}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor={name} className="font-medium text-gray-700">
          {label}
        </label>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
};
