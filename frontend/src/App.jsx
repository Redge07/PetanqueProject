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
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import PublicTournament from "./pages/PublicTournament";
import MentionsLegales from "./pages/legal/MentionsLegales";
import Confidentialite from "./pages/legal/Confidentialite";
import CGU from "./pages/legal/CGU";
import CookieBanner from "./components/ui/CookieBanner";

export const UsersContext = createContext();

const App = () => {
  const [player, setPlayer] = useState(null);
  const [load, setLoad] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoad(true);
    const verifToken = async () => {
      const token = localStorage.getItem("token");
      try {
        const tokenIsValid = await axios.post(linkBackend + "log/verifToken", {
          token,
        });
        setPlayer(tokenIsValid.data.user);
      } catch {
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
        <CookieBanner />
        <Routes>
          <Route path="/Login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/confidentialite" element={<Confidentialite />} />
          <Route path="/cgu" element={<CGU />} />
          <Route path="/public/:idTournament" element={<PublicTournament />} />
          <Route path="/verify/:token" element={<Verify />} />
          <Route path="/success" element={<SuccessPayement />} />
          <Route path="/cancel" element={<CancelPayement />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/:idTournament" element={<Tournament />} />
        </Routes>
      </BrowserRouter>
    </UsersContext.Provider>
  );
};

export default App;
