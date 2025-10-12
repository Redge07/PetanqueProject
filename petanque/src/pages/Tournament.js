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
  // State qui affiche le message quand le tournoi est bien lancé
  const [responseGoTournament, setResponseGoTournament] = useState("");
  // State qui dit que tel joueur a gagné
  const [responseWin, setResponseWin] = useState("");
  const [infosCascade, setInfosCascade] = useState();
  useEffect(() => {
    if (!login) {
      navigate("/");
    }
  }, []);

  // Fonction qui recharge la page, on sait si le tournoi a commencé et quels sont les joueurs qui y participe
  const recharge = () => {
    setResponseAPI({ res: 0 });
    axios
      .get("http://localhost:5000/tournaments/charge/" + idTournament)
      .then((res) => {
        console.log(res.data);
        setListPlayers(res.data);
        setResponseWin("");
        const groupes = [
          ...new Set(res.data.results.map((match) => match.groupe)),
        ];
        const round = [
          ...new Set(res.data.results.map((match) => match.round)),
        ];
        setInfosCascade([groupes, round]);
      });
  };

  // Fonction pour supprimer un joueur du tournoi en attente
  const handleDeleteAttente = (value) => {
    axios
      .delete(
        "http://localhost:5000/tournaments/delete_players_attente/" + value
      )
      .then((res) => {
        setResponseAPI(res.data);
        setTimeout(() => {
          recharge();
        }, 1000);
      });
  };

  // Fonction pour supprimer un joueur du tournoi en valid
  const handleDeleteValid = (value) => {
    axios
      .delete(
        "http://localhost:5000/tournaments/delete_players_valid/" +
          idTournament,
        { data: { numero: value } }
      )
      .then((res) => {
        setResponseAPI(res.data);
        setTimeout(() => {
          recharge();
        }, 1000);
      });
  };

  // Fonction pour accepté un joueur
  const handleValid = (value) => {
    axios
      .put("http://localhost:5000/tournaments/valid/" + idTournament, {
        id_user: value,
      })
      .then((res) => {
        console.log(res.data);
        setResponseAPI(res.data);
        setTimeout(() => {
          recharge();
        }, 1000);
      });
  };

  // Fonction pour ajouter un joueur manuellement
  const handleAddPlayer = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:5000/tournaments/add_player/" + idTournament, {
        pseudo: e.target.elements.pseudo.value,
      })
      .then((res) => {
        console.log(res.data);
        setResponseAPI(res.data);
        setTimeout(() => {
          recharge();
        }, 1000);
      });
  };

  // Fonction pour connaitre le nombre de joueurs en attente et confirmé
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

  // Fonction quand je décide de démarrer le tournoi
  const handleGoTournament = () => {
    axios
      .put("http://localhost:5000/gotournaments/go_tournament/" + idTournament)
      .then((res) => {
        setResponseGoTournament(res.data);
        setTimeout(() => {
          recharge();
        }, 1000);
      });
  };

  // Fonction quand je déclare le vainqueur dans un tournoi arbre
  const handleWinnerArbre = (win, lose, tour) => {
    console.log(
      "Le gagnant est " +
        win +
        " et le perdant est " +
        lose +
        " pour ce 1/" +
        tour +
        " finale " +
        "pour le tournoi " +
        idTournament
    );
    axios
      .put(
        "http://localhost:5000/gotournaments/win_player_arbre/" + idTournament,
        {
          win: win,
          lose: lose,
          tour: tour,
        }
      )
      .then((res) => {
        setResponseWin(res.data);
        setTimeout(() => {
          recharge();
        }, 1000);
      });
  };

  // Fonction quand je déclare le vainqueur
  const handleWinnerCascade = (win, lose, tour, groupe, round) => {
    console.log(
      "Le gagnant est " +
        win +
        " et le perdant est " +
        lose +
        " pour ce 1/" +
        tour +
        " finale " +
        "pour le tournoi " +
        idTournament
    );
    axios
      .put(
        "http://localhost:5000/gotournaments/win_player_cascade/" +
          idTournament,
        {
          win: win,
          lose: lose,
          tour: tour,
          groupe: groupe,
          round: round,
        }
      )
      .then((res) => {
        setResponseWin(res.data);
        setTimeout(() => {
          recharge();
        }, 1000);
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
                    <button onClick={() => handleDeleteAttente(j.id_user)}>
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
            {/* On va lister tous les joueurs qui n'ont pas encore été accepté pour ce tournoi en question dans la base de données */}
            <h3>Joueurs accepté</h3>
            <p>
              Il y a {countPlayer(1)}{" "}
              {countPlayer(1) > 1 ? "joueurs" : "joueur"} accepté
            </p>
            <ul>
              {listPlayers.results
                .filter((j) => j.valider == 1)
                .map((j) => (
                  <li key={j.numero}>
                    <span>{j.pseudo}</span>
                    <span> numéro : {j.numero}</span>
                    <button onClick={() => handleDeleteValid(j.numero)}>
                      Supprimer
                    </button>
                    {responseAPI.res == 1 && responseAPI.numero == j.numero && (
                      <p>{responseAPI.msg}</p>
                    )}
                  </li>
                ))}
            </ul>
          </div>
          <h3>Ajouté un joueur manuellement</h3>
          {/* Form pour ajouter un joueur manuellement */}
          <form onSubmit={handleAddPlayer}>
            <input
              type="text"
              name="pseudo"
              placeholder="Entrez un pseudo..."
            />
            <input type="submit" value="Inscrire le joueur" />
          </form>
          <button onClick={handleGoTournament}>Lancer le tournoi</button>
          <p>{responseGoTournament}</p>
        </div>
      )}
      {/* Le tournoi a commencé */}
      {listPlayers.res == 1 && (
        <div>
          <h2>Go Tournoi</h2>
          {listPlayers.style == "arbre" && (
            <div>
              <h3>Tournoi en Arbre</h3>
              <p>{responseWin}</p>
              <ul>
                {/* Je liste toutes les confrontations */}
                {listPlayers.results.map((p, i) => (
                  <li key={p.numero}>
                    <p>
                      Match {i + 1} : {p.joueurA.pseudo}, numéro :{" "}
                      {p.joueurA.numero} vs{" "}
                      {p.joueurB
                        ? p.joueurB.pseudo + ", numéro : " + p.joueurB.numero
                        : "Pas encore d'adversaire attribué"}{" "}
                      en 1/{p.class}
                    </p>
                    {p.joueurB && (
                      <div>
                        <button
                          onClick={() =>
                            handleWinnerArbre(
                              p.joueurA.numero,
                              p.joueurB.numero,
                              p.class
                            )
                          }
                        >
                          Victoire de {p.joueurA.pseudo}
                        </button>
                        <button
                          onClick={() =>
                            handleWinnerArbre(
                              p.joueurB.numero,
                              p.joueurA.numero,
                              p.class
                            )
                          }
                        >
                          Victoire de {p.joueurB.pseudo}
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {listPlayers.style == "cascade" && (
            <div>
              <h3>Tournoi en Cascade</h3>
              {infosCascade[0].map((g) => (
                <div>
                  <h4>Groupe {g}</h4>
                  {infosCascade[1].map((n) => (
                    <div>
                      <h4>Match numéro {n}</h4>
                      {listPlayers.results
                        .filter((m) => m.groupe == g && m.round == n)
                        .map((p, i) => (
                          <li key={p.numero}>
                            <p>
                              Match {i + 1} : {p.joueurA.pseudo}, numéro :{" "}
                              {p.joueurA.numero} vs{" "}
                              {p.joueurB
                                ? p.joueurB.pseudo +
                                  ", numéro : " +
                                  p.joueurB.numero
                                : "Pas encore d'adversaire attribué"}
                            </p>
                            {p.joueurB && (
                              <div>
                                <button
                                  onClick={() =>
                                    handleWinnerCascade(
                                      p.joueurA.numero,
                                      p.joueurB.numero,
                                      p.class,
                                      p.groupe,
                                      p.round
                                    )
                                  }
                                >
                                  Victoire de {p.joueurA.pseudo}
                                </button>
                                <button
                                  onClick={() =>
                                    handleWinnerCascade(
                                      p.joueurB.numero,
                                      p.joueurA.numero,
                                      p.class,
                                      p.groupe,
                                      p.round
                                    )
                                  }
                                >
                                  Victoire de {p.joueurB.pseudo}
                                </button>
                              </div>
                            )}
                          </li>
                        ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
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
