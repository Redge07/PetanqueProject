import axios from "axios";
import React, { useContext } from "react";
import { linkBackend } from "../../constants/LinkBackend";
import Arbre from "../tournamentComponents/Arbre";
import ButtonWinner from "../tournamentComponents/ButtonsWinner";
import VainqueurGroupe from "../tournamentComponents/VainqueurGroupe";
import { UsersContext } from "../../App";

const Cascade = ({
  listPlayers,
  pairesInfos,
  recharge,
  setResponseWin,
  idTournament,
}) => {
  const { setLoad } = useContext(UsersContext);
  // Fonction quand je déclare le vainqueur
  const handleWinnerCascade = (win, lose, versus) => {
    setLoad(true);
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
      })
      .finally(() => setLoad(false));
  };
  return (
    <div>
      {/* On  affichera directement les vainqueurs si il y en a  */}
      <VainqueurGroupe listPlayers={listPlayers} />
      {/* On tri par les groupes */}
      {pairesInfos.groupes
        .sort(
          (a, b) =>
            ["A", "B", "B2", "C"].indexOf(a) - ["A", "B", "B2", "C"].indexOf(b),
        )
        .map((g) => {
          // Si ce groupe a déjà un vainqueur alors on affiche rien car c'est fini
          const vainqueur = `vainqueur${g}`;
          if (listPlayers.vainqueurs[vainqueur]) {
            return null;
          } else {
            // Sinon on affiche bien les matches de ce groupe
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
                    const matches = listPlayers.matches.filter(
                      (v) => v.groupe == g && v.round == r,
                    );
                    // Si y'a personne dans ce round et dans ce groupe on peut arreter la et ne rien n'afficher
                    if (matches.length == 0) {
                      return null;
                      // Sinon si y'a bien des matches et qu'on est dans les matches en phase finale on va les afficher differemment qui si on était en phase de groupe au début
                    } else if (r == 4) {
                      return (
                        <Arbre
                          pairesInfos={pairesInfos}
                          matches={matches}
                          handleWinner={handleWinnerCascade}
                        />
                      );
                      // Sinon on est bien en phase du début
                    } else {
                      return (
                        <div
                          className="composant"
                          style={{ border: "solid 2px blue" }}
                          key={r}
                        >
                          <h3>Round {r}</h3>
                          <div key={r}>
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
            );
          }
        })}
    </div>
  );
};

export default Cascade;
