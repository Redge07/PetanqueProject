import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { UsersContext } from "../App";
import { NavLink, useNavigate } from "react-router-dom";
import { linkBackend } from "../constants/LinkBackend";
import { Trophy } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  // Variable pour savoir quel user est connecté au niveau du frontend
  // Variable pour afficher le chargement d'une API
  // Variable pour afficher le fait qu'il y a eu une erreur lors d'une requete a une API
  const { setPlayer, setLoad, setError } = useContext(UsersContext);
  const [res, setRes] = useState("");
  // State pour gérer l'onglet actif (connexion ou inscription)
  const [activeTab, setActiveTab] = useState("connexion");

  // Fonction pour récupérer la position du PC avec lequel s'est connecté un utilisateur
  const getLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation non supportée");
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      }
    });

  // Fonction quand un utilisateur souhaite créer un compte
  const handleSignUp = async (e) => {
    setLoad(true);
    e.preventDefault();
    const user = {
      email: e.target.elements.email.value,
      pseudo: e.target.elements.pseudo.value,
      password: e.target.elements.password.value,
    };
    try {
      const res = await axios.post(linkBackend + "log/inscription", user);
      // Affiche le message si l'inscription s'est bien passée ou pas
      setRes(res.data.message);
    } catch (err) {
      setError(true);
      console.log(err);
    } finally {
      setTimeout(() => {
        setLoad(false);
      }, 1000);
    }
  };

  // Fonction quand un utilisateur souhaite se connecter
  const handleSignIn = async (e) => {
    setLoad(true);
    e.preventDefault();
    const user = {
      email: e.target.elements.email.value,
      password: e.target.elements.password.value,
    };
    try {
      const res = await axios.post(linkBackend + "log/connexion", user);
      setRes(res.data.message);
      // Si les infos de connexion sont bon
      if (res.data.res == 1) {
        let latitude = null;
        let longitude = null;
        // L'API a renvoyé le token  de connexion et on va le stocker dans le localStorage pour que l'utilisateur puisse rester connecté même après avoir fermé la page
        localStorage.setItem("token", res.data.token);
        try {
          // On désigne la position du PC si on peut
          const position = await getLocation();
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        } catch (err) {
          console.log("Pas de géoloc");
        }
        // On envoie la position du PC et le token de notifications pour que l'API puisse les stocker et les utiliser plus tard pour envoyer des notifications ou afficher la position des joueurs sur une carte
        await axios.post(linkBackend + "log/register", {
          token: null,
          id: res.data.user.id,
          longitude: longitude,
          latitude: latitude,
        });
        setRes(res.data.message);
        setTimeout(() => {
          chargeHome(res.data.user);
        }, 1000);
      }
    } catch (err) {
      setError(true);
      console.log(err);
    } finally {
      setTimeout(() => {
        setLoad(false);
      }, 1000);
    }
  };

  const handleCredentialResponse = async (response) => {
    console.log(response);
    setLoad(true);
    try {
      const res = await axios.post(linkBackend + "log/google", {
        tokenGoogle: response.credential,
      });
      setRes(res.data.message);
      // Si les infos de connexion sont bon
      if (res.data.res == 1) {
        let latitude = null;
        let longitude = null;
        // L'API a renvoyé le token  de connexion et on va le stocker dans le localStorage pour que l'utilisateur puisse rester connecté même après avoir fermé la page
        localStorage.setItem("token", res.data.token);
        try {
          // On désigne la position du PC si on peut
          const position = await getLocation();
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        } catch (err) {
          console.log("Pas de géoloc");
        }
        // On envoie la position du PC et le token de notifications pour que l'API puisse les stocker et les utiliser plus tard pour envoyer des notifications ou afficher la position des joueurs sur une carte
        await axios.post(linkBackend + "log/register", {
          token: null,
          id: res.data.user.id,
          longitude: longitude,
          latitude: latitude,
        });
        setRes(res.data.message);
        setTimeout(() => {
          chargeHome(res.data.user);
        }, 1000);
      }
    } catch (err) {
      setError(true);
      console.log(err);
    } finally {
      setTimeout(() => {
        setLoad(false);
      }, 1000);
    }
  };

  useEffect(() => {
    if (!window.google) return;
    window.google.accounts.id.initialize({
      client_id:
        "420341218128-0tlbi05tqb2p6g8s6ar1s5rjgisvu5ud.apps.googleusercontent.com",
      callback: handleCredentialResponse,
    });
    window.google.accounts.id.renderButton(
      document.getElementById("googleBtn"),
      { theme: "outline", size: "large" },
    );
  }, []);

  // Fonction pour aller a la page d'acceuil et stocker le user connecté dans le contexte pour pouvoir l'utiliser dans les autres pages du site
  const chargeHome = (value) => {
    setPlayer(value);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-bg-mid)] to-[var(--color-bg-dark)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-2xl shadow-xl mb-4">
            <Trophy className="w-10 h-10 text-[var(--color-gold)]" />
          </div>
          <h1 className="text-3xl font-light text-[var(--color-primary)] tracking-wide">
            Pétanque<span className="font-semibold">Manager</span>
          </h1>
          <p className="text-[var(--color-gray)] mt-2 text-sm tracking-wide">
            Gérez vos tournois avec élégance
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8">
          {/* Onglets connexion / inscription */}
          <div className="flex rounded-xl bg-[var(--color-bg-mid)] p-1 mb-6">
            <button
              onClick={() => {
                setActiveTab("connexion");
                setRes("");
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === "connexion" ? "bg-white text-[var(--color-primary)] shadow-sm" : "text-[var(--color-gray)]"}`}
            >
              Connexion
            </button>
            <button
              onClick={() => {
                setActiveTab("inscription");
                setRes("");
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === "inscription" ? "bg-white text-[var(--color-primary)] shadow-sm" : "text-[var(--color-gray)]"}`}
            >
              Inscription
            </button>
          </div>

          {/* Formulaire Connexion */}
          {activeTab === "connexion" && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <input
                type="text"
                name="email"
                placeholder="Votre email..."
                className="w-full h-12 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 text-[var(--color-primary)] placeholder-[var(--color-gray-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
              <input
                type="password"
                name="password"
                placeholder="Votre mot de passe..."
                className="w-full h-12 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 text-[var(--color-primary)] placeholder-[var(--color-gray-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
              <input
                type="submit"
                value="Connexion"
                className="w-full h-12 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white rounded-xl font-medium tracking-wide shadow-lg cursor-pointer hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-all duration-300"
              />
              <NavLink
                to="/forgot-password"
                className="block text-center text-sm text-[var(--color-gray)] hover:text-[var(--color-primary)] transition-colors"
              >
                Mot de passe oublié ?
              </NavLink>
            </form>
          )}

          {/* Formulaire Inscription */}
          {activeTab === "inscription" && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <input
                type="text"
                name="email"
                placeholder="Votre email..."
                className="w-full h-12 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 text-[var(--color-primary)] placeholder-[var(--color-gray-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
              <input
                type="text"
                name="pseudo"
                placeholder="Votre pseudo..."
                className="w-full h-12 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 text-[var(--color-primary)] placeholder-[var(--color-gray-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
              <input
                type="password"
                name="password"
                placeholder="Votre mot de passe..."
                className="w-full h-12 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 text-[var(--color-primary)] placeholder-[var(--color-gray-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
              <input
                type="submit"
                value="Créer mon compte"
                className="w-full h-12 bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white rounded-xl font-medium tracking-wide shadow-lg cursor-pointer hover:opacity-90 transition-all duration-300"
              />
            </form>
          )}

          {/* Message retour API */}
          {res && (
            <p className="mt-4 text-center text-sm text-[var(--color-primary)] bg-[var(--color-bg-mid)] rounded-xl p-3 border border-[var(--color-gold)]/20">
              {res}
            </p>
          )}

          {/* Séparateur et bouton Google */}
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-[var(--color-border)]"></div>
              <span className="text-sm text-[var(--color-gray-light)]">ou</span>
              <div className="flex-1 h-px bg-[var(--color-border)]"></div>
            </div>
            <div id="googleBtn" className="flex justify-center"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
