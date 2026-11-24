export interface SkeletonProps {
  className?: string;
}

/**
 * Animated loading placeholder. Marked `aria-hidden` because screen readers
 * should rely on the parent container's loading status instead.
 */
export function Skeleton({ className = 'h-4 w-full' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-sm bg-border/70 ${className}`}
    />
  );
}
