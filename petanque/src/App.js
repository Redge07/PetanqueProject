import React, { createContext, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Tournament from "./pages/Tournament";
import Loading from "./constants/Loading";
import Verify from "./pages/Verify";
import axios from "axios";
import { linkBackend } from "./constants/LinkBackend";

export const UsersContext = createContext();

const App = () => {
  // State pour savoir quel utilisateur est connecté, pour afficher le chargement d'une API et pour afficher une erreur si il y en a une lors d'une requete a une API
  const [player, setPlayer] = useState(null);
  const [load, setLoad] = useState(false);
  const [error, setError] = useState(false);
  // UseEffect pour vérifier si on a un token valide pour essayé de se connecter a la page sans passer par le formulaire de connexion classique
  useEffect(() => {
    setLoad(true);
    const verifToken = async () => {
      // On récupère le token stocké en localStorage pour le faire validé a l'API
      const token = localStorage.getItem("token");
      try {
        const tokenIsValid = await axios.post(linkBackend + "log/verifToken", {
          token,
        });
        // Si le token est valide, super on peut se connecter normalement
        setPlayer(tokenIsValid.data.user);
        // Sinon le token est invalide
      } catch (err) {
        console.log(err);
        localStorage.removeItem("token");
      } finally {
        setLoad(false);
      }
    };
    verifToken();
  }, []);
  return (
    <UsersContext.Provider value={{ player, setPlayer, setLoad, setError }}>
      {load && <Loading />}
      {error && (
        <div className="error">
          <p>Une erreur est survenue</p>
          <button onClick={() => setError(false)}>Réessayer</button>
        </div>
      )}
      <BrowserRouter>
        <Routes>
          <Route path="/Login" element={<Login />}></Route>
          <Route path="/" element={<Home />}></Route>
          <Route path="/:idTournament" element={<Tournament />}></Route>
          <Route path="/verify/:token" element={<Verify />}></Route>
        </Routes>
      </BrowserRouter>
    </UsersContext.Provider>
  );
};

export default App;
