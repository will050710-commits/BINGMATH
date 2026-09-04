'use client';
/**
 * PressableScale — web version
 *
 * Mirrors the RN PressableScale behaviour (scale 0.96 on press,
 * back to 1.0 on release, 90ms / 140ms timing) via CSS class.
 * Wraps any element and adds the `.pressable-scale` class defined
 * in globals.css.
 *
 * Usage:
 *   <PressableScale onClick={fn} className="my-button">
 *     Click me
 *   </PressableScale>
 *
 *   // with extra classes
 *   <PressableScale onClick={fn} className="pressable-scale my-button">
 *
 * Pass `as` to render a different element (default: "button").
 */
export default function PressableScale({
  children,
  onClick,
  className = '',
  as: Tag = 'button',
  disabled,
  style,
  ...rest
}) {
  const classes = ['pressable-scale', className].filter(Boolean).join(' ');

  return (
    <Tag
      className={classes}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
