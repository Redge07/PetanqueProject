import axios from "axios";
import React, { useState } from "react";

const Participant = ({ player }) => {
  const [tournament, setTournament] = useState({});
  const [formulaire, setFormulaire] = useState(false);
  const [idTournament, setIdTournament] = useState();
  const handleSearch = (e) => {
    e.preventDefault();
    axios
      .get(
        "http://localhost:5000/get_tournament_players/" +
          e.target.elements.tournoi.value
      )
      .then((res) => {
        console.log(res.data);
        setTournament(res.data);
      });
  };

  const handleInscrire = (e) => {
    e.preventDefault();
    axios.post("http://localhost:5000/add_player/" + idTournament, {
      pseudo: e.target.elements.pseudo.value,
      iduser: player.id,
    });
  };

  return (
    <div>
      <h1>Participant</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          name="tournoi"
          placeholder="Entrer l'id du tournoi..."
        />
        <input type="submit" value="Chercher" />
      </form>
      {tournament.res == 1 && (
        <ul>
          <li>{tournament.results[0].name}</li>
          <button
            onClick={() => {
              setFormulaire(true);
              setIdTournament(tournament.results[0].id);
            }}
          >
            Participer
          </button>
        </ul>
      )}
      {tournament.res == 0 && (
        <p>Aucun tournoi ne correspond a cette identifiant</p>
      )}
      {formulaire && (
        <form onSubmit={handleInscrire}>
          <input
            type="text"
            minLength="3"
            placeholder="Entrez votre pseudo..."
            name="pseudo"
          />
          <input type="submit" value={"S'inscrire"} />
          <button onClick={() => setFormulaire(false)}>Stop</button>
        </form>
      )}
    </div>
  );
};

export default Participant;
