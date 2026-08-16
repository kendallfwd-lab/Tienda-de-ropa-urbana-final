import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemName?: string;
  confirmButtonText?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title,
  message,
  itemName,
  confirmButtonText = 'Eliminar definitivamente',
  isLoading = false,
  onConfirm,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-70 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white border-2 border-zinc-950 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Close icon button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-100 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-zinc-950 uppercase font-heading">
              {title}
            </h3>
            <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Acción irreversible
            </span>
          </div>
        </div>

        {/* Message & Target Name */}
        <div className="space-y-2 text-xs text-zinc-600 leading-relaxed">
          <p>{message}</p>
          {itemName && (
            <div className="p-3 bg-zinc-100 border border-zinc-200 rounded-xl font-mono font-bold text-zinc-900 break-words">
              {itemName}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl border-2 border-zinc-200 hover:border-zinc-400 bg-white text-zinc-700 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isLoading ? 'Eliminando...' : confirmButtonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
