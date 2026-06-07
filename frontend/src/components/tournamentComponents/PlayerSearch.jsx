import React from "react";
import { Search, MapPin, X } from "lucide-react";

// Filtre les matchs selon le nom ou numéro recherché (sur les 2 joueurs du match)
export function filterMatchesByPlayer(matches, query) {
  const q = query.trim().toLowerCase();
  if (!q) return matches;
  return matches.filter((m) => {
    const names = [m.pseudo_A, m.pseudo_B]
      .filter(Boolean)
      .some((p) => p.toLowerCase().includes(q));
    const nums = [m.id_playerA, m.id_playerB]
      .filter(Boolean)
      .some((n) => String(n) === q);
    return names || nums;
  });
}

// Barre de recherche contrôlée — filtre l'affichage des matchs
const PlayerSearch = ({ query, setQuery }) => {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-xl mb-6">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
        <h3 className="font-semibold text-[var(--color-primary)] text-sm">
          Chercher un joueur
        </h3>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-gray-light)]" />
        <input
          type="text"
          placeholder="Nom ou numéro du joueur..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-11 pl-10 pr-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 text-[var(--color-primary)] placeholder-[var(--color-gray-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-gray-light)] hover:text-[var(--color-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {query.trim() && (
        <p className="text-xs text-[var(--color-gold)] mt-2">
          Affichage filtré — effacez la recherche pour revoir tous les matchs.
        </p>
      )}
    </div>
  );
};

export default PlayerSearch;
