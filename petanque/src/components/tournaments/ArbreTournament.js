import axios from "axios";
import React from "react";
import { linkBackend } from "../../constants/LinkBackend";
import Arbre from "../tournamentComponents/Arbre";

const ArbreTournament = ({
  pairesInfos,
  listPlayers,
  setResponseWin,
  idTournament,
  recharge,
}) => {
  // Fonction quand je déclare le vainqueur dans un tournoi arbre
  const handleWinnerArbre = (win, lose, versus) => {
    const pseudoWin =
      versus.id_playerA == win ? versus.pseudo_A : versus.pseudo_B;
    axios
      .put(linkBackend + "winner/arbre/" + idTournament, {
        win: win,
        lose: lose,
        tour: versus.class,
        pseudoWin,
      })
      .then((res) => {
        setResponseWin(res.data);
        setTimeout(() => {
          recharge();
        }, 1000);
      });
  };
  return (
    <Arbre
      matches={listPlayers.matches}
      pairesInfos={pairesInfos}
      handleWinner={handleWinnerArbre}
    />
  );
};

export default ArbreTournament;
