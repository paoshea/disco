import React from 'react';
import { withAsyncFormHandler } from '../hoc/withAsyncHandler';

type LoginFormProps = {
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
};

function LoginForm({ onSubmit, children }: LoginFormProps) {
  return (
    <form className="mt-8 space-y-6" onSubmit={onSubmit}>
      {children}
    </form>
  );
}

export const LoginFormAsync = withAsyncFormHandler(LoginForm);
