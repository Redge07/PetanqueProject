import axios from "axios";
import React from "react";
import { linkBackend } from "../../constants/LinkBackend";
import Arbre from "./Arbre";

const ArbreTournament = ({
  pairesInfos,
  listPlayers,
  setResponseWin,
  idTournament,
  recharge,
}) => {
  // Fonction quand je déclare le vainqueur dans un tournoi arbre
  const handleWinnerArbre = (win, lose, tour) => {
    axios
      .put(linkBackend + "gotournaments/win_player_arbre/" + idTournament, {
        win: win,
        lose: lose,
        tour: tour,
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
      matches={listPlayers.results}
      pairesInfos={pairesInfos}
      handleWinner={handleWinnerArbre}
    />
  );
};

export default ArbreTournament;
