import React from "react";
import { ChevronLeft, Check } from "lucide-react";

const formatTour = (t) => {
  if (t == 1) return "Finale";
  if (t == 0.5) return "Finale B/B2";
  return `1/${t} de finale`;
};

const GROUP_ORDER = ["A", "B", "B2", "C"];

// ─── Slot joueur (moitié d'une carte match) ───────────────────────────────────
const PlayerSlot = ({ id, pseudo, won, done, align = "left" }) => {
  if (!id) {
    return (
      <div className={`flex items-center gap-1 flex-1 min-w-0 ${align === "right" ? "justify-end" : ""}`}>
        {align === "right" && <span className="text-xs text-[var(--color-gray-light)] italic">?</span>}
        <span className="w-5 h-5 rounded-full bg-[var(--color-bg)] border border-dashed border-[var(--color-border)] flex-shrink-0" />
        {align === "left" && <span className="text-xs text-[var(--color-gray-light)] italic">?</span>}
      </div>
    );
  }
  return (
    <div className={`flex items-center gap-1 flex-1 min-w-0 ${align === "right" ? "justify-end" : ""} ${done && !won ? "opacity-30" : ""}`}>
      {align === "right" && won && <Check className="w-3 h-3 text-green-500 flex-shrink-0" />}
      {align === "right" && (
        <span className={`text-xs truncate text-right ${won ? "font-semibold text-[var(--color-primary)]" : "text-[var(--color-gray)]"}`}>
          {pseudo}
        </span>
      )}
      <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0
        ${won ? (align === "left" ? "bg-[var(--color-primary)]" : "bg-[var(--color-gold)]") + " text-white"
               : "bg-[var(--color-bg)] text-[var(--color-gray)] border border-[var(--color-border)]"}`}>
        {id}
      </span>
      {align === "left" && (
        <span className={`text-xs truncate ${won ? "font-semibold text-[var(--color-primary)]" : "text-[var(--color-gray)]"}`}>
          {pseudo}
        </span>
      )}
      {align === "left" && won && <Check className="w-3 h-3 text-green-500 flex-shrink-0" />}
    </div>
  );
};

// ─── Carte match ──────────────────────────────────────────────────────────────
const MatchCard = ({ match, showScore }) => {
  const isDone = match.id_winner > 0;
  const aWon = isDone && match.id_winner === match.id_playerA;
  const bWon = isDone && match.id_winner === match.id_playerB;

  return (
    <div className="relative group cursor-default">
      {/* Carte compacte */}
      <div className="flex items-center gap-1.5 bg-white rounded-xl px-2.5 py-2 border border-[var(--color-border)]/60">
        <PlayerSlot id={match.id_playerA} pseudo={match.pseudo_A} won={aWon} done={isDone} align="left" />
        <div className="flex-shrink-0 text-center w-10">
          {showScore && isDone && match.score_A != null ? (
            <span className="text-[10px] font-bold text-[var(--color-gray)]">
              {match.score_A}–{match.score_B}
            </span>
          ) : (
            <span className="text-[10px] text-[var(--color-gray-light)]">vs</span>
          )}
        </div>
        <PlayerSlot id={match.id_playerB} pseudo={match.pseudo_B} won={bWon} done={isDone} align="right" />
      </div>

      {/* Tooltip au hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none
                      invisible group-hover:visible opacity-0 group-hover:opacity-100
                      transition-opacity duration-150 w-56">
        <div className="bg-white rounded-xl shadow-xl border border-[var(--color-border)] p-3">
          <div className="flex items-start justify-between gap-3">
            {/* Joueur A */}
            <div className={`flex-1 min-w-0 ${isDone && !aWon ? "opacity-40" : ""}`}>
              <p className="text-[10px] text-[var(--color-gray-light)] mb-0.5">#{match.id_playerA || "?"}</p>
              <p className={`text-sm font-medium break-words leading-tight ${aWon ? "text-[var(--color-primary)]" : "text-[var(--color-gray)]"}`}>
                {match.pseudo_A || "À déterminer"}
                {aWon && <Check className="w-3 h-3 text-green-500 inline ml-1" />}
              </p>
            </div>

            {/* Score ou vs */}
            <div className="flex-shrink-0 flex flex-col items-center pt-3">
              {showScore && isDone && match.score_A != null ? (
                <span className="text-xs font-bold text-[var(--color-gray)]">{match.score_A}–{match.score_B}</span>
              ) : (
                <span className="text-xs text-[var(--color-gray-light)]">vs</span>
              )}
            </div>

            {/* Joueur B */}
            <div className={`flex-1 min-w-0 text-right ${isDone && !bWon ? "opacity-40" : ""}`}>
              <p className="text-[10px] text-[var(--color-gray-light)] mb-0.5">#{match.id_playerB || "?"}</p>
              <p className={`text-sm font-medium break-words leading-tight ${bWon ? "text-[var(--color-primary)]" : "text-[var(--color-gray)]"}`}>
                {bWon && <Check className="w-3 h-3 text-green-500 inline mr-1" />}
                {match.pseudo_B || "À déterminer"}
              </p>
            </div>
          </div>
        </div>
        {/* Petite flèche */}
        <div className="w-2.5 h-2.5 bg-white border-r border-b border-[var(--color-border)] rotate-45 mx-auto -mt-1.5" />
      </div>
    </div>
  );
};

// ─── Grille de matchs (responsive : 1 → 2 → 4 colonnes) ─────────────────────
const MatchGrid = ({ matches, showScore }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5">
    {matches.map((m, i) => (
      <MatchCard key={i} match={m} showScore={showScore} />
    ))}
  </div>
);

// ─── En-têtes de section ──────────────────────────────────────────────────────
const SectionHeader = ({ label }) => (
  <div className="flex items-center gap-3 mt-5 mb-2 first:mt-0">
    <div className="h-px flex-1 bg-[var(--color-border)]" />
    <p className="text-xs font-semibold text-[var(--color-gray)] uppercase tracking-wide whitespace-nowrap">
      {label}
    </p>
    <div className="h-px flex-1 bg-[var(--color-border)]" />
  </div>
);

const TourLabel = ({ label }) => (
  <div className="flex items-center gap-2 mt-3 mb-1.5 first:mt-0">
    <div className="h-px flex-1 bg-[var(--color-gold)]/20" />
    <p className="text-xs text-[var(--color-gold)] font-semibold whitespace-nowrap">{label}</p>
    <div className="h-px flex-1 bg-[var(--color-gold)]/20" />
  </div>
);

const GroupBlock = ({ label, children }) => (
  <div className="mb-4 last:mb-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-mid)]/40 p-3">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-6 h-6 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
        <span className="text-xs font-bold text-[var(--color-primary)]">{label}</span>
      </div>
      <span className="text-sm font-semibold text-[var(--color-primary)]">Groupe {label}</span>
    </div>
    {children}
  </div>
);

// ─── Vue Cascade ──────────────────────────────────────────────────────────────
const CascadeView = ({ matches }) => {
  const groupes = [...new Set(matches.map((m) => m.groupe).filter(Boolean))].sort(
    (a, b) => GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b),
  );

  return (
    <>
      {groupes.map((g) => {
        const gMatches = matches.filter((m) => m.groupe === g);
        const pouleMatches = gMatches.filter((m) => m.round < 4);
        const finaleMatches = gMatches.filter((m) => m.round == 4);
        const rounds = [...new Set(pouleMatches.map((m) => m.round))].sort((a, b) => a - b);
        const tours = [...new Set(finaleMatches.map((m) => m.class))].filter((t) => t > 0).sort((a, b) => b - a);

        return (
          <GroupBlock key={g} label={g}>
            {rounds.map((r) => (
              <div key={r}>
                <SectionHeader label={`Round ${r}`} />
                <MatchGrid matches={pouleMatches.filter((m) => m.round === r)} showScore={false} />
              </div>
            ))}
            {tours.length > 0 && (
              <>
                <SectionHeader label="Phase finale" />
                {tours.map((t) => (
                  <div key={t}>
                    <TourLabel label={formatTour(t)} />
                    <MatchGrid matches={finaleMatches.filter((m) => m.class == t)} showScore={false} />
                  </div>
                ))}
              </>
            )}
          </GroupBlock>
        );
      })}
    </>
  );
};

// ─── Vue Arbre ────────────────────────────────────────────────────────────────
const ArbreView = ({ matches }) => {
  const tours = [...new Set(matches.map((m) => m.class))]
    .filter((t) => t > 0)
    .sort((a, b) => b - a);

  return (
    <>
      {tours.map((t) => (
        <div key={t}>
          <SectionHeader label={formatTour(t)} />
          <MatchGrid matches={matches.filter((m) => m.class == t)} showScore={false} />
        </div>
      ))}
    </>
  );
};

// ─── Vue Classement ───────────────────────────────────────────────────────────
const ClassementView = ({ matches }) => {
  const pouleMatches = matches.filter((m) => m.round < 4);
  const finaleMatches = matches.filter((m) => m.round == 4);
  const rounds = [...new Set(pouleMatches.map((m) => m.round))].sort((a, b) => a - b);
  const groupes = [...new Set(finaleMatches.map((m) => m.groupe).filter(Boolean))].sort(
    (a, b) => GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b),
  );

  return (
    <>
      {rounds.map((r) => (
        <div key={r}>
          <SectionHeader label={`Tour ${r} des poules`} />
          <MatchGrid matches={pouleMatches.filter((m) => m.round === r)} showScore={true} />
        </div>
      ))}
      {groupes.length > 0 && (
        <div className="mt-2">
          <SectionHeader label="Phase finale" />
          {groupes.map((g) => {
            const gMatches = finaleMatches.filter((m) => m.groupe === g);
            const tours = [...new Set(gMatches.map((m) => m.class))].filter((t) => t > 0).sort((a, b) => b - a);
            return (
              <GroupBlock key={g} label={g}>
                {tours.map((t) => (
                  <div key={t}>
                    <TourLabel label={formatTour(t)} />
                    <MatchGrid matches={gMatches.filter((m) => m.class == t)} showScore={false} />
                  </div>
                ))}
              </GroupBlock>
            );
          })}
        </div>
      )}
    </>
  );
};

// ─── Composant principal ──────────────────────────────────────────────────────
const TournamentFullView = ({ fullListPlayers, style, onBack }) => {
  const views = { cascade: CascadeView, arbre: ArbreView, classement: ClassementView };
  const ViewComponent = views[style];

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border)] rounded-t-2xl overflow-hidden">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[var(--color-bg-mid)] text-[var(--color-gray)] hover:text-[var(--color-primary)] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-semibold text-[var(--color-primary)] text-sm">
          Vue complète du tournoi
        </h3>
      </div>
      <div className="p-5">
        {ViewComponent && <ViewComponent matches={fullListPlayers} />}
      </div>
    </div>
  );
};

export default TournamentFullView;
