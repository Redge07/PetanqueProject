import React, { createContext, useEffect, useState } from "react";
import "./styles/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Tournament from "./pages/Tournament";
import Loading from "./constants/Loading";
import Verify from "./pages/Verify";
import axios from "axios";
import { linkBackend } from "./constants/LinkBackend";
import SuccessPayement from "./pages/SuccessPayement";
import CancelPayement from "./pages/CancelPayement";

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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm w-full mx-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-lg font-semibold text-[var(--color-primary)] mb-2">
              Une erreur est survenue
            </h2>
            <p className="text-[var(--color-gray)] text-sm mb-6">
              Veuillez réessayer ou recharger la page
            </p>
            <button
              onClick={() => setError(false)}
              className="w-full h-12 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white rounded-xl font-medium hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-all duration-300"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}
      <BrowserRouter>
        <Routes>
          <Route path="/Login" element={<Login />}></Route>
          <Route path="/" element={<Home />}></Route>
          <Route path="/:idTournament" element={<Tournament />}></Route>
          <Route path="/verify/:token" element={<Verify />}></Route>
          <Route path="/verify/:token" element={<Verify />}></Route>
          <Route path="/success" element={<SuccessPayement />}></Route>
          <Route path="/cancel" element={<CancelPayement />}></Route>
        </Routes>
      </BrowserRouter>
    </UsersContext.Provider>
  );
};

export default App;
