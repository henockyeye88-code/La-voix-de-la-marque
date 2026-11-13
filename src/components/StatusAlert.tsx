import React from 'react';
import { AlertCircle, X, ExternalLink } from 'lucide-react';

interface StatusAlertProps {
  message: string | null;
  onDismiss: () => void;
  type?: 'error' | 'warning' | 'info';
}

export const StatusAlert: React.FC<StatusAlertProps> = ({
  message,
  onDismiss,
  type = 'error'
}) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="p-4 rounded-xl bg-[#231519] border border-rose-500/40 text-rose-200 text-sm flex items-start justify-between gap-3 shadow-lg animate-fade-in"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-rose-300">Attention</p>
          <p className="text-xs sm:text-sm text-rose-200/90 leading-relaxed">{message}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="text-rose-400 hover:text-rose-200 transition p-1 cursor-pointer shrink-0"
        aria-label="Fermer l'alerte"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
