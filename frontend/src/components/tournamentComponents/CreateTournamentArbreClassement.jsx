import React from "react";

const CreateTournamentArbreClassement = ({
  handleGoArbreClassement,
  errorLengthArbre,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
      <form onSubmit={handleGoArbreClassement} className="space-y-4">
        {["A", "B", "C"].map((g) => {
          return (
            <div key={g} className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-[var(--color-primary)]">
                Taille de l'arbre du groupe {g}
              </span>
              <select
                name={g}
                defaultValue={g === "A" ? "8" : "0"}
                className="h-10 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              >
                {g == "A" ? null : <option value="0">Pas de tournoi</option>}
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="4">4</option>
                <option value="8">8</option>
                <option value="16">16</option>
                <option value="32">32</option>
              </select>
            </div>
          );
        })}
        <input
          type="submit"
          value="Go Tournoi en arbres"
          className="w-full h-12 bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white rounded-xl font-medium cursor-pointer hover:opacity-90 transition-all duration-300"
        />
      </form>
      {errorLengthArbre && (
        <p className="mt-3 text-sm text-red-500 bg-red-50 rounded-xl p-3">
          {errorLengthArbre}
        </p>
      )}
    </div>
  );
};

export default CreateTournamentArbreClassement;
