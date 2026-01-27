import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { UsersContext } from "../App";
import { useNavigate } from "react-router-dom";
import { linkBackend } from "../constants/LinkBackend";

const Login = () => {
  const navigate = useNavigate();
  const { setLogin, setPlayer, setLoad } = useContext(UsersContext);
  const [res, setRes] = useState({ res: "en attente" });
  const handleSignUp = (e) => {
    setLoad(true);
    e.preventDefault();
    const user = {
      pseudo: e.target.elements.pseudo.value,
      password: e.target.elements.password.value,
    };
    axios
      .post(linkBackend + "log/inscription", user)
      .then((res) => {
        setRes(res.data);
        if (res.data.res == 1) {
          setTimeout(() => {
            chargeHome(res.data);
          }, 1000);
        }
      })
      .catch((err) => {
        console.log(err.response.data);
      })
      .finally(() => setLoad(false));
  };
  const handleSignIn = (e) => {
    setLoad(true);
    e.preventDefault();
    const user = {
      pseudo: e.target.elements.pseudo.value,
      password: e.target.elements.password.value,
    };
    axios
      .post(linkBackend + "log/connexion", user)
      .then((res) => {
        setRes(res.data);
        if (res.data.res == 1) {
          setTimeout(() => {
            chargeHome(res.data);
          }, 1000);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setTimeout(() => {
          setLoad(false);
        }, 1000);
      });
  };

  const chargeHome = (value) => {
    setLogin(true);
    setPlayer(value);
    navigate("/Home");
  };
  return (
    <div>
      <h1>Connexion</h1>
      <form onSubmit={handleSignIn}>
        <input type="text" name="pseudo" placeholder="Votre pseudo..." />
        <input
          type="text"
          name="password"
          placeholder="Votre mot de passe..."
        />
        <input type="submit" value="Connexion" />
      </form>
      <h1>Inscription</h1>
      <form onSubmit={handleSignUp}>
        <input type="text" name="pseudo" placeholder="Votre pseudo..." />
        <input
          type="text"
          name="password"
          placeholder="Votre mot de passe..."
        />
        <input type="submit" value="Inscription" />
      </form>
      <p>{res.res}</p>
    </div>
  );
};

export default Login;
