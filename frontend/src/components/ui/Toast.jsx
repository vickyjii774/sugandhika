import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToastContext } from '../../context/ToastContext.jsx';

const TOAST_STYLES = {
  success: {
    border: 'border-l-green-500',
    icon: <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />,
    bg: 'bg-white',
  },
  error: {
    border: 'border-l-red-500',
    icon: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
    bg: 'bg-white',
  },
  warning: {
    border: 'border-l-yellow-500',
    icon: <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />,
    bg: 'bg-white',
  },
  info: {
    border: 'border-l-blue-500',
    icon: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
    bg: 'bg-white',
  },
};

function ToastItem({ toast, onRemove }) {
  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => onRemove(toast.id), toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className={`flex items-start gap-3 ${style.bg} ${style.border} border-l-4 rounded-lg shadow-lg px-4 py-3 min-w-[280px] max-w-sm pointer-events-auto animate-slide-in`}
      role="alert"
    >
      {style.icon}
      <p className="flex-1 text-sm text-gray-800 leading-relaxed">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-1 p-0.5 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function Toast() {
  const { toasts, removeToast } = useToastContext();

  if (!toasts.length) return null;

  return createPortal(
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>,
    document.body
  );
}
