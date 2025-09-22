import React, { useEffect, useState, useContext, use } from "react";
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
  // State pour savoir si le tournoi a commencé
  const [start, setStart] = useState(0);
  const [listPlayersCurrent, setListPlayersCurrent] = useState([]);
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
  const get_players_waiting_and_valid = () => {
    axios
      .get("http://localhost:5000/get_players/" + idTournament)
      .then((res) => {
        setListPlayers(res.data);
        handlePlayerWaiting();
      });
  };
  // recharge + des le début afficher la situation du tournoi et savoir si le tournoi a commencé
  const recharge = () => {
    get_players_waiting_and_valid();
    axios
      .get("http://localhost:5000/verif_start_tournament/" + idTournament)
      .then((res) => {
        console.log(res.data);
        setStart(res.data);
        if (res.data == 1) {
          recupVersus();
        }
      });
  };
  useEffect(() => {
    recharge();
  }, []);
  // fonction pour récupérer tous les joueurs qui sont entrain de jouer le tournoi actuellement pour afficher bien l'avancée du tournoi
  const recupVersus = () => {
    axios
      .get("http://localhost:5000/get_versus/" + idTournament)
      .then((res) => setListPlayersCurrent(res.data));
  };
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

  // Fonction qui lance le tournoi officiellement
  const startTournament = async () => {
    await axios
      .put("http://localhost:5000/start_tournament/" + idTournament)
      .then((res) => console.log(res.data));
    recharge();
  };
  const playerWin = (win, lose) => {
    axios.put("http://localhost:5000/win_player/", { win, lose });
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
      <button onClick={startTournament}>Lancez le tournoi</button>
      {start == 1 ? (
        <div>
          {listPlayersCurrent.map((p) => (
            <p>
              {p.id}{" "}
              <button onClick={() => playerWin(p.id, p.id_versus)}>
                Victoire
              </button>
              contre {p.id_versus}
              <button onClick={() => playerWin(p.id_versus, p.id)}>
                Victoire
              </button>{" "}
              1/{p.class}
            </p>
          ))}
        </div>
      ) : null}
      <NavLink to="/Home">Retour</NavLink>
    </div>
  );
};

export default Tournament;
