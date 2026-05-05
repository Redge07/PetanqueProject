import React from "react";

const ClassementTournament = ({ dataPlayer }) => {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl mt-4">
      {dataPlayer.groupe && (
        <p className="text-[var(--color-gray)] mb-2">
          Tu es dans le groupe{" "}
          <span className="font-semibold text-[var(--color-primary)]">
            {dataPlayer.groupe}
          </span>
        </p>
      )}
      <p className="text-[var(--color-gray)]">
        Tu es actuellement{" "}
        <span className="font-semibold text-[var(--color-primary)]">
          {dataPlayer.round == 4
            ? dataPlayer.class != 0
              ? dataPlayer.class == 1
                ? `en finale de ton groupe`
                : `en 1/${dataPlayer.class} de finale de ton groupe`
              : `a la fin des 3 matchs de poules, il faut attendre que tout le monde finissent ses 3 matchs pour procéder à la sélection des qualifiés`
            : `au match numéro ${dataPlayer.round} de la phase de poule`}
        </span>
      </p>
    </div>
  );
};

export default ClassementTournament;
