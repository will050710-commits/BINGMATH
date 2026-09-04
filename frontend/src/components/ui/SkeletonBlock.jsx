'use client';
/**
 * SkeletonBlock — web version
 *
 * A shimmering placeholder block for loading states.
 * Uses the `.skeleton-block` (pulse) or `.skeleton-shimmer` (sweep)
 * class from globals.css.
 *
 * Usage:
 *   // Simple pulse block
 *   <SkeletonBlock width="60%" height={14} />
 *
 *   // Circle
 *   <SkeletonBlock width={40} height={40} radius="50%" />
 *
 *   // Sweep shimmer variant
 *   <SkeletonBlock width="80%" height={12} variant="shimmer" />
 *
 * Pre-composed shapes:
 *   <LeaderboardRowSkeleton />
 *   <CardSkeleton />
 */
export function SkeletonBlock({
  width = '100%',
  height = 14,
  radius = 6,
  variant = 'pulse',   // 'pulse' | 'shimmer'
  style = {},
}) {
  const cls = variant === 'shimmer' ? 'skeleton-shimmer' : 'skeleton-block';
  return (
    <div
      className={cls}
      style={{
        width,
        height,
        borderRadius: radius,
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

/** Leaderboard row skeleton — rank · avatar · name/school · xp */
export function LeaderboardRowSkeleton() {
  return (
    <div className="skeleton-lb-row">
      <SkeletonBlock width={28} height={20} radius={6} />
      <SkeletonBlock width={34} height={34} radius="50%" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <SkeletonBlock width="55%" height={13} />
        <SkeletonBlock width="35%" height={10} />
      </div>
      <SkeletonBlock width={44} height={16} />
    </div>
  );
}

/** Generic card skeleton */
export function CardSkeleton({ height = 120 }) {
  return (
    <div className="skeleton-card" style={{ height }}>
      <SkeletonBlock width="60%" height={14} variant="shimmer" />
      <SkeletonBlock width="85%" height={10} variant="shimmer" />
      <SkeletonBlock width="40%" height={10} variant="shimmer" />
    </div>
  );
}
