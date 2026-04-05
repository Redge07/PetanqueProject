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
    <div>
      {/* Pour un joueur quand tous les 3 matches sont fini */}
      {dataOrder.goArbre && !orga && (
        <p>
          La phase de poule est fini, il faut attendre le tirage au sort pour la
          suite en arbre
        </p>
      )}
      {/* Pour un orga, il peut choisir d'afficher les matches ou le classsement */}
      {orga && (
        <div>
          <button onClick={() => setOrder(false)}>Matchs</button>
          <button onClick={() => setOrder(true)}>Classement</button>
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
        <div>
          {/* On affiche les vainqueurs si il y en a */}
          <VainqueurGroupe listPlayers={listPlayers} />
          {/* On va commencer avec les rounds tout en haut (car énorme diff entre r = 4 et r inferieur 3 */}
          {pairesInfos.rounds
            .sort((a, b) => b - a)
            .map((r) => {
              // Si on est dans la phase arbre et que y'a des groupes qui ont été récupéré
              if (r == 4 && pairesInfos.groupes[0] != null) {
                return (
                  <div>
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
                            <div>
                              <h2>Groupe {g}</h2>
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
                // return <h3>On verra plus tard round 4 (arbre)</h3>;
              }
              // Sinon on est dans les matches de poules
              if (r < 4) {
                return (
                  <div key={r}>
                    {/* J'affiche les rounds et y'a pas besoin de groupe */}
                    <h3>Round {r}</h3>
                    {listPlayers.matches
                      .filter((m) => m.round == r)
                      .map((m) => {
                        return (
                          <div key={m.key}>
                            <p>
                              {m.pseudo_A} vs{" "}
                              {m.id_playerB ? m.pseudo_B : "personne"}
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
                              >
                                <input
                                  type="number"
                                  defaultValue={0}
                                  placeholder={`Entrer le score de ${m.pseudo_A}`}
                                  disabled={m.end == -1}
                                  name="scoreA"
                                />
                                <input
                                  type="number"
                                  defaultValue={1}
                                  placeholder={`Entrer le score de ${
                                    m.id_playerB ? m.pseudo_B : "personne"
                                  }`}
                                  disabled={m.end == -1}
                                  name="scoreB"
                                />
                                <input
                                  type="submit"
                                  value="Valider"
                                  disabled={m.end == -1}
                                />
                              </form>
                            )}
                          </div>
                        );
                      })}
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
