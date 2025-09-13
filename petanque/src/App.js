import React, { createContext, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";

export const UsersContext = createContext();

const App = () => {
  const [login, setLogin] = useState(false);
  return (
    <UsersContext.Provider value={{ login, setLogin }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />}></Route>
          <Route path="/Home" element={<Home />}></Route>
        </Routes>
      </BrowserRouter>
    </UsersContext.Provider>
  );
};

export default App;
