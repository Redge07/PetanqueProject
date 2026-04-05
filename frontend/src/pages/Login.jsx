import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { UsersContext } from "../App";
import { useNavigate } from "react-router-dom";
import { linkBackend } from "../constants/LinkBackend";

const Login = () => {
  const navigate = useNavigate();
  // Variable pour savoir quel user est connecté au niveau du frontend
  // Variable pour afficher le chargement d'une API
  // Variable pour afficher le fait qu'il y a eu une erreur lors d'une requete a une API
  const { setPlayer, setLoad, setError } = useContext(UsersContext);
  const [res, setRes] = useState("en attente");
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
    <div>
      <h1>Connexion</h1>
      <form onSubmit={handleSignIn}>
        <input type="text" name="email" placeholder="Votre email..." />
        <input
          type="text"
          name="password"
          placeholder="Votre mot de passe..."
        />
        <input type="submit" value="Connexion" />
      </form>
      <h1>Inscription</h1>
      <form onSubmit={handleSignUp}>
        <input type="text" name="email" placeholder="Votre email..." />
        <input type="text" name="pseudo" placeholder="Votre pseudo..." />
        <input
          type="text"
          name="password"
          placeholder="Votre mot de passe..."
        />
        <input type="submit" value="Inscription" />
      </form>
      <p>{res}</p>
      <div id="googleBtn"></div>
    </div>
  );
};

export default Login;
