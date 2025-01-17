import React from 'react';
import { UseFormRegister } from 'react-hook-form';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  register?: UseFormRegister<any>;
  rules?: Record<string, any>;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  name,
  error,
  register,
  rules,
  type = 'text',
  ...props
}) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1">
        <input
          type={type}
          id={name}
          {...(register ? register(name, rules) : {})}
          {...props}
          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
};
