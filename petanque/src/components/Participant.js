import axios from "axios";
import React, { useEffect, useState } from "react";

const Participant = ({ player }) => {
  const [tournament, setTournament] = useState({});
  const [tournamentActuel, setTournamentActuel] = useState({ res: 0 });
  const [formulaire, setFormulaire] = useState(false);
  const [idTournament, setIdTournament] = useState();
  const [resForm, setResForm] = useState("");
  const [searchTournament, setSearchTournament] = useState(true);
  const handleSearch = (e) => {
    e.preventDefault();
    axios
      .get(
        "http://localhost:5000/get_tournament_players/" +
          e.target.elements.tournoi.value
      )
      .then((res) => {
        setTournament(res.data);
      });
  };

  const handleInscrire = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:5000/add_player/" + idTournament, {
        pseudo: e.target.elements.pseudo.value,
        iduser: player.id,
      })
      .then((res) => {
        setResForm(res.data);
        if (res.data.res == 1) {
          recharge();
        }
      });
  };

  const recharge = () => {
    axios
      .get("http://localhost:5000/get_tournament_user/" + player.id)
      .then((res) => {
        setTournamentActuel(res.data);
        if (res.data.res == 1) {
          setSearchTournament(false);
        } else {
          setSearchTournament(true);
        }
      });
  };

  useEffect(() => {
    recharge();
  }, []);

  return (
    <div>
      <h1>Participant</h1>
      {searchTournament && (
        <div>
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
          <p>{resForm.msg}</p>
        </div>
      )}
      {tournamentActuel.res == 0 ? (
        <p>Vous ne participez a aucun tournoi actuellement</p>
      ) : (
        <div>{tournamentActuel.results.name}</div>
      )}
    </div>
  );
};

export default Participant;
