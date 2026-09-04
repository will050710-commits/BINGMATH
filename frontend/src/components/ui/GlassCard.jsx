'use client';
/**
 * GlassCard — web version
 *
 * Semi-transparent card surface matching the app's dark glass aesthetic.
 * Uses design tokens from globals.css (Colors.bgCard / Colors.border).
 *
 * Variants:
 *  'default' → neutral border, subtle shadow
 *  'glow'    → cyan-accent border + outer glow (e.g. for the hero card, AI card)
 *  'none'    → no predefined class — pass your own className
 *
 * Usage:
 *   <GlassCard>content</GlassCard>
 *   <GlassCard variant="glow" className="p-4">glowing card</GlassCard>
 *   <GlassCard as="section">semantic wrapper</GlassCard>
 */
export default function GlassCard({
  children,
  variant = 'default',
  className = '',
  as: Tag = 'div',
  style = {},
  ...rest
}) {
  const baseClass =
    variant === 'glow'
      ? 'glass-card-glow'
      : variant === 'default'
      ? 'glass-card'
      : '';

  const classes = [baseClass, className].filter(Boolean).join(' ');

  return (
    <Tag className={classes} style={style} {...rest}>
      {children}
    </Tag>
  );
}
