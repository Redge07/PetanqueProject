import axios from "axios";
import React, { useContext } from "react";
import { linkBackend } from "../../constants/LinkBackend";
import Arbre from "../tournamentComponents/Arbre";
import { UsersContext } from "../../App";

const ArbreTournament = ({
  pairesInfos,
  listPlayers,
  setResponseWin,
  idTournament,
  recharge,
}) => {
  const { setLoad } = useContext(UsersContext);
  // Fonction quand je déclare le vainqueur dans un tournoi arbre
  const handleWinnerArbre = (win, lose, versus) => {
    setLoad(true);
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
      })
      .finally(() => setLoad(false));
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
