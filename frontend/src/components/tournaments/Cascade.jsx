import axios from "axios";
import React, { useContext, useState } from "react";
import { ChevronDown } from "lucide-react";
import { linkBackend } from "../../constants/LinkBackend";
import Arbre from "../tournamentComponents/Arbre";
import ButtonWinner from "../tournamentComponents/ButtonsWinner";
import VainqueurGroupe from "../tournamentComponents/VainqueurGroupe";
import { UsersContext } from "../../App";
import { OrgaContext } from "../../pages/Tournament";
import RecompenseTableau from "../tournamentComponents/RecompenseTableau";
import RecompenseWinner from "../tournamentComponents/RecompenseWinner";
import PlayerSearch, {
  filterMatchesByPlayer,
} from "../tournamentComponents/PlayerSearch";

const Cascade = ({
  fullListPlayers,
  listPlayers,
  pairesInfos,
  recharge,
  setResponseWin,
  idTournament,
}) => {
  const { setLoad, setError } = useContext(UsersContext);
  const { orga } = useContext(OrgaContext) ?? {};
  // State pour afficher la fenêtre de récompense et avoir les infos de récompense après une victoire
  const [recompenseModal, setRecompenseModal] = useState(null);
  // Recherche de joueur et filtres : filtrent l'affichage des matchs
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ groupe: "", round: "", tour: "" });

  let filteredMatches = filterMatchesByPlayer(listPlayers.matches, query);
  if (filters.groupe) filteredMatches = filteredMatches.filter((m) => m.groupe == filters.groupe);
  if (filters.round) filteredMatches = filteredMatches.filter((m) => String(m.round) == filters.round);
  if (filters.tour) filteredMatches = filteredMatches.filter((m) => String(m.class) == filters.tour);

  const hasActiveFilters = query.trim() || filters.groupe || filters.round || filters.tour;
  const [openGroups, setOpenGroups] = useState({});
  const toggleGroup = (g) => setOpenGroups((prev) => ({ ...prev, [g]: !prev[g] }));
  // Fonction quand je déclare le vainqueur
  const handleWinnerCascade = async (win, lose, versus) => {
    setLoad(true);
    try {
      const pseudoWin =
        versus.id_playerA == win ? versus.pseudo_A : versus.pseudo_B;
      const pseudoLose =
        versus.id_playerA == lose ? versus.pseudo_A : versus.pseudo_B;
      const res = await axios.put(
        linkBackend + "winner/cascade/" + idTournament,
        {
          win,
          lose,
          round: versus.round,
          groupe: versus.groupe,
          barrage: versus.barrage,
          tour: versus.class,
          pseudoWin,
          pseudoLose,
        },
      );
      setResponseWin(res.data);
      // On affiche la fenêtre de récompense si le match a une récompense
      if (versus.recompense > 0) {
        setRecompenseModal({
          pseudo: pseudoWin,
          recompense: versus.recompense,
          tour: versus.class,
          groupe: versus.groupe,
          round: versus.round,
        });
      }
      setTimeout(() => {
        recharge();
      }, 1000);
    } catch (err) {
      setError(true);

    } finally {
      setLoad(false);
    }
  };

  return (
    <div className="space-y-6">
      {recompenseModal && (
        <RecompenseWinner
          recompenseModal={recompenseModal}
          setRecompenseModal={setRecompenseModal}
        />
      )}
      {orga && (
        <RecompenseTableau
          matches={fullListPlayers}
          idTournament={idTournament}
          recharge={recharge}
          prix_entree={listPlayers.prix_entree}
          nb_joueurs={listPlayers.nb_joueurs}
        />
      )}
      <PlayerSearch
        query={query}
        setQuery={setQuery}
        options={orga ? { groupes: pairesInfos.groupes, rounds: pairesInfos.rounds, tours: pairesInfos.tours } : {}}
        filters={filters}
        setFilters={orga ? setFilters : undefined}
      />
      {/* Si les filtres ne renvoient rien */}
      {hasActiveFilters && filteredMatches.length === 0 && (
        <p className="text-sm text-[var(--color-gray)] text-center py-6 bg-white/80 rounded-2xl shadow-xl">
          Aucun match trouvé pour ces filtres
        </p>
      )}
      {/* On affichera directement les vainqueurs si il y en a (masqués pendant une recherche/filtre) */}
      {!hasActiveFilters && <VainqueurGroupe listPlayers={listPlayers} />}
      {/* On tri par les groupes */}
      {pairesInfos.groupes
        .sort(
          (a, b) =>
            ["A", "B", "B2", "C"].indexOf(a) - ["A", "B", "B2", "C"].indexOf(b),
        )
        .map((g) => {
          // Si ce groupe a déjà un vainqueur alors on affiche rien car c'est fini
          const vainqueur = `vainqueur${g}`;
          // On ne garde que les matchs du groupe qui correspondent à la recherche
          const groupMatches = filteredMatches.filter((v) => v.groupe == g);
          if (listPlayers.vainqueurs[vainqueur] || groupMatches.length === 0) {
            return null;
          } else {
            const isOpen = hasActiveFilters || !!openGroups[g];
            const roundLabels = pairesInfos.rounds
              .filter((r) => groupMatches.some((v) => v.round == r))
              .sort((a, b) => b - a)
              .map((r) => (r == 4 ? "Phase finale" : `Round ${r}`))
              .join(" · ");
            return (
              <div
                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
                key={g}
              >
                {/* En-tête cliquable */}
                <button
                  onClick={() => toggleGroup(g)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-[var(--color-primary)]">{g}</span>
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-[var(--color-primary)]">
                        Groupe {g}
                      </h2>
                      <p className="text-xs text-[var(--color-gray)] mt-0.5">
                        {groupMatches.length} match{groupMatches.length > 1 ? "s" : ""}
                        {roundLabels ? ` · ${roundLabels}` : ""}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-[var(--color-gray)] transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Contenu dépliable */}
                {isOpen && (
                  <div className="px-6 pb-6 space-y-4 border-t border-[var(--color-border)]">
                    <div className="space-y-4 pt-4">
                      {pairesInfos.rounds
                        .sort((a, b) => b - a)
                        .map((r) => {
                          const matches = groupMatches.filter((v) => v.round == r);
                          if (matches.length == 0) return null;
                          if (r == 4) {
                            return (
                              <Arbre
                                key={r}
                                pairesInfos={pairesInfos}
                                matches={matches}
                                handleWinner={handleWinnerCascade}
                              />
                            );
                          }
                          return (
                            <div
                              key={r}
                              className="bg-[var(--color-bg-mid)] rounded-xl p-4 border border-[var(--color-border)]"
                            >
                              <h3 className="text-sm font-semibold text-[var(--color-primary)] mb-3">
                                Round {r}
                              </h3>
                              <div className="space-y-3">
                                {matches.map((versus) => (
                                  <ButtonWinner
                                    versus={versus}
                                    handleWinner={handleWinnerCascade}
                                    key={versus.key}
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            );
          }
        })}
    </div>
  );
};

export default Cascade;
