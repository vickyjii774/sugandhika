import { useToastContext } from '../context/ToastContext.jsx';

export default function useToast() {
  return useToastContext();
}

export { useToastContext as useToast };
