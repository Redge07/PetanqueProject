import React, { useState } from "react";
import ClassementPlayer from "./ClassementPlayer";
import CascadePlayer from "./CascadePlayer";
import ArbrePlayer from "./ArbrePlayer";
import ViewTournament from "./ViewTournament";
import Order from "../tournamentComponents/Order";
import { Swords, BarChart2, List } from "lucide-react";

const DirectTournament = ({ dataPlayer }) => {
  // State pour afficher ou non le classement
  const [showOrder, setShowOrder] = useState(false);
  // State pour afficher le détails/autre match du tournoi
  const [showDetailsTournament, setShowDetailsTournament] = useState(false);

  // En fonction du tournoi auquel est inscrit le joueur, on affiche quelque chose de différent sur sa situation
  const formatTournament = {
    arbre: ArbrePlayer,
    cascade: CascadePlayer,
    classement: ClassementPlayer,
  };

  const TournamentComponent = formatTournament[dataPlayer.style];
  return (
    <div className="mt-6 space-y-4">
      {/* Carte principale du tournoi */}
      <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-2xl p-6 shadow-xl text-white">
        <p className="text-[var(--color-gold)] text-sm font-medium mb-1">
          Tournoi en cours
        </p>
        <h2 className="text-2xl font-semibold mb-1">
          {dataPlayer.tournamentName}
        </h2>
        <p className="text-white/70 text-sm">
          Mode {dataPlayer.style} • Numéro {dataPlayer.numero}
        </p>
      </div>

      {/* Composant qui montre la situation d'un joueur dans un tournoi précis */}
      {TournamentComponent && <TournamentComponent dataPlayer={dataPlayer} />}

      {/* Adversaire */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center">
            <Swords className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <h3 className="font-semibold text-[var(--color-primary)]">
            Adversaire
          </h3>
        </div>
        <p className="text-[var(--color-gray)]">
          {dataPlayer.idVersus ? (
            <>
              Vous affrontez{" "}
              <span className="font-semibold text-[var(--color-primary)]">
                {dataPlayer.pseudoVersus}
              </span>{" "}
              qui est le numéro{" "}
              <span className="font-semibold text-[var(--color-primary)]">
                {dataPlayer.idVersus}
              </span>
            </>
          ) : (
            "Vous n'avez pas d'adversaire pour le moment"
          )}
        </p>
      </div>

      {/* Si on est dans un tournoi "classement" */}
      {dataPlayer.style == "classement" && (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[var(--color-gold)]/10 rounded-xl flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-[var(--color-gold)]" />
            </div>
            <h3 className="font-semibold text-[var(--color-primary)]">
              Classement
            </h3>
          </div>

          {/* On peut afficher le classement */}
          <button
            onClick={() => setShowOrder(!showOrder)}
            className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-[var(--color-primary)] hover:bg-[var(--color-bg-mid)] transition-all duration-300 text-sm font-medium"
          >
            {showOrder ? "Masquer le classement" : "Voir le classement"}
          </button>

          {showOrder && <Order idTournament={dataPlayer.id_tournament} />}
        </div>
      )}

      {/* Détails des matches */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center">
            <List className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <h3 className="font-semibold text-[var(--color-primary)]">
            Détails du tournoi
          </h3>
        </div>

        {/* On peut montrer les autres matches du tournoi pour voir on en est ou */}
        <button
          onClick={() => setShowDetailsTournament(!showDetailsTournament)}
          className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-[var(--color-primary)] hover:bg-[var(--color-bg-mid)] transition-all duration-300 text-sm font-medium"
        >
          {showDetailsTournament
            ? "Masquer les matches"
            : "Voir le détail des matches"}
        </button>

        {showDetailsTournament && (
          <ViewTournament
            idTournament={dataPlayer.id_tournament}
            style={dataPlayer.style}
          />
        )}
      </div>
    </div>
  );
};

export default DirectTournament;
