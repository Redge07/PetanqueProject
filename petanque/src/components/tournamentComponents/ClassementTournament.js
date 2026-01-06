import axios from "axios";
import React, { useEffect, useState } from "react";
import { linkBackend } from "../../constants/LinkBackend";
import Order from "../Order";
import CreateTournamentArbreClassement from "./CreateTournamentArbreClassement";

const ClassementTournament = ({
  listPlayers,
  pairesInfos,
  recharge,
  setResponseWin,
  idTournament,
}) => {
  // State qui permet de gérer l'affichage du classement des poules
  const [order, setOrder] = useState(false);

  // State pour avoir les données du classement
  const [dataOrder, setDataOrder] = useState([]);

  // State pour préciser si le choix des valeurs des arbres de classement est cohérent
  const [errorLengthArbre, setErrorLengthArbre] = useState("");

  useEffect(() => {
    axios
      .get(linkBackend + "gotournaments/charge_classement/" + idTournament)
      .then((res) => setDataOrder(res.data));
  }, [order]);

  // Fonction quand je déclare un vainqueur de phase de poule en mode classement
  const handleWinnerClassement = (e, numeroA, numeroB) => {
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
        .put(
          linkBackend + "gotournaments/win_player_classement/" + idTournament,
          {
            win,
            lose,
            scoreWin,
            scoreLose,
          }
        )
        .then((res) => {
          setResponseWin(res.data);
          setTimeout(() => {
            recharge();
          }, 1000);
        });
    }
  };

  // Fonction quand je déclare un vainqueur de l'arbre du mode classement
  const handleWinnerClassementArbre = (win, lose, tour, groupe) => {
    axios
      .put(
        linkBackend +
          "gotournaments/win_player_classement_arbre/" +
          idTournament,
        { win, lose, tour, groupe }
      )
      .then((res) => {
        setResponseWin(res.data);
        setTimeout(() => {
          recharge();
        }, 1000);
      });
  };

  console.log(dataOrder);

  // Fonction pour lancer les arbres du mode classement quand tous les matches de phase de poules sont fini
  const handleGoArbreClassement = (e) => {
    e.preventDefault();

    const A = Number(e.target.elements.A.value);
    const B = Number(e.target.elements.B.value);
    const C = Number(e.target.elements.C.value);

    if (A + B + C > dataOrder.length) {
      setErrorLengthArbre(
        "Il n'y a pas assez de joueurs pour crée les tournois que vous avez préciser"
      );
    } else if ((B == 0) & (C > 0)) {
      setErrorLengthArbre(
        "Vous ne pouvez pas créer de tournoi pour le groupe C et ne pas en faire pour le groupe B"
      );
    } else {
      const listPlayersA = dataOrder
        .sort((a, b) => b.points - a.points)
        .slice(0, A);
      const listPlayersB =
        B == 0
          ? null
          : dataOrder.sort((a, b) => b.points - a.points).slice(A, A + B);
      const listPlayersC =
        e.target.elements.C.value == 0
          ? null
          : dataOrder
              .sort((a, b) => b.points - a.points)
              .slice(A + B, A + B + C);
      axios
        .put(
          linkBackend + "gotournaments/create_arbre_classement/" + idTournament,
          { listPlayersA, listPlayersB, listPlayersC }
        )
        .then((res) => {
          setResponseWin(res.data);
          setTimeout(() => {
            recharge();
          }, 1000);
        });
    }
  };
  return (
    <div>
      <button onClick={() => setOrder(false)}>Matchs</button>
      <button onClick={() => setOrder(true)}>Classement</button>
      {dataOrder.length != 0 &&
        !listPlayers.vainqueur.vainqueurA &&
        !listPlayers.vainqueur.vainqueurB &&
        !listPlayers.vainqueur.vainqueurC &&
        dataOrder.filter((j) => j.nb_matchs_jouer == 3).length ==
          dataOrder.length &&
        listPlayers.results.filter((m) => m.joueurB).length == 0 &&
        listPlayers.results.filter((m) => m.class == 0.5).length == 0 && (
          <CreateTournamentArbreClassement
            handleGoArbreClassement={handleGoArbreClassement}
            errorLengthArbre={errorLengthArbre}
          />
        )}
      {!order && (
        <div>
          {["A", "B", "C"].map((g) => {
            const vainqueur = `vainqueur${g}`;
            if (listPlayers.vainqueur[vainqueur]) {
              return (
                <div>
                  <h2>Groupe {g}</h2>
                  <p>Le gagnant est {listPlayers.vainqueur[vainqueur]}</p>
                </div>
              );
            }
          })}
          {pairesInfos.rounds
            .sort((a, b) => b - a)
            .map((r) => {
              if (r == 4) {
                return (
                  <div>
                    {pairesInfos.groupes
                      .sort(
                        (a, b) =>
                          ["A", "B", "C"].indexOf(a) -
                          ["A", "B", "C"].indexOf(b)
                      )
                      .map((g) => {
                        const vainqueur = `vainqueur${g}`;
                        if (listPlayers.vainqueur[vainqueur]) {
                          return null;
                        } else {
                          return (
                            <div>
                              {g ? <h2>Groupe {g}</h2> : null}
                              {pairesInfos.tours
                                .sort((a, b) => a - b)
                                .map((t) => {
                                  if (
                                    listPlayers.results.filter(
                                      (m) => m.groupe == g && m.class == t
                                    ).length == 0 ||
                                    !g
                                  ) {
                                    return null;
                                  } else {
                                    return (
                                      <div>
                                        {t == 1 ? (
                                          <h3>La finale</h3>
                                        ) : t == 0.5 ? null : (
                                          <h3>1/{t} de finale</h3>
                                        )}
                                        {listPlayers.results
                                          .filter(
                                            (m) => m.groupe == g && m.class == t
                                          )
                                          .map((m) => {
                                            return (
                                              <div key={m.key}>
                                                {/* Montre infos entre joueur A et joueur B potentiel */}
                                                <p>
                                                  Le joueur numéro{" "}
                                                  {m.joueurA.numero} (
                                                  {m.joueurA.pseudo}){" "}
                                                  {m.joueurB
                                                    ? `affronte le joueur numéro ${m.joueurB.numero} (${m.joueurB.pseudo})`
                                                    : "n'a pas encore d'adversaire attitré"}
                                                </p>
                                                {/* Si y'a bien joueur B pour le match alors on peut déclarer un vainqueur et donc afficher les boutons*/}
                                                {m.joueurB && (
                                                  <div>
                                                    <button
                                                      onClick={() =>
                                                        handleWinnerClassementArbre(
                                                          m.joueurA.numero,
                                                          m.joueurB.numero,
                                                          m.class,
                                                          m.groupe
                                                        )
                                                      }
                                                    >
                                                      Victoire de{" "}
                                                      {m.joueurA.pseudo}
                                                    </button>
                                                    <button
                                                      onClick={() =>
                                                        handleWinnerClassementArbre(
                                                          m.joueurB.numero,
                                                          m.joueurA.numero,
                                                          m.class,
                                                          m.groupe
                                                        )
                                                      }
                                                    >
                                                      Victoire de{" "}
                                                      {m.joueurB.pseudo}
                                                    </button>
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}{" "}
                                      </div>
                                    );
                                  }
                                })}
                            </div>
                          );
                        }
                      })}
                  </div>
                );
                // return <h3>On verra plus tard round 4 (arbre)</h3>;
              } else {
                return (
                  <div key={r}>
                    <h3>Round {r}</h3>
                    {listPlayers.results
                      .filter((m) => m.round == r)
                      .map((m) => {
                        const number =
                          m.joueurA.matches.split("-")[m.round - 1];
                        const potentielAdversaire = listPlayers.results.find(
                          (m) =>
                            m.joueurA.numero == number ||
                            (m.joueurB
                              ? m.joueurB.numero == number
                              : m.joueurA.numero == number)
                        );
                        const pseudo =
                          potentielAdversaire.joueurA.numero == number
                            ? potentielAdversaire.joueurA.pseudo
                            : potentielAdversaire.joueurB.pseudo;
                        return (
                          <div key={m.key}>
                            <p>
                              {m.joueurA.pseudo} vs{" "}
                              {m.joueurB ? m.joueurB.pseudo : pseudo}
                            </p>
                            <form
                              onSubmit={(e) =>
                                handleWinnerClassement(
                                  e,
                                  m.joueurA.numero,
                                  m.joueurB.numero
                                )
                              }
                            >
                              <input
                                type="number"
                                defaultValue={0}
                                placeholder={`Entrer le score de ${m.joueurA.pseudo}`}
                                disabled={!m.joueurB}
                                name="scoreA"
                              />
                              <input
                                type="number"
                                defaultValue={1}
                                placeholder={`Entrer le score de ${
                                  m.joueurB ? m.joueurB.pseudo : pseudo
                                }`}
                                disabled={!m.joueurB}
                                name="scoreB"
                              />
                              <input
                                type="submit"
                                value="Valider"
                                disabled={!m.joueurB}
                              />
                            </form>
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
