import React from 'react';
import { UseFormRegister, FieldValues, Path } from 'react-hook-form';

interface TextFieldProps<T extends FieldValues>
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> {
  label: string;
  name: Path<T>;
  error?: string;
  register?: UseFormRegister<T>;
  rules?: Record<string, unknown>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const TextField = <T extends FieldValues>({
  label,
  name,
  error,
  register,
  rules,
  className = '',
  leftIcon,
  rightIcon,
  type = 'text',
  ...props
}: TextFieldProps<T>): JSX.Element => {
  return (
    <div>
      <label
        htmlFor={name.toString()}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <div className="relative mt-1 rounded-md shadow-sm">
        {leftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          id={name.toString()}
          className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
            error ? 'border-red-300' : ''
          } ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${className}`}
          {...(register ? register(name, rules) : {})}
          {...props}
        />
        {rightIcon && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
