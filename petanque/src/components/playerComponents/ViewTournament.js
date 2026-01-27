import React, { useEffect, useState } from "react";
import ArbreTournament from "../tournaments/ArbreTournament";
import Cascade from "../tournaments/Cascade";
import ClassementTournament from "../tournaments/ClassementTournament";
import axios from "axios";
import { linkBackend } from "../../constants/LinkBackend";
import CreatePaires from "../../utils/CreatePaires";

const ViewTournament = ({ idTournament, style }) => {
  const [infosTournament, setInfosTournament] = useState({});
  const [pairesInfos, setPaireInfos] = useState({});
  const [ready, setReady] = useState(false);

  const formatTournament = {
    arbre: ArbreTournament,
    cascade: Cascade,
    classement: ClassementTournament,
  };
  const TournamentComponent = formatTournament[style];

  useEffect(() => {
    const getInfosTournament = () => {
      axios.get(linkBackend + "tournaments2/" + idTournament).then((res) => {
        const filteredMatches = res.data.matches
          ? res.data.matches.filter(
              (match) => match.id_playerA && (!match.end || match.end == -1),
            )
          : [];

        setInfosTournament({
          ...res.data,
          matches: filteredMatches,
        });
        const { rounds, groupes, tours } = CreatePaires(filteredMatches);
        setReady(true);
        setPaireInfos({ rounds, groupes, tours });
      });
    };
    getInfosTournament();
  }, []);
  return (
    <div>
      {ready && (
        <TournamentComponent
          listPlayers={infosTournament}
          pairesInfos={pairesInfos}
          setResponseWin={null}
          idTournament={idTournament}
          recharge={null}
        />
      )}
    </div>
  );
};

export default ViewTournament;
