import React from "react";

const ArbreTournament = ({ dataPlayer }) => {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl mt-4">
      <p className="text-[var(--color-gray)]">
        Tu es actuellement en{" "}
        <span className="font-semibold text-[var(--color-primary)]">
          {dataPlayer.class == 1
            ? "finale du tournoi"
            : `1/${dataPlayer.class} de finale du tournoi.`}
        </span>
      </p>
    </div>
  );
};

export default ArbreTournament;
