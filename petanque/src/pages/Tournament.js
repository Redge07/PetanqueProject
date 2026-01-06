import React, { useEffect, useState, useContext } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { UsersContext } from "../App";
import axios from "axios";
import { linkBackend } from "../constants/LinkBackend";
import NoStartTournament from "../components/tournamentComponents/NoStartTournament";
import ArbreTournament from "../components/tournamentComponents/ArbreTournament";
import CascadeTournament from "../components/tournamentComponents/CascadeTournament";
import ClassementTournament from "../components/tournamentComponents/ClassementTournament";

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
    cascade: CascadeTournament,
    classement: ClassementTournament,
  };
  const TournamentComponent = formatTournament[listPlayers.style];

  console.log("ee");

  console.log(pairesInfos);
  console.log(listPlayers);

  // Fonction qui recharge la page, on sait si le tournoi a commencé et quels sont les joueurs qui y participe
  const recharge = () => {
    // Fonction pour connaitre les groupes, round et tour qui se déroulent pour voir les trucs qu'on affiche seulement
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
      return { rounds, groupes, tours };
    };
    axios
      .get(linkBackend + "tournaments/charge/" + idTournament)
      .then((res) => {
        console.log(res.data);
        setListPlayers(res.data);
        setResponseWin("");
        const { rounds, groupes, tours } = createPaires(res.data.results);
        setPaireInfos({ rounds, groupes, tours });
      });
  };

  useEffect(() => {
    recharge();
  }, []);
  return (
    <div>
      <h2>Tournament {idTournament}</h2>
      {/* Si le tournoi n'a pas commencé on va afficher les joueurs en attente et accepté */}
      {listPlayers.res == 0 && (
        <NoStartTournament
          listPlayers={listPlayers}
          recharge={recharge}
          idTournament={idTournament}
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
              pairesInfos={pairesInfos}
              listPlayers={listPlayers}
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
  );
};

export default Tournament;
