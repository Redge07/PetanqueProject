import axios from "axios";
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

const Organisation = ({ player }) => {
  const [tournaments, setTournaments] = useState({ res: 0 });
  const [addTournament, setAddTournament] = useState(false);
  const recharge = () => {
    console.log(player);
    axios
      .get("http://localhost:5000/get_tournament/" + player.id)
      .then((res) => setTournaments(res.data));
  };
  useEffect(() => {
    recharge();
  }, []);

  const createTournament = async (e) => {
    e.preventDefault();
    setAddTournament(false);
    await axios.post("http://localhost:5000/create_tournament/" + player.id, {
      name: e.target.elements.name.value,
    });
    recharge();
  };

  const deleteTournament = async (value) => {
    await axios.delete("http://localhost:5000/delete_tournament/" + value);
    recharge();
  };
  return (
    <div>
      <h1>Organisateur</h1>
      {tournaments.res == 0 ? (
        <p>Vous n'avez aucun tournoi</p>
      ) : (
        <div>
          <p>Vous avez {tournaments.results.length} tournois</p>
          <ul>
            {tournaments.results.map((t) => (
              <li key={t.id}>
                <p>{t.name}</p>
                <NavLink to={"/Home/" + t.id}>Voir</NavLink>
                <button onClick={() => deleteTournament(t.id)}>
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={() => setAddTournament(true)}>Crée un tournoi</button>
      {addTournament && (
        <form onSubmit={createTournament}>
          <input
            type="text"
            minLength={3}
            name="name"
            placeholder="Nom du tournoi"
          />
          <input type="submit" value="Créer" />
          <button onClick={() => setAddTournament(false)}>Annuler</button>
        </form>
      )}
    </div>
  );
};

export default Organisation;
