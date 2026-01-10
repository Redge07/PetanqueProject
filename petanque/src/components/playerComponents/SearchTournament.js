import axios from "axios";
import React, { useState } from "react";
import { linkBackend } from "../../constants/LinkBackend";

const SearchTournament = ({ player, recharge }) => {
  // State qui va récupérer le tournoi qui a été chercher dans la barre de recherche pour vouloir s'inscrire a un tournoi, -1 par défaut pour dire que aucune recherche n'a été essayer, 0 pour dire que le résultat de la recherche n'a pas trouvé de tournoi correspondant a cette id, 1 a trouver un tournoi qui correspond a cette id et 2 qui dit que le tournoi a été trouver mais a deja commencé
  const [dataTournament, setDataTournament] = useState({ res: -1 });
  // Récupérer un petit message pour dire que l'utilisateur a bien été inscrit au tournoi
  const [responseInscription, setResponseInscription] = useState("");
  // Fonction pour récupérer le tournoi trouver grace a la recherche (quand on veut trouver un tournoi pour s'inscrire)
  const handleSearch = (e) => {
    e.preventDefault();
    const idSearch = e.target.elements.id.value;
    console.log(idSearch);
    axios.get(linkBackend + "players/search/" + idSearch).then((res) => {
      console.log(res.data);
      setDataTournament(res.data);
    });
  };
  // Fonction pour s'inscrire a un tournoi
  const handleInscrire = (e) => {
    e.preventDefault();
    const pseudo = e.target.elements.pseudo.value;
    axios
      .post(linkBackend + "players/", {
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
  return (
    <div className="composant" style={{ border: "solid 2px red" }}>
      <h4 style={{ color: "red" }}>Composant pour rechercher un tournoi</h4>
      <p>Vous ne participez à aucun tournoi</p>
      <form onSubmit={handleSearch}>
        <input
          type="number"
          name="id"
          placeholder="Rechercher un tournoi avec son id..."
          required
        />
        <input type="submit" value="Chercher" />
      </form>
      {/* Après avoir cherché un tournoi, l'id ne correspond a aucun tournoi */}
      {dataTournament.res == 0 && <p>Cette id ne correspond à aucun tournoi</p>}
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
              required
            />
            <input type="submit" value="S'inscrire" />
          </form>
          <p>{responseInscription}</p>
        </div>
      )}
      {/* On a trouvé un tournoi mais il a deja commencé donc on ne peut pas s'inscrire */}
      {dataTournament.res == 2 && (
        <p>
          Le tournoi {dataTournament.name} à déja commencé, vous ne pouvez pas y
          participer
        </p>
      )}
    </div>
  );
};

export default SearchTournament;
