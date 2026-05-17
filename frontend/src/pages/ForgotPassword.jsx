import React, { useContext, useState } from "react";
import axios from "axios";
import { linkBackend } from "../constants/LinkBackend";
import { Mail, Trophy } from "lucide-react";
import { UsersContext } from "../App";

const ForgotPassword = () => {
  const { setLoad, setError } = useContext(UsersContext);
  const [res, setRes] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoad(true);
    try {
      const response = await axios.post(linkBackend + "log/forgot-password", {
        email: e.target.elements.email.value,
      });
      setRes(response.data.message);
    } catch (err) {
      console.log(err);
      setError(true);
    } finally {
      setLoad(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-bg-mid)] to-[var(--color-bg-dark)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-2xl shadow-xl mb-4">
            <Trophy className="w-10 h-10 text-[var(--color-gold)]" />
          </div>
          <h1 className="text-3xl font-light text-[var(--color-primary)] tracking-wide">
            Pétanque<span className="font-semibold">Manager</span>
          </h1>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8">
          <h2 className="text-lg font-semibold text-[var(--color-primary)] mb-2">
            Mot de passe oublié
          </h2>
          <p className="text-sm text-[var(--color-gray)] mb-6">
            Entrez votre email et nous vous enverrons un lien pour réinitialiser
            votre mot de passe
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-gray-light)]" />
              <input
                type="email"
                name="email"
                placeholder="Votre email..."
                required
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 text-[var(--color-primary)] placeholder-[var(--color-gray-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>
            <input
              type="submit"
              value="Envoyer le lien"
              className="w-full h-12 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white rounded-xl font-medium tracking-wide shadow-lg cursor-pointer hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-all duration-300"
            />
          </form>
          {res && (
            <p className="mt-4 text-center text-sm text-[var(--color-primary)] bg-[var(--color-bg-mid)] rounded-xl p-3 border border-[var(--color-gold)]/20">
              {res}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
