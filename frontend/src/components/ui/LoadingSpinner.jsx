export default function LoadingSpinner({ size = 'md', color = 'brand' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12', xl: 'w-16 h-16' };
  const colors = { brand: 'border-brand-dark', white: 'border-white', gray: 'border-gray-400' };
  return (
    <div className={`${sizes[size]} border-2 ${colors[color]} border-t-transparent rounded-full animate-spin`} />
  );
}
