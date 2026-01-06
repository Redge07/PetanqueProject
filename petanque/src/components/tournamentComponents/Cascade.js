import axios from "axios";
import React from "react";
import { linkBackend } from "../../constants/LinkBackend";
import Arbre from "./Arbre";

const Cascade = ({
  listPlayers,
  pairesInfos,
  recharge,
  setResponseWin,
  idTournament,
}) => {
  // Fonction quand je déclare le vainqueur
  const handleWinnerCascade = (win, lose, round, groupe, barrage, tour) => {
    axios
      .put(linkBackend + "gotournaments/win_player_cascade/" + idTournament, {
        win,
        lose,
        round,
        groupe,
        barrage,
        tour,
      })
      .then((res) => {
        setResponseWin(res.data);
        setTimeout(() => {
          recharge();
        }, 1000);
      });
  };
  return (
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
      {/* On tri par les groupes */}
      {pairesInfos.groupes
        .sort(
          (a, b) =>
            ["A", "B", "B2", "C"].indexOf(a) - ["A", "B", "B2", "C"].indexOf(b)
        )
        .map((g) => {
          // Si y'a personne dans ce groupe on peut arreter la et ne rien n'afficher
          const vainqueur = `vainqueur${g}`;
          if (listPlayers.vainqueur[vainqueur]) {
            return null;
          } else {
            return (
              <div key={g}>
                <h2>Groupe {g}</h2>
                {/* Ensuite on tri par les rounds */}
                {pairesInfos.rounds
                  .sort((a, b) => b - a)
                  .map((r) => {
                    console.log(r);

                    // Si y'a personne dans ce round et dans ce groupe on peut arreter la et ne rien n'afficher
                    const matches = listPlayers.results.filter(
                      (v) => v.groupe == g && v.round == r
                    );
                    if (matches.length == 0) {
                      return null;
                    } else if (r == 4) {
                      console.log("ouid");
                      return (
                        <Arbre
                          pairesInfos={pairesInfos}
                          matches={matches}
                          handleWinner={handleWinnerCascade}
                        />
                      );
                    } else {
                      return (
                        <div key={r}>
                          {r == 4 ? null : <h3>Round {r}</h3>}
                          {pairesInfos.tours
                            .sort((a, b) => a - b)
                            .map((t) => {
                              // On récupère tous les matchs qui correspondent a ce groupe, ce round et ce tour la
                              const versusMain = listPlayers.results.filter(
                                (versus) =>
                                  versus.groupe == g &&
                                  versus.round == r &&
                                  versus.class == t
                              );
                              // Si y'a aucun match dans ce round, ce groupe et ce tour on peut arreter la et ne rien n'afficher
                              if (versusMain.length == 0) {
                                return null;
                              } else {
                                return (
                                  <div key={t}>
                                    {r < 4 ||
                                    t == 0.25 ||
                                    (t == 0.5 && g != "B") ? null : t == 1 ? (
                                      <h3>La finale</h3>
                                    ) : t == 0.5 ? (
                                      <h3>
                                        La grande finale du groupe B, vainqueur
                                        du B contre vainqueur B2
                                      </h3>
                                    ) : (
                                      <h3>1/{t} de finale</h3>
                                    )}
                                    {/* J'affiche les confrontations qui respectent les filtres */}
                                    {versusMain.map((versus) => {
                                      return (
                                        <div key={versus.key}>
                                          {/* Montre infos entre joueur A et joueur B potentiel */}
                                          <p>
                                            Le joueur numéro{" "}
                                            {versus.joueurA.numero} (
                                            {versus.joueurA.pseudo}){" "}
                                            {versus.joueurB
                                              ? `affronte le joueur numéro ${versus.joueurB.numero} (${versus.joueurB.pseudo})`
                                              : "n'a pas encore d'adversaire attitré"}
                                            {/* Précise si s'agit d'un match de barrage */}
                                            {versus.barrage == 1 && (
                                              <span
                                                style={{
                                                  color: "red",
                                                }}
                                              >
                                                {" "}
                                                Il s'agit d'un match de barrage
                                              </span>
                                            )}
                                          </p>
                                          {/* Si y'a bien joueur B pour le match alors on peut déclarer un vainqueur et donc afficher les boutons*/}
                                          {versus.joueurB && (
                                            <div>
                                              <button
                                                onClick={() =>
                                                  handleWinnerCascade(
                                                    versus.joueurA.numero,
                                                    versus.joueurB.numero,
                                                    r,
                                                    g,
                                                    versus.barrage,
                                                    versus.class
                                                  )
                                                }
                                              >
                                                Victoire de{" "}
                                                {versus.joueurA.pseudo}
                                              </button>
                                              <button
                                                onClick={() =>
                                                  handleWinnerCascade(
                                                    versus.joueurB.numero,
                                                    versus.joueurA.numero,
                                                    r,
                                                    g,
                                                    versus.barrage,
                                                    versus.class
                                                  )
                                                }
                                              >
                                                Victoire de{" "}
                                                {versus.joueurB.pseudo}
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
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
          }
        })}
    </div>
  );
};

export default Cascade;
