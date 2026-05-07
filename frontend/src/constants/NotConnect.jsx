import React from "react";
import { NavLink } from "react-router-dom";
import { Trophy } from "lucide-react";

const NotConnect = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-bg-mid)] to-[var(--color-bg-dark)] flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl text-center max-w-sm w-full">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-2xl shadow-xl mb-4">
          <Trophy className="w-8 h-8 text-[var(--color-gold)]" />
        </div>
        <p className="text-[var(--color-gray)] mb-6">
          Vous n'êtes pas connecté
        </p>
        <NavLink
          to={"/Login"}
          className="block w-full h-12 leading-[3rem] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white rounded-xl font-medium tracking-wide shadow-lg hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-all duration-300"
        >
          Se connecter
        </NavLink>
      </div>
    </div>
  );
};

export default NotConnect;
