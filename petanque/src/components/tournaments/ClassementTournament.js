import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { linkBackend } from "../../constants/LinkBackend";
import CreateTournamentArbreClassement from "../tournamentComponents/CreateTournamentArbreClassement";
import VainqueurGroupe from "../tournamentComponents/VainqueurGroupe";
import Arbre from "../tournamentComponents/Arbre";
import { OrgaContext } from "../../pages/Tournament";
import Order from "../tournamentComponents/Order";

const ClassementTournament = ({
  listPlayers,
  pairesInfos,
  recharge,
  setResponseWin,
  idTournament,
}) => {
  const context = useContext(OrgaContext);
  const orga = context?.orga;

  // State qui permet de gérer l'affichage du classement des poules
  const [order, setOrder] = useState(false);

  // State pour avoir les données du classement
  const [dataOrder, setDataOrder] = useState([]);

  // State pour préciser si le choix des valeurs des arbres de classement est cohérent
  const [errorLengthArbre, setErrorLengthArbre] = useState("");

  useEffect(() => {
    axios
      .get(linkBackend + "tournaments2/classement/" + idTournament)
      .then((res) => {
        setDataOrder(res.data);
      });
  }, []);

  // Fonction quand je déclare un vainqueur de phase de poule en mode classement
  const handleWinnerClassement = (e, numeroA, numeroB, round) => {
    e.preventDefault();
    if (e.target.elements.scoreA.value == e.target.elements.scoreB.value) {
      setResponseWin("Il ne peut pas y avoir d'égalité ou de cases vides");
    } else {
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
      axios
        .put(linkBackend + "winner/classement/" + idTournament, {
          win,
          lose,
          scoreWin,
          scoreLose,
          round,
        })
        .then((res) => {
          setResponseWin(res.data);
          setTimeout(() => {
            recharge();
          }, 1000);
        });
    }
  };

  // Fonction quand je déclare un vainqueur de l'arbre du mode classement
  const handleWinnerClassementArbre = (win, lose, versus) => {
    const pseudoWin =
      versus.id_playerA == win ? versus.pseudo_A : versus.pseudo_B;
    axios
      .put(linkBackend + "winner/arbre/" + idTournament, {
        win,
        lose,
        tour: versus.class,
        groupe: versus.groupe,
        pseudoWin,
      })
      .then((res) => {
        setResponseWin(res.data);
        setTimeout(() => {
          recharge();
        }, 1000);
      });
  };

  // Fonction pour lancer les arbres du mode classement quand tous les matches de phase de poules sont fini
  const handleGoArbreClassement = async (e) => {
    e.preventDefault();

    const A = Number(e.target.elements.A.value);
    const B = Number(e.target.elements.B.value);
    const C = Number(e.target.elements.C.value);

    if (A + B + C > dataOrder.length) {
      setErrorLengthArbre(
        "Il n'y a pas assez de joueurs pour crée les tournois que vous avez préciser",
      );
    } else if ((B == 0) & (C > 0)) {
      setErrorLengthArbre(
        "Vous ne pouvez pas créer de tournoi pour le groupe C et ne pas en faire pour le groupe B",
      );
    } else {
      const listPlayersA = dataOrder
        .sort((a, b) => b.points - a.points)
        .slice(0, A);
      const listPlayersB =
        B == 0
          ? []
          : dataOrder.sort((a, b) => b.points - a.points).slice(A, A + B);
      const listPlayersC =
        e.target.elements.C.value == 0
          ? []
          : dataOrder
              .sort((a, b) => b.points - a.points)
              .slice(A + B, A + B + C);
      console.log(listPlayersA);
      console.log(listPlayersB);
      console.log(listPlayersC);
      await axios.put(linkBackend + "gotournaments2/arbre/" + idTournament, {
        listPlayersA,
      });
      await axios.put(linkBackend + "gotournaments2/arbre/" + idTournament, {
        listPlayersB,
      });
      await axios.put(linkBackend + "gotournaments2/arbre/" + idTournament, {
        listPlayersC,
      });

      setResponseWin("Tous les tournois crées");
      setTimeout(() => {
        recharge();
      }, 1000);
    }
  };

  const formArbre =
    dataOrder.length != 0 &&
    !listPlayers.vainqueurs.vainqueurA &&
    !listPlayers.vainqueurs.vainqueurB &&
    !listPlayers.vainqueurs.vainqueurC &&
    dataOrder.filter((j) => j.nb_matchs_jouer == 3).length ==
      dataOrder.length &&
    listPlayers.matches.filter((m) => m.id_playerB).length == 0 &&
    listPlayers.matches.filter((m) => m.class == 0.5).length == 0;
  return (
    <div>
      {formArbre && !orga && (
        <p>
          La phase de poule est fini, il faut attendre le tirage au sort pour la
          suite en arbre
        </p>
      )}
      {orga && (
        <div>
          <button onClick={() => setOrder(false)}>Matchs</button>
          <button onClick={() => setOrder(true)}>Classement</button>
        </div>
      )}

      {formArbre && orga && (
        <CreateTournamentArbreClassement
          handleGoArbreClassement={handleGoArbreClassement}
          errorLengthArbre={errorLengthArbre}
        />
      )}
      {!order && (
        <div>
          <VainqueurGroupe listPlayers={listPlayers} />
          {pairesInfos.rounds
            .sort((a, b) => b - a)
            .map((r) => {
              if (r == 4 && pairesInfos.groupes[0] != null) {
                return (
                  <div>
                    {pairesInfos.groupes
                      .sort(
                        (a, b) =>
                          ["A", "B", "C"].indexOf(a) -
                          ["A", "B", "C"].indexOf(b),
                      )
                      .map((g) => {
                        const vainqueur = `vainqueur${g}`;
                        if (listPlayers.vainqueurs[vainqueur]) {
                          return null;
                        } else {
                          const matches = listPlayers.matches.filter(
                            (m) => m.groupe == g,
                          );
                          return (
                            <div>
                              {/* {g ? <h2>Groupe {g}</h2> : null} */}
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
              if (r < 4) {
                return (
                  <div key={r}>
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
      {order && (
        <div>
          <Order idTournament={idTournament} />
        </div>
      )}
    </div>
  );
};

export default ClassementTournament;
