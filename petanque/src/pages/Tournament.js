import React, { useEffect, useState, useContext } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { UsersContext } from "../App";
import axios from "axios";

const Tournament = () => {
  // Quand j'arrive sur ce composant, l'url contient l'id du tournoi sur lequelle je souhaite apparaitre
  const { idTournament } = useParams();
  const { login, setLogin, setPlayer } = useContext(UsersContext);
  // State pour récupérer les données des joueurs qui participe a ce tournoi précisément grave a une API
  const [listPlayers, setListPlayers] = useState([]);
  // State des joueurs qui attendent la confirmation de leurs participation
  const [listPlayersWaiting, setListPlayersWaiting] = useState([]);
  const navigate = useNavigate();
  // useEffect(() => {
  //   setLogin(true);
  //   setPlayer({ player: { id: 6, pseudo: "Admin" } });
  // }, []);
  useEffect(() => {
    if (!login) {
      navigate("/");
    }
  }, []);
  // J'enregistre les joueurs qui participe aux tournoi et je les mets dans le State "listPlayers", on lance aussi handlePlayerWaiting pour afficher les joueurs qui attendent, en gros la fonction est recharge car faut relancer les fonctions get car ca affiche la situation actuel
  const recharge = () => {
    axios
      .get("http://localhost:5000/get_players/" + idTournament)
      .then((res) => {
        setListPlayers(res.data);
        handlePlayerWaiting();
      });
  };
  useEffect(() => {
    recharge();
  }, []);
  // API qui supprime un joueur
  const handleDeletePlayer = async (value) => {
    await axios.delete(
      "http://localhost:5000/delete_player_tournament/" + value
    );
    recharge();
  };
  // Afficher les joueurs qui attendent la validation
  const handlePlayerWaiting = () => {
    axios
      .get("http://localhost:5000/get_players_waiting/" + idTournament)
      .then((res) => setListPlayersWaiting(res.data));
  };

  // Lien de l'API qui enregistre officielement un joueur dans ce tournoi en question, a la fin je recharge les joueurs qui participe au tournoi pour actualiser
  const handleValidPlayer = async (value) => {
    await axios.put("http://localhost:5000/confirm_player/" + value);
    recharge();
  };
  return (
    <div>
      <h1>Tournament {idTournament}</h1>
      <h3>Joueurs en attente</h3>
      <ul>
        {listPlayersWaiting.map((p) => {
          return (
            <li key={p.id}>
              {p.pseudo}
              <button onClick={() => handleDeletePlayer(p.id)}>
                Supprimer
              </button>
              <button onClick={() => handleValidPlayer(p.id)}>Valider</button>
            </li>
          );
        })}
      </ul>
      {/* Grace a l'api qui recupere les joueurs participant a ce tournoi en question, je les affiche en faisant un map */}
      <h3>Joueurs accepté</h3>
      <ul>
        {listPlayers.map((p) => {
          return (
            <li key={p.id}>
              {p.pseudo}
              <button onClick={() => handleDeletePlayer(p.id)}>
                Supprimer
              </button>
            </li>
          );
        })}
      </ul>
      <button>Lancez le tournoi</button>
      <NavLink to="/Home">Retour</NavLink>
    </div>
  );
};

export default Tournament;
