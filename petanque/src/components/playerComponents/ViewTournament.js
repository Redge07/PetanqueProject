import React, { useEffect, useState } from "react";
import ArbreTournament from "../tournaments/ArbreTournament";
import Cascade from "../tournaments/Cascade";
import ClassementTournament from "../tournaments/ClassementTournament";
import axios from "axios";
import { linkBackend } from "../../constants/LinkBackend";

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

  console.log("eee1");
  console.log(infosTournament);
  console.log("eee2");
  console.log(pairesInfos);
  console.log("eee3");
  console.log(idTournament);

  useEffect(() => {
    const getInfosTournament = () => {
      const createPaires = (matches) => {
        let groupes = [];
        let rounds = [];
        let tours = [];
        matches.forEach((match) => {
          const groupe = match.groupe;
          if (!groupes.includes(groupe)) {
            groupes.push(groupe);
          }
          const round = match.round;
          if (!rounds.includes(parseInt(round))) {
            rounds.push(parseInt(round));
          }
          const tour = match.class;
          if (!tours.includes(parseFloat(tour))) {
            tours.push(parseFloat(tour));
          }
        });
        setReady(true);
        return { rounds, groupes, tours };
      };
      axios
        .get(linkBackend + "tournaments/charge/" + idTournament)
        .then((res) => {
          setInfosTournament(res.data);
          const { rounds, groupes, tours } = createPaires(res.data.results);
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
