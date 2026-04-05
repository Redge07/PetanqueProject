import React, { useContext, useEffect, useState } from "react";
import ArbreTournament from "../tournaments/ArbreTournament";
import Cascade from "../tournaments/Cascade";
import ClassementTournament from "../tournaments/ClassementTournament";
import axios from "axios";
import { linkBackend } from "../../constants/LinkBackend";
import CreatePaires from "../../utils/CreatePaires";
import { UsersContext } from "../../App";

const ViewTournament = ({ idTournament, style }) => {
  // Récupérer tous les matches du tournoi auquel on participe pour les montrer à l'écran aux joueurs
  const [infosTournament, setInfosTournament] = useState({});
  // State qui va récupérer les différents rang de tournoi qu'il y a actuellement (groupeA, round 2, tour 4 ect...)
  const [pairesInfos, setPaireInfos] = useState({});

  // State qui permettra de dire qu'on a toutes les infos pour afficher le tournoi comme il faut
  const [ready, setReady] = useState(false);
  const { setLoad } = useContext(UsersContext);

  const formatTournament = {
    arbre: ArbreTournament,
    cascade: Cascade,
    classement: ClassementTournament,
  };
  const TournamentComponent = formatTournament[style];

  useEffect(() => {
    // Fonction pour récupérer le tournoi actuel avec tous ses matches, et pour alimenter le state "paires"
    const getInfosTournament = () => {
      setLoad(true);
      axios
        .get(linkBackend + "tournaments/" + idTournament)
        .then((res) => {
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
        })
        .finally(() => setLoad(false));
    };
    getInfosTournament();
  }, []);
  return (
    <div>
      {/* Quand la fonction pour récupérer le tournoi a fini on peut dire qu'on est pret a afficher les données */}
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
