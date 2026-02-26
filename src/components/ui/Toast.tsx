"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, X } from "lucide-react";
import clsx from "clsx";

type ToastType = "success" | "error" | "warning";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-sf-success" />,
    error: <XCircle className="h-5 w-5 text-sf-error" />,
    warning: <AlertTriangle className="h-5 w-5 text-sf-warning" />,
  };

  const bgColors = {
    success: "bg-green-50 border-sf-success",
    error: "bg-red-50 border-sf-error",
    warning: "bg-yellow-50 border-sf-warning",
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={clsx(
              "flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg animate-in fade-in slide-in-from-right",
              bgColors[t.type]
            )}
          >
            {icons[t.type]}
            <span className="text-sm text-sf-text">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="ml-2 text-sf-text-weak hover:text-sf-text">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
