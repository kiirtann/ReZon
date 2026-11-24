import type { HTMLAttributes } from 'react';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'section';
}

/**
 * Responsive max-width page container aligned with the UI design contract.
 */
export function Container({
  as: Component = 'div',
  className = '',
  children,
  ...rest
}: ContainerProps) {
  return (
    <Component
      className={`mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-10 xl:px-12 ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}
