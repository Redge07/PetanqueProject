import React from "react";
import { X, Trophy } from "lucide-react";

const RecompenseWinner = ({ recompenseModal, setRecompenseModal }) => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm w-full relative">
        <button
          onClick={() => setRecompenseModal(null)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-bg-mid)] text-[var(--color-gray)] hover:bg-[var(--color-border)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 bg-[var(--color-gold)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-[var(--color-gold)]" />
        </div>

        <h2 className="text-xl font-semibold text-[var(--color-primary)] mb-3">
          Récompense
        </h2>

        <p className="text-[var(--color-gray)] text-sm mb-6">
          <span className="font-semibold text-[var(--color-primary)]">
            {recompenseModal.pseudo}
          </span>{" "}
          reçoit une récompense pour sa victoire en{" "}
          <span className="font-semibold text-[var(--color-primary)]"></span>
        </p>

        <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-2xl p-4">
          <p className="text-3xl font-bold text-[var(--color-gold)]">
            {recompenseModal.recompense}€
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecompenseWinner;
