import React from 'react';

type AsyncPropName = string;
type PropMapping<P> = Record<AsyncPropName, keyof P>;

/**
 * HOC that converts void-returning props to Promise-returning props
 * @param WrappedComponent The component to wrap
 * @param asyncProps Object mapping of prop names that need conversion
 */
export function withAsyncHandler<P extends object, VP extends object = P>(
  WrappedComponent: React.ComponentType<P>,
  asyncProps: PropMapping<P>
) {
  return React.memo(function WithAsyncHandler(props: VP) {
    const convertedProps = Object.entries(asyncProps).reduce(
      (acc, [asyncProp, originalProp]) => ({
        ...acc,
        [originalProp]: async (...args: unknown[]) => {
          const voidFn = props[asyncProp as keyof VP] as (
            ...args: unknown[]
          ) => void;
          voidFn(...args);
          return Promise.resolve();
        },
      }),
      {}
    );

    return (
      <WrappedComponent {...(props as unknown as P)} {...convertedProps} />
    );
  });
}

type BaseFormProps = {
  onSubmit: (e: React.FormEvent) => void;
  children?: React.ReactNode;
};

type AsyncFormProps<T extends BaseFormProps> = Omit<T, 'onSubmit'> & {
  onSubmit: (e: React.FormEvent) => Promise<void>;
};

/**
 * HOC specifically for handling form submissions
 */
export function withAsyncFormHandler<T extends BaseFormProps>(
  WrappedComponent: React.ComponentType<T>
) {
  return React.memo(function WithAsyncFormHandler(props: AsyncFormProps<T>) {
    const { onSubmit } = props;

    const handleSubmit = React.useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        void onSubmit(e);
      },
      [onSubmit]
    );

    const syncProps = {
      ...props,
      onSubmit: handleSubmit,
    } as T;

    return <WrappedComponent {...syncProps} />;
  });
}
