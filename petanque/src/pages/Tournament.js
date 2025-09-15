import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UsersContext } from "../App";
import axios from "axios";

const Tournament = () => {
  const { idTournament } = useParams();
  const { login, setLogin, setPlayer } = useContext(UsersContext);
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
  const handleAddPlayer = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/add_player/" + idTournament, {
      pseudo: e.target.elements.pseudo.value,
    });
    recharge();
  };
  const recharge = () => {
    axios
      .get("http://localhost:5000/get_players/" + idTournament)
      .then((res) => setListPlayers(res.data));
  };
  useEffect(() => {
    recharge();
  }, []);
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
      <form onSubmit={handleAddPlayer}>
        <input type="text" name="pseudo" placeholder="Le pseudo du joueur..." />
        <input type="submit" value="Ajouter" />
      </form>
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
    </div>
  );
};

export default Tournament;
