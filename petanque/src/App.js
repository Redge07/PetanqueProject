import React, { createContext, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Tournament from "./pages/Tournament";

export const UsersContext = createContext();

const App = () => {
  const [login, setLogin] = useState(false);
  const [player, setPlayer] = useState({ res: 0 });
  return (
    <UsersContext.Provider value={{ login, setLogin, player, setPlayer }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />}></Route>
          <Route path="/Home" element={<Home />}></Route>
          <Route path="/Home/:idTournament" element={<Tournament />}></Route>
        </Routes>
      </BrowserRouter>
    </UsersContext.Provider>
  );
};

export default App;
