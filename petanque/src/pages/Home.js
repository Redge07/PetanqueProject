import React, { useContext, useEffect, useState } from "react";
import { UsersContext } from "../App";
import { NavLink, useNavigate } from "react-router-dom";
import Organisation from "../components/Organisation";
import Participant from "../components/Participant";

const Home = () => {
  const { login, player, setLogin, setPlayer } = useContext(UsersContext);
  const [choice, setChoice] = useState(false);
  const [admin, setAdmin] = useState(false);
  const navigate = useNavigate();
  const handleDisconnect = () => {
    setLogin(false);
    navigate("/");
  };
  // useEffect(() => {
  //   setLogin(true);
  //   setPlayer({ player: { id: 6, pseudo: "Admin" } });
  // }, []);
  if (!login) {
    return (
      <div>
        <p>Vous n'etes pas connecté car votre id est {player.res}</p>
        <NavLink to={"/"}>Se connecter</NavLink>
      </div>
    );
  } else {
  }
  return (
    <div>
      <h1>Home</h1>
      <p>Bonjour {player.player.pseudo}</p>
      {!choice && (
        <div>
          <button
            onClick={() => {
              setAdmin(true);
              setChoice(true);
            }}
          >
            Je suis organisateur
          </button>
          <br></br>
          <button
            onClick={() => {
              setChoice(true);
            }}
          >
            Je suis participant
          </button>
        </div>
      )}
      {choice ? (
        admin ? (
          <Organisation player={player.player} />
        ) : (
          <Participant player={player.player} />
        )
      ) : null}
      {choice ? (
        <button
          onClick={() => {
            setChoice(false);
            setAdmin(false);
          }}
        >
          Retour au choix
        </button>
      ) : null}
      <br></br>
      <button onClick={handleDisconnect}>Se déconnecter</button>
    </div>
  );
};

export default Home;
