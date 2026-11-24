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
    <Component className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`} {...rest}>
      {children}
    </Component>
  );
}
