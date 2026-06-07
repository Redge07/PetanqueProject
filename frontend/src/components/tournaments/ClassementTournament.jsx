import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { linkBackend } from "../../constants/LinkBackend";
import CreateTournamentArbreClassement from "../tournamentComponents/CreateTournamentArbreClassement";
import VainqueurGroupe from "../tournamentComponents/VainqueurGroupe";
import Arbre from "../tournamentComponents/Arbre";
import { OrgaContext } from "../../pages/Tournament";
import Order from "../tournamentComponents/Order";
import { UsersContext } from "../../App";
import handleGoArbreClassementUtil from "../../utils/handleGoArbreClassement";
import PlayerSearch, {
  filterMatchesByPlayer,
} from "../tournamentComponents/PlayerSearch";

const ClassementTournament = ({
  listPlayers,
  pairesInfos,
  recharge,
  setResponseWin,
  idTournament,
}) => {
  const { setLoad, setError } = useContext(UsersContext);
  const context = useContext(OrgaContext);
  const orga = context?.orga;

  // State qui permet de gérer l'affichage du classement des poules
  const [order, setOrder] = useState(false);

  // Recherche de joueur : filtre l'affichage des matchs
  const [query, setQuery] = useState("");
  const filteredMatches = filterMatchesByPlayer(listPlayers.matches, query);

  // State pour avoir les données du classement
  const [dataOrder, setDataOrder] = useState([]);

  // State pour préciser si le choix des valeurs des arbres de classement est cohérent
  const [errorLengthArbre, setErrorLengthArbre] = useState("");

  const chargeOrder = async () => {
    setLoad(true);
    try {
      const res = await axios.get(
        linkBackend + "tournaments/classement/" + idTournament,
      );
      setDataOrder(res.data);
    } catch (err) {
      setError(true);

    } finally {
      setLoad(false);
    }
  };
  useEffect(() => {
    chargeOrder();
  }, []);

  // Fonction quand je déclare un vainqueur de phase de poule en mode classement
  const handleWinnerClassement = async (e, numeroA, numeroB, round) => {
    e.preventDefault();
    try {
      if (e.target.elements.scoreA.value == e.target.elements.scoreB.value) {
        setResponseWin("Il ne peut pas y avoir d'égalité ou de cases vides");
      } else {
        setLoad(true);
        // On récupère l'id du gagnant et du perdant et le score du gagnant et du perdant
        const [win, lose, scoreWin, scoreLose] =
          Number(e.target.elements.scoreA.value) >
          Number(e.target.elements.scoreB.value)
            ? [
                numeroA,
                numeroB,
                e.target.elements.scoreA.value,
                e.target.elements.scoreB.value,
              ]
            : [
                numeroB,
                numeroA,
                e.target.elements.scoreB.value,
                e.target.elements.scoreA.value,
              ];
        const res = await axios.put(
          linkBackend + "winner/classement/" + idTournament,
          {
            win,
            lose,
            scoreWin,
            scoreLose,
            round,
          },
        );
        setResponseWin(res.data);
        setTimeout(() => {
          recharge();
          chargeOrder();
        }, 1000);
      }
    } catch (err) {
      setError(true);

    } finally {
      setLoad(false);
    }
  };

  // Fonction quand je déclare un vainqueur de l'arbre du mode classement
  const handleWinnerClassementArbre = async (win, lose, versus) => {
    setLoad(true);
    try {
      const pseudoWin =
        versus.id_playerA == win ? versus.pseudo_A : versus.pseudo_B;
      const res = await axios.put(
        linkBackend + "winner/arbre/" + idTournament,
        {
          win,
          lose,
          tour: versus.class,
          groupe: versus.groupe,
          pseudoWin,
        },
      );
      setResponseWin(res.data);
      setTimeout(() => {
        recharge();
        chargeOrder();
      }, 1000);
    } catch (err) {
      setError(true);

    } finally {
      setLoad(false);
    }
  };

  // Fonction pour lancer les arbres du mode classement quand tous les matches de phase de poules sont fini
  const handleGoArbreClassement = async (e) => {
    e.preventDefault();
    setLoad(true);
    try {
      await handleGoArbreClassementUtil(
        e,
        setErrorLengthArbre,
        dataOrder.players,
        idTournament,
      );
      setTimeout(() => {
        recharge();
        chargeOrder();
      }, 1000);
    } catch (err) {
      setError(true);

    } finally {
      setLoad(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pour un joueur quand tous les 3 matches sont fini */}
      {dataOrder.goArbre && !orga && (
        <p className="text-sm text-[var(--color-primary)] bg-[var(--color-bg-mid)] rounded-xl p-4 border border-[var(--color-gold)]/20">
          La phase de poules est terminée. En attente du tirage au sort pour la
          phase finale en arbre.
        </p>
      )}

      {/* Pour un orga, il peut choisir d'afficher les matches ou le classsement */}
      {orga && (
        <div className="flex rounded-xl bg-[var(--color-bg-mid)] p-1">
          <button
            onClick={() => setOrder(false)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${!order ? "bg-white text-[var(--color-primary)] shadow-sm" : "text-[var(--color-gray)]"}`}
          >
            Matchs
          </button>
          <button
            onClick={() => setOrder(true)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${order ? "bg-white text-[var(--color-primary)] shadow-sm" : "text-[var(--color-gray)]"}`}
          >
            Classement
          </button>
        </div>
      )}

      {/* Quand les 3 matches sont fini, l'orga voit le formulaire pour créer les tournois en arbre apparaitre */}
      {dataOrder.goArbre && orga && (
        <CreateTournamentArbreClassement
          handleGoArbreClassement={handleGoArbreClassement}
          errorLengthArbre={errorLengthArbre}
        />
      )}

      {/* Si on veut afficher les matches */}
      {!order && (
        <div className="space-y-6">
          {/* Barre de recherche de joueur (orga uniquement) */}
          {orga && <PlayerSearch query={query} setQuery={setQuery} />}

          {/* Si la recherche ne renvoie rien */}
          {query.trim() && filteredMatches.length === 0 && (
            <p className="text-sm text-[var(--color-gray)] text-center py-6 bg-white/80 rounded-2xl shadow-xl">
              Aucun joueur trouvé dans les matchs en cours
            </p>
          )}

          {/* On affiche les vainqueurs si il y en a (masqués pendant une recherche) */}
          {!query.trim() && <VainqueurGroupe listPlayers={listPlayers} />}

          {/* On va commencer avec les rounds tout en haut (car énorme diff entre r = 4 et r inferieur 3 */}
          {pairesInfos.rounds
            .sort((a, b) => b - a)
            .map((r) => {
              // Si on est dans la phase arbre et que y'a des groupes qui ont été récupéré
              if (r == 4 && pairesInfos.groupes[0] != null) {
                return (
                  <div key={r} className="space-y-4">
                    {/* Apres le round on fait les groupes */}
                    {pairesInfos.groupes
                      .sort(
                        (a, b) =>
                          ["A", "B", "C"].indexOf(a) -
                          ["A", "B", "C"].indexOf(b),
                      )
                      .map((g) => {
                        // Si y'a vainqueur deja dans ce groupe on affiche rien
                        const vainqueur = `vainqueur${g}`;
                        // On prend les matches du groupe qui correspondent à la recherche
                        const matches = filteredMatches.filter(
                          (m) => m.groupe == g,
                        );
                        if (listPlayers.vainqueurs[vainqueur] || matches.length === 0) {
                          return null;
                        } else {
                          return (
                            <div
                              key={g}
                              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl"
                            >
                              <h2 className="text-lg font-semibold text-[var(--color-primary)] mb-4">
                                Groupe {g}
                              </h2>
                              <Arbre
                                pairesInfos={pairesInfos}
                                matches={matches}
                                handleWinner={handleWinnerClassementArbre}
                              />
                            </div>
                          );
                        }
                      })}
                  </div>
                );
              }
              // Sinon on est dans les matches de poules
              if (r < 4) {
                const roundMatches = filteredMatches.filter(
                  (m) => m.round == r,
                );
                if (roundMatches.length === 0) return null;
                return (
                  <div
                    key={r}
                    className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl"
                  >
                    {/* J'affiche les rounds et y'a pas besoin de groupe */}
                    <h3 className="text-lg font-semibold text-[var(--color-primary)] mb-4">
                      Round {r}
                    </h3>
                    <div className="space-y-4">
                      {roundMatches.map((m) => {
                          return (
                            <div
                              key={m.key}
                              className="bg-white rounded-2xl p-4 border border-[var(--color-border)] shadow-sm"
                            >
                              {/* Noms des joueurs */}
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex-1 text-center">
                                  <div className="inline-flex items-center justify-center w-8 h-8 bg-[var(--color-primary)] rounded-full mb-1">
                                    <span className="text-white text-xs font-bold">
                                      A
                                    </span>
                                  </div>
                                  <p className="font-semibold text-[var(--color-primary)] text-sm">
                                    {m.pseudo_A}
                                  </p>
                                </div>
                                <div className="flex flex-col items-center px-3">
                                  <span className="text-xs font-bold text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] px-3 py-1 rounded-full shadow">
                                    VS
                                  </span>
                                </div>
                                <div className="flex-1 text-center">
                                  <div className="inline-flex items-center justify-center w-8 h-8 bg-[var(--color-gold)] rounded-full mb-1">
                                    <span className="text-white text-xs font-bold">
                                      B
                                    </span>
                                  </div>
                                  <p className="font-semibold text-[var(--color-primary)] text-sm">
                                    {m.id_playerB ? m.pseudo_B : "personne"}
                                  </p>
                                </div>
                              </div>

                              {/* Si on est un orga on a les boutons qui apparaisse pour déclarer le vainqueur */}
                              {orga && (
                                <form
                                  onSubmit={(e) =>
                                    handleWinnerClassement(
                                      e,
                                      m.id_playerA,
                                      m.id_playerB,
                                      m.round,
                                    )
                                  }
                                  className="flex items-center gap-2 bg-[var(--color-bg-mid)] rounded-xl p-3"
                                >
                                  <div className="flex-1 flex flex-col items-center gap-1">
                                    <span className="text-xs font-medium text-[var(--color-primary)]">
                                      {m.pseudo_A}
                                    </span>
                                    <input
                                      type="number"
                                      defaultValue={0}
                                      disabled={m.end == -1}
                                      name="scoreA"
                                      className="w-full h-10 px-3 rounded-xl border-2 border-[var(--color-primary)]/30 bg-white text-[var(--color-primary)] text-center font-bold focus:outline-none focus:border-[var(--color-primary)] transition-colors disabled:opacity-50"
                                    />
                                  </div>
                                  <span className="text-[var(--color-gray-light)] text-sm mt-4 font-bold">
                                    —
                                  </span>
                                  <div className="flex-1 flex flex-col items-center gap-1">
                                    <span className="text-xs font-medium text-[var(--color-gold)]">
                                      {m.id_playerB ? m.pseudo_B : "personne"}
                                    </span>
                                    <input
                                      type="number"
                                      defaultValue={1}
                                      disabled={m.end == -1}
                                      name="scoreB"
                                      className="w-full h-10 px-3 rounded-xl border-2 border-[var(--color-gold)]/30 bg-white text-[var(--color-gold)] text-center font-bold focus:outline-none focus:border-[var(--color-gold)] transition-colors disabled:opacity-50"
                                    />
                                  </div>
                                  <input
                                    type="submit"
                                    value="✓"
                                    disabled={m.end == -1}
                                    className="h-10 w-10 mt-5 bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white rounded-xl text-lg font-bold cursor-pointer hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                  />
                                </form>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              }
            })}
        </div>
      )}

      {/* Si le state order est a true on fait apparaitre le classement */}
      {order && (
        <div>
          <Order idTournament={idTournament} />
        </div>
      )}
    </div>
  );
};

export default ClassementTournament;
