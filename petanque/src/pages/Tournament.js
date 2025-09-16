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
  // Lien de l'API qui enregistre officielement un joueur dans ce tournoi en question, a la fin je recharge les joueurs qui participe au tournoi pour actualiser
  const handleAddPlayer = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/add_player/" + idTournament, {
      pseudo: e.target.elements.pseudo.value,
    });
    recharge();
  };
  // J'enregistre les joueurs qui participe aux tournoi et je les mets dans le State "listPlayers"
  const recharge = () => {
    axios
      .get("http://localhost:5000/get_players/" + idTournament)
      .then((res) => setListPlayers(res.data));
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
  return (
    <div>
      <h1>Tournament {idTournament}</h1>
      <h2>Ajouter un joueur</h2>
      {/* Un formulaire qui enverra les données a l'api pour ajouter un joueur */}
      <form onSubmit={handleAddPlayer}>
        <input type="text" name="pseudo" placeholder="Le pseudo du joueur..." />
        <input type="submit" value="Ajouter" />
      </form>
      {/* Grace a l'api qui recupere les joueurs participant a ce tournoi en question, je les affiche en faisant un map */}
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
      <NavLink to="/Home">Retour</NavLink>
    </div>
  );
};

export default Tournament;
