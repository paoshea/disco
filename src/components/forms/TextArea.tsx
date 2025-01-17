import React from 'react';
import { UseFormRegister, FieldValues } from 'react-hook-form';

interface TextAreaProps<T extends FieldValues> extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: string;
  error?: string;
  register?: UseFormRegister<T>;
  rules?: Partial<{
    required: boolean | string;
    minLength: number;
    maxLength: number;
    pattern: RegExp;
    validate: (value: string) => boolean | string;
  }>;
}

export const TextArea = <T extends FieldValues>({
  label,
  name,
  error,
  register,
  rules,
  rows = 4,
  ...props
}: TextAreaProps<T>): JSX.Element => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1">
        <textarea
          id={name}
          rows={rows}
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
