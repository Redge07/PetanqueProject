import axios from "axios";
import React, { useContext, useState } from "react";
import { linkBackend } from "../../constants/LinkBackend";
import Arbre from "../tournamentComponents/Arbre";
import PlayerSearch, {
  filterMatchesByPlayer,
} from "../tournamentComponents/PlayerSearch";
import { UsersContext } from "../../App";
import { OrgaContext } from "../../pages/Tournament";

const ArbreTournament = ({
  pairesInfos,
  listPlayers,
  setResponseWin,
  idTournament,
  recharge,
}) => {
  const { setLoad, setError } = useContext(UsersContext);
  const { orga } = useContext(OrgaContext) ?? {};
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ groupe: "", round: "", tour: "" });

  let filteredMatches = filterMatchesByPlayer(listPlayers.matches, query);
  if (filters.tour) filteredMatches = filteredMatches.filter((m) => String(m.class) == filters.tour);

  const hasActiveFilters = query.trim() || filters.tour;
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
      await recharge();
    } catch (err) {
      setError(true);

    } finally {
      setLoad(false);
    }
  };
  return (
    <div>
      <PlayerSearch
        query={query}
        setQuery={setQuery}
        options={orga ? { groupes: pairesInfos.groupes, rounds: pairesInfos.rounds, tours: pairesInfos.tours } : {}}
        filters={filters}
        setFilters={orga ? setFilters : undefined}
      />
      {hasActiveFilters && filteredMatches.length === 0 ? (
        <p className="text-sm text-[var(--color-gray)] text-center py-6 bg-white/80 rounded-2xl shadow-xl">
          Aucun match trouvé pour ces filtres
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
