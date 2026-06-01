import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { linkBackend } from "../constants/LinkBackend";
import SearchTournament from "./playerComponents/SearchTournament";
import DirectTournament from "./playerComponents/DirectTournament";
import { UsersContext } from "../App";
import { RefreshCw, Clock, CheckCircle, Trophy } from "lucide-react";
import { getFormatLabel } from "../utils/formatLabels";

const Participant = ({ player }) => {
  // State qui va récupérer la situation de l'utilisateur sous sa forme de "player", il sera soit inscrit a aucun tournoi, soit en attente, soit accepté, soit le tournoi a commencé et il n'a aucun adversaire, soit il a un adversaire
  const [dataPlayer, setDataPlayer] = useState({ res: 0 });
  const { setLoad, setError } = useContext(UsersContext);

  // Récupérer un petit message pour dire que l'utilisateur a bien été désinscrit du tournoi
  const [responseDeinscription, setResponseDeinscription] = useState("");

  // Quand on s'est inscrit a un tournoi mais on n'est en attente et on veut se désinscrire
  const handleDelete = async () => {
    setLoad(true);
    try {
      const res = await axios.delete(linkBackend + "players/" + player.id);
      setResponseDeinscription(res.data.res);
    } catch (err) {
      setError(true);

    } finally {
      recharge();
    }
  };

  // Fonction qui recharge la page, on récupère la situation du joueur bien mise a jour
  const recharge = async () => {
    setLoad(true);
    setResponseDeinscription("");
    try {
      const res = await axios.get(linkBackend + "players/" + player.id);
      setDataPlayer(res.data);
    } catch (err) {
      setError(true);

    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    recharge();
  }, []);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[var(--color-primary)]">
          Participant
        </h2>
        <button
          onClick={recharge}
          className="flex items-center gap-2 text-[var(--color-gray)] hover:text-[var(--color-primary)] hover:bg-white/50 px-4 py-2 rounded-xl transition-all duration-300"
        >
          <RefreshCw className="w-4 h-4" />
          Recharger
        </button>
      </div>

      {/* Si le joueur n'est lier a aucun tournoi, on propose une barre de recherche */}
      {dataPlayer.res == 0 && (
        <SearchTournament player={player} recharge={recharge} />
      )}

      {/* Le joueur est actuellement en attente d'acceptation d'un tournoi */}
      {dataPlayer.res == 1 && (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[var(--color-gold)]/20 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-[var(--color-gold)]" />
            </div>
            <h3 className="font-semibold text-[var(--color-primary)]">
              En attente
            </h3>
          </div>
          <p className="text-[var(--color-gray)] mb-6">
            Vous êtes en liste d'attente pour le concours{" "}
            <span className="font-semibold text-[var(--color-primary)]">
              {dataPlayer.tournamentName}
            </span>{" "}
            en {getFormatLabel(dataPlayer.style)}
          </p>
          {/* On laisse le choix au joueur de se désinscrire avant d'etre accepté */}
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-all duration-300 text-sm font-medium"
          >
            Se retirer
          </button>
          {responseDeinscription && (
            <p className="mt-3 text-sm text-[var(--color-primary)] bg-[var(--color-bg-mid)] rounded-xl p-3">
              {responseDeinscription}
            </p>
          )}
        </div>
      )}

      {/* Notre demande de participation au tournoi a été accepter mais le tournoi n'a pas encore commencé */}
      {dataPlayer.res == 2 && (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="font-semibold text-[var(--color-primary)]">
              Demande acceptée
            </h3>
          </div>
          <p className="text-[var(--color-gray)]">
            Votre demande pour participer au concours{" "}
            <span className="font-semibold text-[var(--color-primary)]">
              {dataPlayer.tournamentName}
            </span>{" "}
            a été acceptée. Vous êtes le numéro{" "}
            <span className="font-semibold text-[var(--color-primary)]">
              {dataPlayer.numero}
            </span>
            . Le concours va bientôt commencer.
          </p>
        </div>
      )}

      {/* On est en plein tournoi */}
      {dataPlayer.res == 3 && <DirectTournament dataPlayer={dataPlayer} />}

      {/* Le joueur a gagné le tournoi */}
      {dataPlayer.res == 4 && (
        <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-2xl p-8 shadow-xl text-center text-white">
          <div className="w-20 h-20 bg-[var(--color-gold)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-[var(--color-gold)]" />
          </div>
          <h1 className="text-2xl font-semibold mb-6">{dataPlayer.msg}</h1>
          <button
            onClick={handleDelete}
            className="px-6 py-2 rounded-xl border border-white/30 text-white hover:bg-white/10 transition-all duration-300 text-sm font-medium"
          >
            Quitter le tournoi
          </button>
          {responseDeinscription && (
            <p className="mt-3 text-sm text-white/70">
              {responseDeinscription}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Participant;
