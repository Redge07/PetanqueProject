import React from "react";

const CascadeTournament = ({ dataPlayer }) => {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl mt-4">
      <p className="text-[var(--color-gray)] mb-2">
        Tu es dans le groupe{" "}
        <span className="font-semibold text-[var(--color-primary)]">
          {dataPlayer.groupe}
        </span>
      </p>
      <p className="text-[var(--color-gray)]">
        Tu es actuellement{" "}
        <span className="font-semibold text-[var(--color-primary)]">
          {dataPlayer.round == 4
            ? dataPlayer.class == 1
              ? `en finale de ton groupe`
              : dataPlayer.class == 0.5 && dataPlayer.groupe == "B"
                ? "dans la grande finale qui voit s'affronter le vainqueur du groupe B au vainqueur du groupe B2"
                : `en 1/${dataPlayer.class} de finale de ton groupe`
            : `au match numéro ${dataPlayer.round} de la phase de groupe`}
        </span>
      </p>
      {dataPlayer.barrage == 1 && (
        <p className="mt-3 text-sm font-medium text-green-600 bg-green-50 rounded-xl p-3">
          Vous faites un barrage
        </p>
      )}
    </div>
  );
};

export default CascadeTournament;
