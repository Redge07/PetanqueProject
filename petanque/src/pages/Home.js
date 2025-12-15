import React, { useContext, useEffect, useState } from "react";
import { UsersContext } from "../App";
import { NavLink, useNavigate } from "react-router-dom";
import Organisation from "../components/Organisation";
import Participant from "../components/Participant";

const Home = () => {
  // Je récupère le fait de savoir si je suis connecté et les informations du compte sur lequel je suis connecté
  const { login, player, setLogin, setPlayer } = useContext(UsersContext);
  // State pour savoir si je fait apparaitre les boutons pour choisir si je suis organisateur ou participant
  const [choice, setChoice] = useState(false);
  // Savoir si je suis en mode organisateur ou participant
  const [admin, setAdmin] = useState(false);
  const navigate = useNavigate();
  // Fonction pour me déconnecter et je repars au composant "Login" qui représente l'URL "/"
  const handleDisconnect = () => {
    setLogin(false);
    navigate("/");
  };
  // useEffect(() => {
  //   setLogin(true);
  //   setPlayer({ player: { id: 1, pseudo: "Régis" } });
  // }, []);
  if (!login) {
    return (
      <div>
        <p>Vous n'etes pas connecté car votre id est {player.res}</p>
        <NavLink to={"/"}>Se connecter</NavLink>
      </div>
    );
  }
  return (
    <div>
      <h1>Home !!</h1>
      <p>Bonjour {player.player.pseudo}</p>
      {/* Si je fait apparaitre les 2 boutons pour choisir le mode organisateur ou participant */}
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
      {/* Quand j'ai fait le choix de organisateur ou participant, j'affiche le composant que j'ai choisi, donc organisateur ou participant */}
      {choice ? (
        admin ? (
          <Organisation player={player.player} />
        ) : (
          <Participant player={player.player} />
        )
      ) : null}
      {/* Si j'ai deja fait mon choix c'est que je suis en mode participant ou organisateur, alors je fais apparaitre un bouton pour revenir en arriere donc au moment ou je fais le choix de organisateur ou participant */}
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
