import React, { useState } from "react";
import { X, Copy, Check, Share2 } from "lucide-react";

const ShareModal = ({ tournament, onClose }) => {
  const [copied, setCopied] = useState(false);

  const joinUrl = `${window.location.origin}/?id=${tournament.id}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(String(tournament.id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `Concours ${tournament.name}`,
        text: `Rejoignez le concours "${tournament.name}" (n°${tournament.id}) sur PétanqueManager !`,
        url: joinUrl,
      });
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-bg-mid)] text-[var(--color-gray)] hover:bg-[var(--color-border)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Share2 className="w-6 h-6 text-[var(--color-gold)]" />
        </div>

        <h2 className="text-lg font-semibold text-[var(--color-primary)] mb-1">
          {tournament.name}
        </h2>
        <p className="text-sm text-[var(--color-gray)] mb-6">
          Partagez ce numéro aux participants pour qu'ils s'inscrivent
        </p>

        {/* ID en gros */}
        <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-2xl p-4 mb-4">
          <p className="text-xs text-white/60 mb-1">Numéro du concours</p>
          <p className="text-5xl font-bold text-[var(--color-gold)] tracking-widest">
            {tournament.id}
          </p>
        </div>

        {/* QR code */}
        <div className="flex justify-center mb-6">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(joinUrl)}&bgcolor=ffffff&color=1e3a5f&margin=8`}
            alt={`QR code du concours ${tournament.id}`}
            className="rounded-xl border border-[var(--color-border)]"
            width={160}
            height={160}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl font-medium transition-all duration-300 ${
              copied
                ? "bg-green-100 text-green-600 border border-green-200"
                : "bg-[var(--color-bg-mid)] text-[var(--color-primary)] hover:bg-[var(--color-border)]"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copié !
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copier
              </>
            )}
          </button>

          {typeof navigator !== "undefined" && navigator.share && (
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 h-12 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white rounded-xl font-medium hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-all duration-300"
            >
              <Share2 className="w-4 h-4" />
              Partager
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
