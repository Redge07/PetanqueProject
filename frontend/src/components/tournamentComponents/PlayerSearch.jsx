import React from "react";
import { Search, X, ChevronDown, SlidersHorizontal } from "lucide-react";

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

const formatRound = (r) => (r === 4 ? "Phase finale" : `Round ${r}`);
const formatTour = (t) => {
  if (t == 1) return "Finale";
  if (t == 0.5) return "Finale B vs B2";
  return `1/${t} de finale`;
};

const SelectFilter = ({ value, onChange, placeholder, options, formatLabel }) => (
  <div className="relative flex-1 min-w-[130px]">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-9 pl-3 pr-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 text-[var(--color-primary)] text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors cursor-pointer appearance-none"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {formatLabel(o)}
        </option>
      ))}
    </select>
    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-gray-light)] pointer-events-none" />
  </div>
);

const PlayerSearch = ({ query, setQuery, options = {}, filters, setFilters }) => {
  const { groupes = [], rounds = [], tours = [] } = options;
  const visibleTours = tours.filter((t) => t > 0);
  const hasFilters = query.trim() || filters?.groupe || filters?.round || filters?.tour;

  const clearAll = () => {
    setQuery("");
    setFilters?.({ groupe: "", round: "", tour: "" });
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-xl mb-6">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[var(--color-primary)]" />
          <h3 className="font-semibold text-[var(--color-primary)] text-sm">
            Recherche & filtres
          </h3>
        </div>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-[var(--color-gray-light)] hover:text-[var(--color-primary)] flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" />
            Réinitialiser
          </button>
        )}
      </div>

      <div className="relative mb-3">
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

      {setFilters && (
        <div className="flex gap-2 flex-wrap">
          {groupes.length > 1 && (
            <SelectFilter
              value={filters?.groupe || ""}
              onChange={(v) => setFilters((f) => ({ ...f, groupe: v }))}
              placeholder="Tous les groupes"
              options={[...groupes].sort(
                (a, b) =>
                  ["A", "B", "B2", "C"].indexOf(a) -
                  ["A", "B", "B2", "C"].indexOf(b),
              )}
              formatLabel={(g) => `Groupe ${g}`}
            />
          )}
          {rounds.length > 1 && (
            <SelectFilter
              value={filters?.round || ""}
              onChange={(v) => setFilters((f) => ({ ...f, round: v }))}
              placeholder="Tous les rounds"
              options={[...rounds].sort((a, b) => a - b)}
              formatLabel={formatRound}
            />
          )}
          {visibleTours.length > 1 && (
            <SelectFilter
              value={filters?.tour || ""}
              onChange={(v) => setFilters((f) => ({ ...f, tour: v }))}
              placeholder="Tous les tours"
              options={[...visibleTours].sort((a, b) => b - a)}
              formatLabel={formatTour}
            />
          )}
        </div>
      )}

      {hasFilters && (
        <p className="text-xs text-[var(--color-gold)] mt-2">
          Affichage filtré — réinitialisez pour revoir tous les matchs.
        </p>
      )}
    </div>
  );
};

export default PlayerSearch;
