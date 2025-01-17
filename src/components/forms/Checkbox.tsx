import React from 'react';
import { UseFormRegister, FieldValues, Path } from 'react-hook-form';

interface CheckboxProps<T extends FieldValues>
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> {
  label: string;
  name: Path<T>;
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
      <div className="flex h-5 items-center">
        <input
          type="checkbox"
          id={name.toString()}
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          {...(register ? register(name, rules) : {})}
          {...props}
        />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor={name.toString()} className="font-medium text-gray-700">
          {label}
        </label>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
};
