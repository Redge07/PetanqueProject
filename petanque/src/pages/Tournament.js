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
import Map from "../components/tournamentComponents/Map";
import NotConnect from "../constants/NotConnect";

export const OrgaContext = createContext();

const Tournament = () => {
  // State qui récupère l'id de l'url pour savoir quel tournoi on doit afficher
  const { idTournament } = useParams();
  // State qui récupère une variable global pour savoir si on est connecté
  const { setLoad, setError, player } = useContext(UsersContext);
  const navigate = useNavigate();
  // State qui va récupérer tous les joueurs qui sont en lien avec le tournoi, vérifie aussi si le tournoi a commencé, si res = 0 alors le tournoi n'a pas commencé et on doit afficher les joueurs, sinon res = 1 et ca a commencé
  const [listPlayers, setListPlayers] = useState({});
  // State qui dit que tel joueur a gagné
  const [responseWin, setResponseWin] = useState("");
  // State qui va nous aider quand faudra afficher les matchs trié par leurs catégories
  const [pairesInfos, setPaireInfos] = useState({});
  const formatTournament = {
    arbre: ArbreTournament,
    cascade: Cascade,
    classement: ClassementTournament,
  };
  const TournamentComponent = formatTournament[listPlayers.style];

  // Fonction qui recharge la page, on sait si le tournoi a commencé et quels sont les joueurs qui y participe
  const recharge = async () => {
    setLoad(true);
    try {
      const res = await axios.get(linkBackend + "tournaments/" + idTournament);
      setResponseWin("");
      const filteredMatches = res.data.matches
        ? res.data.matches.filter(
            (match) => match.id_playerA && (!match.end || match.end == -1)
          )
        : [];

      setListPlayers({
        ...res.data,
        matches: filteredMatches,
      });
      // Fonction pour connaitre les groupes, round et tour qui se déroulent pour voir les trucs qu'on affiche seulement
      const { rounds, groupes, tours } = createPaires(filteredMatches);
      setPaireInfos({ rounds, groupes, tours });
    } catch (err) {
      setError(true);
      console.log(err);
      navigate("/");
    } finally {
      setLoad(false);
    }
  };
  useEffect(() => {
    recharge();
  }, []);
  if (!player) return <NotConnect />;
  return (
    // Comme on est un organisateur on définit une variable "orga" a true qui fera des diiferences entre un participant ou un organisateur qui affiche un tournoi
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
            <h1>Le vainqueur est {listPlayers.vainqueur}</h1>
          </div>
        )}
        <NavLink to="/">Retour</NavLink>
        <Map idTournament={idTournament} />
      </div>
    </OrgaContext.Provider>
  );
};

export default Tournament;
