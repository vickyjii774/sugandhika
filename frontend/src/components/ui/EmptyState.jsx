export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-brand-cream flex items-center justify-center mb-5">
          <Icon className="w-8 h-8 text-brand-light" />
        </div>
      )}
      <h3 className="text-xl font-bold text-gray-700 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 text-sm max-w-sm leading-relaxed mb-6">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
