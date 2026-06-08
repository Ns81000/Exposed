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
      className="acrylic-panel px-4 py-3 shadow-lg min-w-[280px] max-w-[420px] bg-surface-1 flex items-center gap-3 transition-all duration-150"
      style={{
        animation: exiting ? 'toast-out 180ms ease-in forwards' : 'toast-in 250ms ease-out forwards'
      }}
    >
      <Icon size={15} style={{ color: COLOR_MAP[toast.type] }} strokeWidth={2} className="flex-shrink-0" />
      <p className="text-[13px] text-text flex-1 font-medium font-sans leading-snug">{toast.message}</p>
      <button
        type="button"
        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-surface-2 text-muted hover:text-text transition-colors duration-150 flex-shrink-0"
        onClick={() => {
          setExiting(true);
          setTimeout(() => onRemove(toast.id), 200);
        }}
      >
        <X size={13} />
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
