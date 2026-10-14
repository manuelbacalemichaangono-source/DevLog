import React from 'react';
import { useLibrary } from '../context/LibraryContext';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useLibrary();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />;
        let borderClass = 'border-slate-200';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />;
          borderClass = 'border-emerald-200 bg-white';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />;
          borderClass = 'border-amber-200 bg-white';
        } else if (toast.type === 'error') {
          icon = <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />;
          borderClass = 'border-rose-200 bg-white';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg transition-all duration-200 ${borderClass} bg-white text-slate-900`}
            role="status"
          >
            {icon}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 leading-tight">{toast.title}</p>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 transition-colors p-1 -mr-1 -mt-1 rounded"
              aria-label="Fermer la notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
