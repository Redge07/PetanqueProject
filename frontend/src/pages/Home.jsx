import React, { useContext, useState } from "react";
import { UsersContext } from "../App";
import { NavLink, useNavigate } from "react-router-dom";
import Organisation from "../components/Organisation";
import Participant from "../components/Participant";
import NotConnect from "../constants/NotConnect";
import { Trophy, Crown, Target, LogOut, ChevronLeft } from "lucide-react";

const Home = () => {
  // Je récupère le fait de savoir si je suis connecté et les informations du compte sur lequel je suis connecté
  const { player } = useContext(UsersContext);
  // State pour savoir si je fait apparaitre les boutons pour choisir si je suis organisateur ou participant
  const [choice, setChoice] = useState(false);
  // Savoir si je suis en mode organisateur ou participant
  const [admin, setAdmin] = useState(false);
  const navigate = useNavigate();
  // Fonction pour me déconnecter et je repars au composant "Login" qui représente l'URL "/"
  const handleDisconnect = () => {
    localStorage.removeItem("token");
    navigate("/Login");
  };
  if (!player) return <NotConnect />;
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-bg-mid)] to-[var(--color-bg-dark)]">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-xl flex items-center justify-center shadow-lg">
              <Trophy className="w-6 h-6 text-[var(--color-gold)]" />
            </div>
            <h1 className="text-2xl font-light text-[var(--color-primary)]">
              Pétanque<span className="font-semibold">Manager</span>
            </h1>
          </div>
          <button
            onClick={handleDisconnect}
            className="flex items-center gap-2 text-[var(--color-gray)] hover:text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            Se déconnecter
          </button>
        </div>

        {/* Carte de bienvenue */}
        <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-2xl p-6 md:p-8 text-white mb-8 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[var(--color-gold)]/20 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <p className="text-[var(--color-gold)] text-sm font-medium mb-1">
              Bienvenue
            </p>
            <p className="text-3xl font-light">
              Bonjour, <span className="font-semibold">{player.pseudo}</span>
            </p>
            <p className="text-white/70 mt-1">
              Prêt à organiser ou participer à un tournoi ?
            </p>
          </div>
        </div>

        {/* Si je fait apparaitre les 2 boutons pour choisir le mode organisateur ou participant */}
        {!choice && (
          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => {
                setAdmin(true);
                setChoice(true);
              }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl text-left hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-2">
                Organisateur
              </h3>
              <p className="text-[var(--color-gray)] mb-4">
                Créez et gérez vos propres tournois de pétanque
              </p>
              <div className="flex items-center text-[var(--color-gold)] font-medium">
                <span>Accéder</span>
                <ChevronLeft className="w-5 h-5 ml-2 rotate-180 group-hover:translate-x-2 transition-transform" />
              </div>
            </button>

            <button
              onClick={() => {
                setChoice(true);
              }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl text-left hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-2">
                Participant
              </h3>
              <p className="text-[var(--color-gray)] mb-4">
                Rejoignez un tournoi et suivez vos matchs en direct
              </p>
              <div className="flex items-center text-[var(--color-primary)] font-medium">
                <span>Accéder</span>
                <ChevronLeft className="w-5 h-5 ml-2 rotate-180 group-hover:translate-x-2 transition-transform" />
              </div>
            </button>
          </div>
        )}

        {/* Quand j'ai fait le choix de organisateur ou participant, j'affiche le composant que j'ai choisi, donc organisateur ou participant */}
        {choice ? (
          admin ? (
            <Organisation player={player} />
          ) : (
            <Participant player={player} />
          )
        ) : null}

        {/* Si j'ai deja fait mon choix c'est que je suis en mode participant ou organisateur, alors je fais apparaitre un bouton pour revenir en arriere donc au moment ou je fais le choix de organisateur ou participant */}
        {choice ? (
          <button
            onClick={() => {
              setChoice(false);
              setAdmin(false);
            }}
            className="flex items-center gap-2 mt-6 text-[var(--color-gray)] hover:text-[var(--color-primary)] hover:bg-white/50 px-4 py-2 rounded-xl transition-all duration-300"
          >
            <ChevronLeft className="w-5 h-5" />
            Retour au choix
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default Home;
