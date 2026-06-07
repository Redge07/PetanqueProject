import axios from "axios";
import React, { useContext, useState } from "react";
import { linkBackend } from "../../constants/LinkBackend";
import Arbre from "../tournamentComponents/Arbre";
import PlayerSearch, {
  filterMatchesByPlayer,
} from "../tournamentComponents/PlayerSearch";
import { UsersContext } from "../../App";

const ArbreTournament = ({
  pairesInfos,
  listPlayers,
  setResponseWin,
  idTournament,
  recharge,
}) => {
  const { setLoad, setError } = useContext(UsersContext);
  const [query, setQuery] = useState("");
  const filteredMatches = filterMatchesByPlayer(listPlayers.matches, query);
  // Fonction quand je déclare le vainqueur dans un tournoi arbre
  const handleWinnerArbre = async (win, lose, versus) => {
    setLoad(true);
    try {
      const pseudoWin =
        versus.id_playerA == win ? versus.pseudo_A : versus.pseudo_B;
      const res = await axios.put(
        linkBackend + "winner/arbre/" + idTournament,
        {
          win: win,
          lose: lose,
          tour: versus.class,
          pseudoWin,
        },
      );
      setResponseWin(res.data);
      setTimeout(() => {
        recharge();
      }, 1000);
    } catch (err) {
      setError(true);

    } finally {
      setLoad(false);
    }
  };
  return (
    <div>
      <PlayerSearch query={query} setQuery={setQuery} />
      {query.trim() && filteredMatches.length === 0 ? (
        <p className="text-sm text-[var(--color-gray)] text-center py-6 bg-white/80 rounded-2xl shadow-xl">
          Aucun joueur trouvé dans les matchs en cours
        </p>
      ) : (
        <Arbre
          matches={filteredMatches}
          pairesInfos={pairesInfos}
          handleWinner={handleWinnerArbre}
        />
      )}
    </div>
  );
};

export default ArbreTournament;
