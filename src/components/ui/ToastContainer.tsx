import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';
import { useSchoolStore } from '../../store/SchoolStore';

export function ToastContainer() {
  const { toasts, dismissToast } = useSchoolStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="no-print fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)]"
    >
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'success'
            ? CheckCircle2
            : toast.type === 'error'
              ? AlertCircle
              : Info;
        const iconColor =
          toast.type === 'success'
            ? 'text-[#1F7A4D]'
            : toast.type === 'error'
              ? 'text-red-600'
              : 'text-[#1B2A6B]';

        return (
          <div
            key={toast.id}
            role="status"
            className="flex items-start gap-3 bg-white border border-slate-200 rounded-lg p-3.5 shadow-md text-slate-800"
          >
            <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1B2A6B] font-bn">{toast.title}</p>
              {toast.description && (
                <p className="text-xs text-slate-600 mt-0.5 font-bn">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label={`Dismiss notification: ${toast.title}`}
              className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
