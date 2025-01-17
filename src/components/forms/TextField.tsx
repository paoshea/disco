import React from 'react';
import { UseFormRegister, FieldValues } from 'react-hook-form';

interface TextFieldProps<T extends FieldValues> extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  register?: UseFormRegister<T>;
  rules?: Partial<{
    required: boolean | string;
    minLength: number;
    maxLength: number;
    min: number;
    max: number;
    pattern: RegExp;
    validate: (value: string) => boolean | string;
  }>;
}

export const TextField = <T extends FieldValues>({
  label,
  name,
  error,
  register,
  rules,
  type = 'text',
  ...props
}: TextFieldProps<T>): JSX.Element => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1">
        <input
          type={type}
          id={name}
          className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
            error ? 'border-red-300' : ''
          }`}
          {...(register ? register(name, rules) : {})}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
