import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { linkBackend } from "../constants/LinkBackend";
import { UsersContext } from "../App";
import Map from "./tournamentComponents/Map";

const Organisation = ({ player }) => {
  // State qui contiendra les tournoi que gère ce compte en question
  const [tournaments, setTournaments] = useState({ res: 0 });
  // State qui gère l'apparition du formulaire pour crée un tournoi pour le joueur connecté
  const [addTournament, setAddTournament] = useState(false);
  const { setLoad } = useContext(UsersContext);
  // Fonction qui récupère les tournoi que gère le joueur
  const recharge = () => {
    setLoad(true);
    console.log(player);
    axios
      .get(linkBackend + "organisateurs/" + player.id)
      .then((res) => setTournaments(res.data))
      .finally(() => setLoad(false));
  };
  useEffect(() => {
    recharge();
  }, []);

  // Fonction qui crée un nouveau tournoi pour le joueur connecté
  const createTournament = async (e) => {
    e.preventDefault();
    setAddTournament(false);
    await axios.post(linkBackend + "organisateurs/" + player.id, {
      name: e.target.elements.name.value,
      style: e.target.elements.style_tournament.value,
    });
    recharge();
  };

  // Fonction qui supprime un tournoi
  const deleteTournament = async (value) => {
    await axios.delete(linkBackend + "organisateurs/" + value);
    recharge();
  };
  return (
    <div>
      <h1>Organisateur</h1>
      {/* Si l'api qui renvoie les tournoi a res = 0 ca veut dire que le joueur en question ne gère pas de tournoi */}
      {tournaments.res == 0 ? (
        <p>Vous n'avez aucun tournoi</p>
      ) : (
        // Si le joueur gère bien des tournois, alors on map les tournoi contenu dans tournament avec la clé "résults"
        <div>
          <p>Vous avez {tournaments.results.length} tournois</p>
          <ul>
            {tournaments.results.map((t) => (
              <li key={t.id}>
                <p>
                  {t.name} {t.style}
                </p>
                <NavLink to={"/Home/" + t.id}>Voir</NavLink>
                {/* Bouton pour supprimer ce tournoi précis qui apparait avec le map */}
                <button onClick={() => deleteTournament(t.id)}>
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Bouton qui fait apparaitre le formulaire pour pouvoir crée un tournoi */}
      <button onClick={() => setAddTournament(true)}>Crée un tournoi</button>
      {/* Si le state qui gère l'apparition du formulaire pour créer un tournoi est a true, alors le formulaire apparait */}
      {addTournament && (
        <form onSubmit={createTournament}>
          <input
            type="text"
            minLength={3}
            name="name"
            placeholder="Nom du tournoi"
          />
          <select name="style_tournament">
            <option value="arbre">Arbre</option>
            <option value="cascade">Cascade</option>
            <option value="classement">Classement</option>
          </select>
          <input type="submit" value="Créer" />
          {/* Bouton pour annuler le fait de créer un tournoi et donc reppasser le state "addTournament" a false */}
          <button onClick={() => setAddTournament(false)}>Annuler</button>
        </form>
      )}
      <Map />
    </div>
  );
};

export default Organisation;
