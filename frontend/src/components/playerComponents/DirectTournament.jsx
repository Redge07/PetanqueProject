import React, { useState } from "react";
import ViewTournament from "./ViewTournament";
import Order from "../tournamentComponents/Order";
import { Swords, BarChart2, List, ChevronDown, Clock } from "lucide-react";
import { getFormatLabel } from "../../utils/formatLabels";

const getStade = (dataPlayer) => {
  if (dataPlayer.style === "classement") {
    if (dataPlayer.round == 4) {
      if (dataPlayer.class == 0) return "Attente des qualifiés";
      if (dataPlayer.class == 1) return "Finale de groupe";
      return `1/${dataPlayer.class} de finale de groupe`;
    }
    return `Tour ${dataPlayer.round} des poules`;
  }
  if (dataPlayer.style === "cascade") {
    if (dataPlayer.round == 4) {
      if (dataPlayer.class == 1) return "Finale de groupe";
      if (dataPlayer.class == 0.5) return "Finale B / B2";
      return `1/${dataPlayer.class} de finale de groupe`;
    }
    return `Round ${dataPlayer.round}`;
  }
  if (dataPlayer.style === "arbre") {
    if (dataPlayer.class == 1) return "Finale du tournoi";
    return `1/${dataPlayer.class} de finale`;
  }
  return "";
};

const DirectTournament = ({ dataPlayer }) => {
  const [showOrder, setShowOrder] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const stade = getStade(dataPlayer);
  const hasOpponent = !!dataPlayer.idVersus;

  return (
    <div className="mt-6 space-y-4">

      {/* 1. Carte adversaire — info principale */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between gap-2 mb-5">
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-[var(--color-primary)]" />
            <p className="text-sm font-semibold text-[var(--color-primary)]">
              Votre match
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--color-gray)]">
            {dataPlayer.groupe && (
              <span className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium px-2 py-1 rounded-lg">
                Groupe {dataPlayer.groupe}
              </span>
            )}
            {stade && (
              <span className="bg-[var(--color-gold)]/10 text-[var(--color-gold)] font-medium px-2 py-1 rounded-lg">
                {stade}
              </span>
            )}
          </div>
        </div>

        {hasOpponent ? (
          <>
            <div className="flex items-center gap-3">
              {/* Moi */}
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] text-white text-xl font-bold flex items-center justify-center shadow-md">
                  {dataPlayer.numero}
                </div>
                <p className="font-semibold text-[var(--color-primary)] text-sm text-center">
                  Vous
                </p>
              </div>

              {/* VS */}
              <div className="flex items-center justify-center">
                <span className="text-xs font-bold text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] px-3 py-1.5 rounded-full shadow">
                  VS
                </span>
              </div>

              {/* Adversaire */}
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-gold)] to-amber-400 text-white text-xl font-bold flex items-center justify-center shadow-md">
                  {dataPlayer.idVersus}
                </div>
                <p className="font-semibold text-[var(--color-primary)] text-sm text-center">
                  {dataPlayer.pseudoVersus}
                </p>
              </div>
            </div>

            {dataPlayer.barrage == 1 && (
              <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
                <span className="text-sm font-semibold text-orange-600">
                  Match de barrage
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4 text-[var(--color-gray)]">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-bg-mid)] border-2 border-dashed border-[var(--color-border)] flex items-center justify-center">
              <Clock className="w-6 h-6 text-[var(--color-gray-light)]" />
            </div>
            <p className="text-sm">En attente d'un adversaire</p>
          </div>
        )}
      </div>

      {/* 2. Contexte compact */}
      <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-2xl px-5 py-4 shadow-xl text-white">
        <p className="font-semibold truncate">{dataPlayer.tournamentName}</p>
        <p className="text-white/70 text-sm mt-0.5">
          {getFormatLabel(dataPlayer.style)} · Numéro {dataPlayer.numero}
        </p>
      </div>

      {/* 3. Classement (mode classement uniquement) */}
      {dataPlayer.style === "classement" && (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
          <button
            onClick={() => setShowOrder((v) => !v)}
            className="w-full flex items-center justify-between px-6 py-4 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[var(--color-gold)]/10 rounded-xl flex items-center justify-center">
                <BarChart2 className="w-4 h-4 text-[var(--color-gold)]" />
              </div>
              <span className="font-semibold text-[var(--color-primary)] text-sm">
                Classement des poules
              </span>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-[var(--color-gray)] transition-transform duration-300 ${showOrder ? "rotate-180" : ""}`}
            />
          </button>
          {showOrder && (
            <div className="px-6 pb-6 border-t border-[var(--color-border)]">
              <div className="pt-4">
                <Order idTournament={dataPlayer.id_tournament} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Détails des matches */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
        <button
          onClick={() => setShowDetails((v) => !v)}
          className="w-full flex items-center justify-between px-6 py-4 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center">
              <List className="w-4 h-4 text-[var(--color-primary)]" />
            </div>
            <span className="font-semibold text-[var(--color-primary)] text-sm">
              Détails du tournoi
            </span>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-[var(--color-gray)] transition-transform duration-300 ${showDetails ? "rotate-180" : ""}`}
          />
        </button>
        {showDetails && (
          <div className="px-6 pb-6 border-t border-[var(--color-border)]">
            <div className="pt-4">
              <ViewTournament
                idTournament={dataPlayer.id_tournament}
                style={dataPlayer.style}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectTournament;
