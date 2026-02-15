import React, { createContext, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Tournament from "./pages/Tournament";
import Loading from "./constants/Loading";
import Verify from "./pages/Verify";

export const UsersContext = createContext();

const App = () => {
  const [player, setPlayer] = useState({ res: 0 });
  const [load, setLoad] = useState(false);
  return (
    <UsersContext.Provider value={{ player, setPlayer, setLoad }}>
      {load && <Loading />}
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
