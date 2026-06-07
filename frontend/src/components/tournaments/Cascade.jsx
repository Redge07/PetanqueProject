import axios from "axios";
import React, { useContext, useState } from "react";
import { linkBackend } from "../../constants/LinkBackend";
import Arbre from "../tournamentComponents/Arbre";
import ButtonWinner from "../tournamentComponents/ButtonsWinner";
import VainqueurGroupe from "../tournamentComponents/VainqueurGroupe";
import { UsersContext } from "../../App";
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
  // State pour afficher la fenêtre de récompense et avoir les infos de récompense après une victoire
  const [recompenseModal, setRecompenseModal] = useState(null);
  // Recherche de joueur : filtre l'affichage des matchs
  const [query, setQuery] = useState("");
  const filteredMatches = filterMatchesByPlayer(listPlayers.matches, query);
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
      <RecompenseTableau
        matches={fullListPlayers}
        idTournament={idTournament}
        recharge={recharge}
        prix_entree={listPlayers.prix_entree}
        nb_joueurs={listPlayers.nb_joueurs}
      />
      <PlayerSearch query={query} setQuery={setQuery} />
      {/* Si la recherche ne renvoie rien */}
      {query.trim() && filteredMatches.length === 0 && (
        <p className="text-sm text-[var(--color-gray)] text-center py-6 bg-white/80 rounded-2xl shadow-xl">
          Aucun joueur trouvé dans les matchs en cours
        </p>
      )}
      {/* On affichera directement les vainqueurs si il y en a (masqués pendant une recherche) */}
      {!query.trim() && <VainqueurGroupe listPlayers={listPlayers} />}
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
            // Sinon on affiche bien les matches de ce groupe
            return (
              <div
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl"
                key={g}
              >
                <h2 className="text-lg font-semibold text-[var(--color-primary)] mb-4">
                  Groupe {g}
                </h2>
                <div className="space-y-4">
                  {/* Ensuite on tri par les rounds */}
                  {pairesInfos.rounds
                    .sort((a, b) => b - a)
                    .map((r) => {
                      const matches = groupMatches.filter(
                        (v) => v.round == r,
                      );
                      // Si y'a personne dans ce round et dans ce groupe on peut arreter la et ne rien n'afficher
                      if (matches.length == 0) {
                        return null;
                        // Sinon si y'a bien des matches et qu'on est dans les matches en phase finale on va les afficher differemment qui si on était en phase de groupe au début
                      } else if (r == 4) {
                        return (
                          <Arbre
                            key={r}
                            pairesInfos={pairesInfos}
                            matches={matches}
                            handleWinner={handleWinnerCascade}
                          />
                        );
                        // Sinon on est bien en phase du début
                      } else {
                        return (
                          <div
                            key={r}
                            className="bg-[var(--color-bg-mid)] rounded-xl p-4 border border-[var(--color-border)]"
                          >
                            <h3 className="text-sm font-semibold text-[var(--color-primary)] mb-3">
                              Round {r}
                            </h3>
                            <div className="space-y-3">
                              {/* J'affiche les confrontations qui respectent les filtres */}
                              {matches.map((versus) => {
                                return (
                                  <ButtonWinner
                                    versus={versus}
                                    handleWinner={handleWinnerCascade}
                                    key={versus.key}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                    })}
                </div>
              </div>
            );
          }
        })}
    </div>
  );
};

export default Cascade;
