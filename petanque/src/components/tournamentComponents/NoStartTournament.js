import axios from "axios";
import React, { useContext, useState } from "react";
import { linkBackend } from "../../constants/LinkBackend";
import { UsersContext } from "../../App";

const NoStartTournament = ({ listPlayers, recharge, idTournament, style }) => {
  // State qui gère les message quand on supprime ou qu'on accepte un joueur
  const [responseAPI, setResponseAPI] = useState({ res: 0 });
  const [nbPlayers, setNbPlayers] = useState("");

  const { setLoad } = useContext(UsersContext);

  // State qui affiche le message quand le tournoi est bien lancé
  const [responseGoTournament, setResponseGoTournament] = useState("");

  // Variable pour calculer le nombre de joueurs en attente et validé
  const listPlayersAttente = listPlayers.results.filter((p) => p.valider == 0);
  const listPlayersValider = listPlayers.results.filter((p) => p.valider == 1);

  const handleApiResponse = (res) => {
    setResponseAPI(res.data);
    setTimeout(() => {
      setResponseAPI({ res: 0 });
      recharge();
    }, 1000);
  };

  // Fonction pour supprimer un joueur du tournoi en attente
  const handleDeleteAttente = (value) => {
    setLoad(true);
    axios
      .delete(linkBackend + "tournaments/players_attente/" + value)
      .then((res) => handleApiResponse(res))
      .finally(() => setLoad(false));
  };

  // Fonction pour supprimer un joueur du tournoi en valid
  const handleDeleteValid = (value) => {
    setLoad(true);
    axios
      .delete(linkBackend + "tournaments2/" + idTournament, {
        data: { numero: value },
      })
      .then((res) => handleApiResponse(res))
      .finally(() => setLoad(false));
  };

  // Fonction pour accepté un joueur
  const handleValid = (value) => {
    setLoad(true);
    axios
      .put(linkBackend + "tournaments/" + idTournament, {
        id_user: value,
      })
      .then((res) => handleApiResponse(res))
      .finally(() => setLoad(false));
  };

  // Fonction pour ajouter un joueur manuellement
  const handleAddPlayer = (e) => {
    e.preventDefault();
    setLoad(true);
    axios
      .post(linkBackend + "tournaments/" + idTournament, {
        pseudo: e.target.elements.pseudo.value,
      })
      .then((res) => handleApiResponse(res))
      .finally(() => setLoad(false));
  };

  // Fonction quand je décide de démarrer le tournoi
  const handleGoTournament = () => {
    setLoad(true);
    axios
      .put(linkBackend + `gotournaments/${style}/` + idTournament)
      .then((res) => {
        setResponseGoTournament(res.data);
        setTimeout(() => {
          recharge();
        }, 1000);
      })
      .finally(() => setLoad(false));
  };
  const handleCreatePlayers = () => {
    if (!nbPlayers || nbPlayers <= 0) return;

    setLoad(true);
    axios
      .post(
        linkBackend + "gotournaments/create_players/" + idTournament,
        new URLSearchParams({
          nbPlayers: nbPlayers,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      )
      .then((res) => handleApiResponse(res))
      .finally(() => setLoad(false));
  };

  return (
    <div className="composant" style={{ border: "solid 2px red" }}>
      <h4 style={{ color: "red" }}>
        Composant qui représente un tournoi lorsqu'il n'a pas encore commencé
      </h4>
      <div>
        <h3>Joueurs en attente</h3>
        <p>
          Il y a {listPlayersAttente.length}{" "}
          {listPlayersAttente.length > 1 ? "joueurs" : "joueur"} en attente
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
                <button onClick={() => handleValid(j.id_user)}>Accepté</button>
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
          Il y a {listPlayersValider.length}{" "}
          {listPlayersValider.length > 1 ? "joueurs" : "joueur"} accepté
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
        <input type="text" name="pseudo" placeholder="Entrez un pseudo..." />
        <input type="submit" value="Inscrire le joueur" />
      </form>
      <h3>Créer des joueurs automatiquement</h3>

      <input
        type="number"
        min="1"
        placeholder="Nombre de joueurs"
        value={nbPlayers}
        onChange={(e) => setNbPlayers(e.target.value)}
      />

      <button onClick={handleCreatePlayers}>Créer les joueurs</button>

      <button onClick={handleGoTournament}>Lancer le tournoi</button>
      <p>{responseGoTournament}</p>
    </div>
  );
};

export default NoStartTournament;
