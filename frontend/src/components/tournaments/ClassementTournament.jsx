import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { linkBackend } from "../../constants/LinkBackend";
import CreateTournamentArbreClassement from "../tournamentComponents/CreateTournamentArbreClassement";
import VainqueurGroupe from "../tournamentComponents/VainqueurGroupe";
import Arbre from "../tournamentComponents/Arbre";
import { OrgaContext } from "../../pages/Tournament";
import Order from "../tournamentComponents/Order";
import { UsersContext } from "../../App";
import { useNavigate } from "react-router-dom";
import handleGoArbreClassementUtil from "../../utils/handleGoArbreClassement";

const ClassementTournament = ({
  listPlayers,
  pairesInfos,
  recharge,
  setResponseWin,
  idTournament,
}) => {
  const { setLoad, setError } = useContext(UsersContext);
  const context = useContext(OrgaContext);
  const navigate = useNavigate();
  const orga = context?.orga;

  // State qui permet de gérer l'affichage du classement des poules
  const [order, setOrder] = useState(false);

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
      navigate("/");
      console.log(err);
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
      navigate("/");
      console.log(err);
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
      navigate("/");
      console.log(err);
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
      navigate("/");
      console.log(err);
    } finally {
      setLoad(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pour un joueur quand tous les 3 matches sont fini */}
      {dataOrder.goArbre && !orga && (
        <p className="text-sm text-[var(--color-primary)] bg-[var(--color-bg-mid)] rounded-xl p-4 border border-[var(--color-gold)]/20">
          La phase de poule est fini, il faut attendre le tirage au sort pour la
          suite en arbre
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
          {/* On affiche les vainqueurs si il y en a */}
          <VainqueurGroupe listPlayers={listPlayers} />

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
                        if (listPlayers.vainqueurs[vainqueur]) {
                          return null;
                        } else {
                          // On prend tous les matches du groupe auquel on est actuellement dans la boucle
                          const matches = listPlayers.matches.filter(
                            (m) => m.groupe == g,
                          );
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
                      {listPlayers.matches
                        .filter((m) => m.round == r)
                        .map((m) => {
                          return (
                            <div
                              key={m.key}
                              className="bg-[var(--color-bg-mid)] rounded-xl p-4 border border-[var(--color-border)]"
                            >
                              <p className="text-[var(--color-gray)] text-sm mb-3">
                                <span className="font-semibold text-[var(--color-primary)]">
                                  {m.pseudo_A}
                                </span>{" "}
                                vs{" "}
                                <span className="font-semibold text-[var(--color-primary)]">
                                  {m.id_playerB ? m.pseudo_B : "personne"}
                                </span>
                              </p>
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
                                  className="flex items-center gap-2"
                                >
                                  <input
                                    type="number"
                                    defaultValue={0}
                                    placeholder={`Score ${m.pseudo_A}`}
                                    disabled={m.end == -1}
                                    name="scoreA"
                                    className="w-24 h-10 px-3 rounded-xl border border-[var(--color-border)] bg-white text-[var(--color-primary)] text-center focus:outline-none focus:border-[var(--color-primary)] transition-colors disabled:opacity-50"
                                  />
                                  <span className="text-[var(--color-gray)] text-sm">
                                    vs
                                  </span>
                                  <input
                                    type="number"
                                    defaultValue={1}
                                    placeholder={`Score ${m.id_playerB ? m.pseudo_B : "personne"}`}
                                    disabled={m.end == -1}
                                    name="scoreB"
                                    className="w-24 h-10 px-3 rounded-xl border border-[var(--color-border)] bg-white text-[var(--color-primary)] text-center focus:outline-none focus:border-[var(--color-primary)] transition-colors disabled:opacity-50"
                                  />
                                  <input
                                    type="submit"
                                    value="Valider"
                                    disabled={m.end == -1}
                                    className="h-10 px-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white rounded-xl text-sm font-medium cursor-pointer hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
