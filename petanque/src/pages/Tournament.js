import React, { useEffect, useState, useContext, createContext } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { UsersContext } from "../App";
import axios from "axios";
import { linkBackend } from "../constants/LinkBackend";
import NoStartTournament from "../components/tournamentComponents/NoStartTournament";
import ArbreTournament from "../components/tournaments/ArbreTournament";
import Cascade from "../components/tournaments/Cascade";
import ClassementTournament from "../components/tournaments/ClassementTournament";
import createPaires from "../utils/CreatePaires";

export const OrgaContext = createContext();

const Tournament = () => {
  // State qui récupère l'id de l'url pour savoir quel tournoi on doit afficher
  const { idTournament } = useParams();
  // State qui récupère une variable global pour savoir si on est connecté
  const { login } = useContext(UsersContext);
  const navigate = useNavigate();
  // State qui va récupérer tous les joueurs qui sont en lien avec le tournoi, vérifie aussi si le tournoi a commencé, si res = 0 alors le tournoi n'a pas commencé et on doit afficher les joueurs, sinon res = 1 et ca a commencé
  const [listPlayers, setListPlayers] = useState({});
  // State qui dit que tel joueur a gagné
  const [responseWin, setResponseWin] = useState("");
  // State qui va nous aider quand faudra afficher les matchs trié par leurs catégories
  const [pairesInfos, setPaireInfos] = useState({});
  useEffect(() => {
    if (!login) {
      navigate("/");
    }
  }, []);

  const formatTournament = {
    arbre: ArbreTournament,
    cascade: Cascade,
    classement: ClassementTournament,
  };
  const TournamentComponent = formatTournament[listPlayers.style];

  // Fonction qui recharge la page, on sait si le tournoi a commencé et quels sont les joueurs qui y participe
  const recharge = () => {
    // Fonction pour connaitre les groupes, round et tour qui se déroulent pour voir les trucs qu'on affiche seulement
    axios.get(linkBackend + "tournaments2/" + idTournament).then((res) => {
      setResponseWin("");
      const filteredMatches = res.data.matches
        ? res.data.matches.filter((match) => match.id_playerA && !match.end)
        : [];

      setListPlayers({
        ...res.data,
        matches: filteredMatches,
      });
      const { rounds, groupes, tours } = createPaires(filteredMatches);
      setPaireInfos({ rounds, groupes, tours });
    });
  };

  useEffect(() => {
    recharge();
  }, []);
  return (
    <OrgaContext.Provider value={{ orga: true }}>
      <div>
        <h2>Tournament {idTournament}</h2>
        {/* Si le tournoi n'a pas commencé on va afficher les joueurs en attente et accepté */}
        {listPlayers.res == 0 && (
          <NoStartTournament
            listPlayers={listPlayers}
            recharge={recharge}
            idTournament={idTournament}
            style={listPlayers.style}
          />
        )}
        {/* Le tournoi a commencé */}
        {listPlayers.res == 1 && (
          <div>
            <h2>Go Tournoi</h2>
            <h3>Tournoi en {listPlayers.style}</h3>
            <p>{responseWin}</p>
            {TournamentComponent && (
              <TournamentComponent
                listPlayers={listPlayers}
                pairesInfos={pairesInfos}
                setResponseWin={setResponseWin}
                idTournament={idTournament}
                recharge={recharge}
              />
            )}
          </div>
        )}
        {/* Le tournoi est fini est on affiche le vainqueur */}
        {listPlayers.res == 2 && (
          <div>
            <h1>{listPlayers.msg}</h1>
          </div>
        )}
        <NavLink to="/Home">Retour</NavLink>
      </div>
    </OrgaContext.Provider>
  );
};

export default Tournament;
