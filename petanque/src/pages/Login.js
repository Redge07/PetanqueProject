import React, { useContext, useState } from "react";
import axios from "axios";
import { UsersContext } from "../App";
import { useNavigate } from "react-router-dom";
import { linkBackend } from "../constants/LinkBackend";

const Login = () => {
  const navigate = useNavigate();
  const { setPlayer, setLoad } = useContext(UsersContext);
  const [res, setRes] = useState("en attente");
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
      setRes(res.data.message);
    } catch (err) {
      console.log(err);
    } finally {
      setTimeout(() => {
        setLoad(false);
      }, 1000);
    }
  };
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
      if (res.data.res == 1) {
        let latitude = null;
        let longitude = null;
        localStorage.setItem("token", res.data.token);
        try {
          const position = await getLocation();
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        } catch (err) {
          console.log("Pas de géoloc");
        }
        await axios.post(linkBackend + "log/register", {
          token: null,
          id: res.data.player.id,
          longitude: longitude,
          latitude: latitude,
        });
        setTimeout(() => {
          chargeHome(res.data);
        }, 1000);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setTimeout(() => {
        setLoad(false);
      }, 1000);
    }
  };

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
    </div>
  );
};

export default Login;
