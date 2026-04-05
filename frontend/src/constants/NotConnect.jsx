import React from "react";
import { NavLink } from "react-router-dom";

const NotConnect = () => {
  return (
    <div>
      <p>Vous n'etes pas connectés</p>
      <NavLink to={"/Login"}>Se connecter</NavLink>
    </div>
  );
};

export default NotConnect;
