import axios from "axios";
import React from "react";
import { linkBackend } from "../../constants/LinkBackend";
import Arbre from "../tournamentComponents/Arbre";
import ButtonWinner from "../tournamentComponents/ButtonsWinner";
import VainqueurGroupe from "../tournamentComponents/VainqueurGroupe";

const Cascade = ({
  listPlayers,
  pairesInfos,
  recharge,
  setResponseWin,
  idTournament,
}) => {
  // Fonction quand je déclare le vainqueur
  const handleWinnerCascade = (win, lose, versus) => {
    const pseudoWin =
      versus.id_playerA == win ? versus.pseudo_A : versus.pseudo_B;
    const pseudoLose =
      versus.id_playerA == lose ? versus.pseudo_A : versus.pseudo_B;
    axios
      .put(linkBackend + "winner/cascade/" + idTournament, {
        win,
        lose,
        round: versus.round,
        groupe: versus.groupe,
        barrage: versus.barrage,
        tour: versus.class,
        pseudoWin,
        pseudoLose,
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
      <VainqueurGroupe listPlayers={listPlayers} />
      {/* On tri par les groupes */}
      {pairesInfos.groupes
        .sort(
          (a, b) =>
            ["A", "B", "B2", "C"].indexOf(a) - ["A", "B", "B2", "C"].indexOf(b),
        )
        .map((g) => {
          // Si y'a personne dans ce groupe on peut arreter la et ne rien n'afficher
          const vainqueur = `vainqueur${g}`;
          if (listPlayers.vainqueurs[vainqueur]) {
            return null;
          } else {
            return (
              <div
                className="composant"
                style={{ border: "solid 2px red" }}
                key={g}
              >
                <h2>Groupe {g}</h2>
                {/* Ensuite on tri par les rounds */}
                {pairesInfos.rounds
                  .sort((a, b) => b - a)
                  .map((r) => {
                    // Si y'a personne dans ce round et dans ce groupe on peut arreter la et ne rien n'afficher
                    const matches = listPlayers.matches.filter(
                      (v) => v.groupe == g && v.round == r,
                    );
                    if (matches.length == 0) {
                      return null;
                    } else if (r == 4) {
                      return (
                        <Arbre
                          pairesInfos={pairesInfos}
                          matches={matches}
                          handleWinner={handleWinnerCascade}
                        />
                      );
                    } else {
                      return (
                        <div
                          className="composant"
                          style={{ border: "solid 2px blue" }}
                          key={r}
                        >
                          <h3>Round {r}</h3>
                          {pairesInfos.tours
                            .sort((a, b) => a - b)
                            .map((t) => {
                              // On récupère tous les matchs qui correspondent a ce groupe, ce round et ce tour la
                              const versusMain = listPlayers.matches.filter(
                                (versus) =>
                                  versus.groupe == g &&
                                  versus.round == r &&
                                  versus.class == t,
                              );
                              // Si y'a aucun match dans ce round, ce groupe et ce tour on peut arreter la et ne rien n'afficher
                              if (versusMain.length == 0) {
                                return null;
                              } else {
                                return (
                                  <div key={t}>
                                    {/* J'affiche les confrontations qui respectent les filtres */}
                                    {versusMain.map((versus) => {
                                      return (
                                        <ButtonWinner
                                          versus={versus}
                                          handleWinner={handleWinnerCascade}
                                          key={versus.key}
                                        />
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
