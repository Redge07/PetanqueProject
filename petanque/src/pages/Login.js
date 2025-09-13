import React, { useContext, useState } from "react";
import axios from "axios";
import { UsersContext } from "../App";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const { login, setLogin } = useContext(UsersContext);
  const [res, setRes] = useState("");
  const handleSignUp = (e) => {
    e.preventDefault();
    const user = {
      pseudo: e.target.elements.pseudo.value,
      password: e.target.elements.password.value,
    };
    axios
      .post("http://localhost:5000/inscription", user)
      .then((res) => setRes(res.data));
  };
  const handleSignIn = (e) => {
    e.preventDefault();
    const user = {
      pseudo: e.target.elements.pseudo.value,
      password: e.target.elements.password.value,
    };
    axios.post("http://localhost:5000/connexion", user).then((res) => {
      setRes(res.data);
      chargeHome();
    });
  };

  const chargeHome = () => {
    setLogin(true);
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
      <p>{res}</p>
    </div>
  );
};

export default Login;
