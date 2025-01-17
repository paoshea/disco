import React from 'react';
import { UseFormRegister, FieldValues } from 'react-hook-form';

interface CheckboxProps<T extends FieldValues> extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  register?: UseFormRegister<T>;
  rules?: Partial<{
    required: boolean | string;
    pattern: RegExp;
    min: number;
    max: number;
    minLength: number;
    maxLength: number;
    validate: (value: boolean) => boolean | string;
  }>;
}

export const Checkbox = <T extends FieldValues>({
  label,
  name,
  error,
  register,
  rules,
  ...props
}: CheckboxProps<T>): JSX.Element => {
  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          type="checkbox"
          id={name}
          className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
          {...(register ? register(name, rules) : {})}
          {...props}
        />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor={name} className="font-medium text-gray-700">
          {label}
        </label>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
};
