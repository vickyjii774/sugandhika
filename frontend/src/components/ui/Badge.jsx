const variantClasses = {
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  blue: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-100 text-gray-700',
  brand: 'bg-brand-cream text-brand-dark',
  gold: 'bg-yellow-50 text-brand-gold border border-brand-gold',
  dark: 'bg-brand-dark text-white',
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
};

export default function Badge({
  children,
  variant = 'brand',
  size = 'md',
  className = '',
  dot = false,
}) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 font-medium rounded-full',
        variantClasses[variant] || variantClasses.brand,
        sizeClasses[size] || sizeClasses.md,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {dot && (
        <span
          className={[
            'w-1.5 h-1.5 rounded-full',
            variant === 'green' ? 'bg-green-500' :
            variant === 'red' ? 'bg-red-500' :
            variant === 'yellow' ? 'bg-yellow-500' :
            variant === 'blue' ? 'bg-blue-500' : 'bg-current',
          ].join(' ')}
        />
      )}
      {children}
    </span>
  );
}
