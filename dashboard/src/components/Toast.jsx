import { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext({ addToast: () => {} });

const ICON_MAP = {
  success: CheckCircle,
  error: AlertTriangle,
  info: Info
};

const COLOR_MAP = {
  success: 'var(--color-success)',
  error: 'var(--color-danger)',
  info: 'var(--color-accent)'
};

let toastId = 0;

function ToastItem({ toast, onRemove }) {
  const [exiting, setExiting] = useState(false);
  const Icon = ICON_MAP[toast.type] || Info;

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(toast.id), 200);
    }, toast.duration || 3500);

    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  return (
    <div
      className="flex items-center gap-3 border border-border bg-surface px-4 py-3 shadow-lg min-w-[280px] max-w-[400px]"
      style={{
        animation: exiting ? 'toast-out 200ms ease-in forwards' : 'toast-in 300ms ease-out forwards'
      }}
    >
      <Icon size={16} style={{ color: COLOR_MAP[toast.type], flexShrink: 0 }} />
      <p className="text-[13px] text-text flex-1">{toast.message}</p>
      <button
        type="button"
        className="text-muted hover:text-text transition-colors duration-150"
        onClick={() => {
          setExiting(true);
          setTimeout(() => onRemove(toast.id), 200);
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
