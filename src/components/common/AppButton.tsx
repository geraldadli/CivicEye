import React from 'react';

export function AppButton({
  children,
  variant = 'primary',
  icon,
  onClick,
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: React.ReactNode;
  onClick?: () => void;
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition active:scale-[0.99]';

  const styles = {
    primary:
      'bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-200',
    secondary: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
    ghost: 'bg-transparent text-stone-700 hover:bg-stone-100',
  } as const;

  return (
    <button onClick={onClick} className={`${base} ${styles[variant]}`}>
      {icon}
      {children}
    </button>
  );
}