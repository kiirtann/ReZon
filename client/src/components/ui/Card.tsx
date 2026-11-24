import type { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const PADDING_CLASSES = {
  none: '',
  sm: 'p-3',
  md: 'p-4 sm:p-5',
  lg: 'p-6',
};

/**
 * Surface container for product cards, summaries, and auth/checkout panels.
 */
export function Card({ padding = 'md', className = '', children, ...rest }: CardProps) {
  return (
    <div
      className={`rounded-md border border-border bg-bg shadow-card ${PADDING_CLASSES[padding]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`border-b border-border pb-3 ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function CardContent({
  className = '',
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`pt-3 ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`border-t border-border pt-3 ${className}`} {...rest}>
      {children}
    </div>
  );
}
