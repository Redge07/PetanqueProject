import React, { useEffect, useState, useContext, use } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { UsersContext } from "../App";
import axios from "axios";

const Tournament = () => {
  // State qui récupère l'id de l'url pour savoir quel tournoi on doit afficher
  const { idTournament } = useParams();
  // State qui récupère une variable global pour savoir si on est connecté
  const { login } = useContext(UsersContext);
  const navigate = useNavigate();
  // State qui va récupérer tous les joueurs qui sont en lien avec le tournoi, vérifie aussi si le tournoi a commencé, si res = 0 alors le tournoi n'a pas commencé et on doit afficher les joueurs, sinon res = 1 et ca a commencé
  const [listPlayers, setListPlayers] = useState([]);
  // State qui gère les message quand on supprime ou qu'on accepte un joueur
  const [responseAPI, setResponseAPI] = useState({ res: 0 });
  useEffect(() => {
    if (!login) {
      navigate("/");
    }
  }, []);

  // Fonction qui recharge la page, on sait si le tournoi a commencé et quels sont les joueurs qui y participe
  const recharge = () => {
    setResponseAPI({ res: 0 });
    axios
      .get("http://localhost:5000/recup_players_tournament/" + idTournament)
      .then((res) => {
        setListPlayers(res.data);
      });
  };

  // Fonction pour supprimer un joueur du tournoi
  const handleDelete = (value) => {
    axios.delete("http://localhost:5000/delete_player/" + value).then((res) => {
      setResponseAPI(res.data);
      setTimeout(() => {
        recharge();
      }, 1000);
    });
  };

  // Fonction pour accepté un joueur
  const handleValid = (value) => {
    axios.put("http://localhost:5000/valid_player/" + value).then((res) => {
      console.log(res.data);
      setResponseAPI(res.data);
      setTimeout(() => {
        recharge();
      }, 1000);
    });
  };

  const countPlayer = (value) => {
    if (value == 0) {
      let listPlayersAttente = listPlayers.results.filter(
        (p) => p.valider == 0
      );
      return listPlayersAttente.length;
    } else {
      let listPlayersValider = listPlayers.results.filter(
        (p) => p.valider == 1
      );
      return listPlayersValider.length;
    }
  };

  useEffect(() => {
    recharge();
  }, []);
  return (
    <div>
      <h2>Tournament {idTournament}</h2>
      {/* Si le tournoi n'a pas commencé on va afficher les joueurs en attente et accepté */}
      {listPlayers.res == 0 && (
        <div>
          <div>
            <h3>Joueurs en attente</h3>
            <p>
              Il y a {countPlayer(0)}{" "}
              {countPlayer(0) > 1 ? "joueurs" : "joueur"} en attente
            </p>
            <ul>
              {/* On liste les joueurs qui sont en attente en filtrant avec le colonne "valider" */}
              {listPlayers.results
                .filter((j) => j.valider == 0)
                .map((j) => (
                  <li key={j.id_user}>
                    {/* Pseudo du joueur */}
                    <span>{j.pseudo}</span>
                    {/* Bouton pour supprimer ce joueur */}
                    <button onClick={() => handleDelete(j.id_user)}>
                      Supprimer
                    </button>
                    {/* Bouton pour accepté ce joueur */}
                    <button onClick={() => handleValid(j.id_user)}>
                      Accepté
                    </button>
                    {/* Message qui va apparaitre quand on va supprimer ou accepté un joueur, vérifie si on parle d'une suppression ou d'une validation et vérifie l'id pour bien affiché ce message au joueur concerné */}
                    {responseAPI.res == 1 && responseAPI.id == j.id_user && (
                      <p>{responseAPI.msg}</p>
                    )}
                  </li>
                ))}
            </ul>
          </div>
          <div>
            <h3>Joueurs accepté</h3>
            <p>
              Il y a {countPlayer(1)}{" "}
              {countPlayer(1) > 1 ? "joueurs" : "joueur"} en attente
            </p>
            <ul>
              {listPlayers.results
                .filter((j) => j.valider == 1)
                .map((j) => (
                  <li key={j.id_user}>
                    <span>{j.pseudo}</span>
                    <button onClick={() => handleDelete(j.id_user)}>
                      Supprimer
                    </button>
                    {responseAPI.res == 1 && responseAPI.id == j.id_user && (
                      <p>{responseAPI.msg}</p>
                    )}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}

      <NavLink to="/Home">Retour</NavLink>
    </div>
  );
};

export default Tournament;
