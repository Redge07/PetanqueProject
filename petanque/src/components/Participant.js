import axios from "axios";
import React, { useEffect, useState } from "react";
import { data } from "react-router-dom";

const Participant = ({ player }) => {
  // State qui va récupérer la situation de l'utilisateur sous sa forme de "player", il sera soit inscrit a aucun tournoi, soit en attente, soit accepté, soit le tournoi a commencé et il n'a aucun adversaire, soit il a un adversaire
  const [dataPlayer, setDataPlayer] = useState({ res: 0 });
  // State qui va récupérer le tournoi qui a été chercher dans la barre de recherche pour vouloir s'inscrire a un tournoi, -1 par défaut pour dire que aucune recherche n'a été essayer, 0 pour dire que le résultat de la recherche n'a pas trouvé de tournoi correspondant a cette id, 1 a trouver un tournoi qui correspond a cette id et 2 qui dit que le tournoi a été trouver mais a deja commencé
  const [dataTournament, setDataTournament] = useState({ res: -1 });
  // Récupérer un petit message pour dire que l'utilisateur a bien été inscrit au tournoi
  const [responseInscription, setResponseInscription] = useState("");
  // Récupérer un petit message pour dire que l'utilisateur a bien été désinscrit du tournoi
  const [responseDeinscription, setResponseDeinscription] = useState("");

  // Fonction pour s'inscrire a un tournoi
  const handleInscrire = (e) => {
    e.preventDefault();
    const pseudo = e.target.elements.pseudo.value;
    axios
      .post("http://localhost:5000/players/add_player/", {
        idUser: player.id,
        idTournament: dataTournament.id,
        pseudo: pseudo,
      })
      .then((res) => {
        setResponseInscription(res.data.res);
        setTimeout(() => {
          recharge();
        }, 1000);
      });
  };

  // Fonction pour récupérer le tournoi trouver grace a la recherche (quand on veut trouver un tournoi pour s'inscrire)
  const handleSearch = (e) => {
    e.preventDefault();
    const idSearch = e.target.elements.id.value;
    console.log(idSearch);
    axios
      .get("http://localhost:5000/players/search/" + idSearch)
      .then((res) => {
        console.log(res.data);
        setDataTournament(res.data);
      });
  };

  // Quand on s'est inscrit a un tournoi mais on n'est en attente et on veut se désinscrire
  const handleDelete = () => {
    axios
      .delete("http://localhost:5000/players/delete_player/" + player.id)
      .then((res) => {
        setResponseDeinscription(res.data.res);
        setTimeout(() => {
          recharge();
        }, 1000);
      });
  };

  // Fonction qui recharge la page, on récupère la situation du joueur bien mise a jour
  const recharge = () => {
    setDataTournament({ res: -1 });
    setResponseInscription("");
    setResponseDeinscription("");
    axios
      .get("http://localhost:5000/players/charge/" + player.id)
      .then((res) => {
        console.log(res.data);
        setDataPlayer(res.data);
      });
  };

  useEffect(() => {
    recharge();
  }, []);
  return (
    <div>
      <h2>Participant</h2>
      {/* Si le joueur n'est lier a aucun tournoi, on propose une barre de recherche */}
      {dataPlayer.res == 0 && (
        <div>
          <p>Vous ne participez à aucun tournoi</p>
          <form onSubmit={handleSearch}>
            <input
              type="number"
              name="id"
              placeholder="Rechercher un tournoi avec son id..."
            />
            <input type="submit" value="Chercher" />
          </form>
          {/* Après avoir cherché un tournoi, l'id ne correspond a aucun tournoi */}
          {dataTournament.res == 0 && (
            <p>Cette id ne correspond à aucun tournoi</p>
          )}
          {/* On a trouvé le tournoi, on propose de s'inscrire en tapant un pseudo et de s'inscrire */}
          {dataTournament.res == 1 && (
            <div>
              <p>
                {dataTournament.name} {dataTournament.style}
              </p>
              <form onSubmit={handleInscrire}>
                <input
                  type="text"
                  name="pseudo"
                  placeholder="Entrer votre pseudo"
                />
                <input type="submit" value="S'inscrire" />
              </form>
              <p>{responseInscription}</p>
            </div>
          )}
          {/* On a trouvé un tournoi mais il a deja commencé donc on ne peut pas s'inscrire */}
          {dataTournament.res == 2 && (
            <p>
              Le tournoi {dataTournament.name} à déja commencé, vous ne pouvez
              pas y participer
            </p>
          )}
        </div>
      )}
      {/* Le joueur est actuellement en attente d'acceptation d'un tournoi */}
      {dataPlayer.res == 1 && (
        <div>
          <p>
            Vous etes en liste d'attente pour le tournoi{" "}
            {dataPlayer.tournamentName} qui est en {dataPlayer.style}
          </p>
          {/* On laisse le choix au joueur de se désinscrire avant d'etre accepté */}
          <button onClick={handleDelete}>Se retirer</button>
          <p>{responseDeinscription}</p>
        </div>
      )}
      {/* Notre demande de participation au tournoi a été accepter mais le tournoi n'a pas encore commencé */}
      {dataPlayer.res == 2 && (
        <div>
          Votre demande pour participer au tournoi {dataPlayer.tournamentName}{" "}
          qui est en {dataPlayer.style} a été accepté. Vous etes le numéro{" "}
          {dataPlayer.numero}. Le tournoi va bientot commencer
        </div>
      )}
      {/* On est en plein tournoi */}
      {dataPlayer.res == 3 && (
        <div>
          {dataPlayer.style == "arbre" && (
            <div>
              <h3>
                Vous participez au tournoi {dataPlayer.tournamentName} qui est
                en {dataPlayer.style} et vous etes {dataPlayer.style} en 1/
                {dataPlayer.class} de finale. Numero : {dataPlayer.numero}
              </h3>
              <p>
                {" "}
                {dataPlayer.idVersus
                  ? `Vous affronter ${dataPlayer.pseudoVersus} qui est le numéro
                ${dataPlayer.idVersus}`
                  : "Vous n'avez pas d'adversaire"}
              </p>
            </div>
          )}
          {dataPlayer.style == "cascade" && (
            <div>
              <h3>
                Vous participez au tournoi {dataPlayer.tournamentName} qui est
                en {dataPlayer.style} et vous etes dans le groupe{" "}
                {dataPlayer.groupe} au round {dataPlayer.round}. Numero :{" "}
                {dataPlayer.numero}
              </h3>
              <p>
                {" "}
                {dataPlayer.idVersus
                  ? `Vous affronter ${dataPlayer.pseudoVersus} qui est le numéro
                ${dataPlayer.idVersus}`
                  : "Vous n'avez pas d'adversaire"}
              </p>
              {dataPlayer.barrage == 1 && (
                <p style={{ color: "red" }}>Vous faites un barrage</p>
              )}
            </div>
          )}
        </div>
      )}
      {/* Le joueur a gagné le tournoi */}
      {dataPlayer.res == 4 && (
        <div>
          <h1>{dataPlayer.msg}</h1>
          <button onClick={handleDelete}>Quitter le tournoi</button>
          <p>{responseDeinscription}</p>
        </div>
      )}
    </div>
  );
};

export default Participant;
