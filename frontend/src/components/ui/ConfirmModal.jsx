import React from "react";
import { AlertTriangle, X } from "lucide-react";

const ConfirmModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-bg-mid)] text-[var(--color-gray)] hover:bg-[var(--color-border)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>

        <h2 className="text-lg font-semibold text-[var(--color-primary)] mb-2">
          Confirmation
        </h2>
        <p className="text-[var(--color-gray)] text-sm mb-8">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-12 rounded-xl border border-[var(--color-border)] text-[var(--color-gray)] hover:bg-[var(--color-bg-mid)] transition-all duration-300 font-medium"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-12 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all duration-300 font-medium"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
