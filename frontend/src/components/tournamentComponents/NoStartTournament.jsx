import axios from "axios";
import React, { useContext, useState } from "react";
import { linkBackend } from "../../constants/LinkBackend";
import { UsersContext } from "../../App";
import {
  UserCheck,
  UserX,
  UserPlus,
  Play,
  CreditCard,
  Users,
  Pencil,
  Check,
  X,
} from "lucide-react";
import ConfirmModal from "../ui/ConfirmModal";

const NoStartTournament = ({ listPlayers, recharge, idTournament, style }) => {
  const [responseAPI, setResponseAPI] = useState({ res: 0 });
  const [nbPlayers, setNbPlayers] = useState("");
  const [searchAttente, setSearchAttente] = useState("");
  const [searchValider, setSearchValider] = useState("");
  const [editPrix, setEditPrix] = useState(false);
  const [confirmDeleteAttente, setConfirmDeleteAttente] = useState(null);
  const [confirmDeleteValid, setConfirmDeleteValid] = useState(null);

  const { setLoad, setError } = useContext(UsersContext);

  const [responseGoTournament, setResponseGoTournament] = useState("");

  // Variable pour calculer le nombre de joueurs en attente et validé
  const listPlayersAttente = listPlayers.results
    .filter((p) => p.valider == 0)
    .filter(
      (p) =>
        p.pseudo.toLowerCase().includes(searchAttente.toLowerCase()) ||
        p.numero?.toString().includes(searchAttente),
    );

  const listPlayersValider = listPlayers.results
    .filter((p) => p.valider == 1)
    .filter(
      (p) =>
        p.pseudo.toLowerCase().includes(searchValider.toLowerCase()) ||
        p.numero?.toString().includes(searchValider),
    );

  const handleApiResponse = (res) => {
    setResponseAPI(res.data);
    setTimeout(() => {
      setResponseAPI({ res: 0 });
      recharge();
    }, 1000);
  };

  // Fonction pour supprimer un joueur du tournoi en attente
  const handleDeleteAttente = async (value) => {
    setLoad(true);
    try {
      const res = await axios.delete(
        linkBackend + "tournaments/players_attente/" + value,
      );
      handleApiResponse(res);
    } catch (err) {

      setError(true);
    } finally {
      setLoad(false);
    }
  };

  // Fonction pour supprimer un joueur du tournoi en valid
  const handleDeleteValid = async (value) => {
    setLoad(true);
    try {
      const res = await axios.delete(
        linkBackend + "tournaments/" + idTournament,
        {
          data: { numero: value },
        },
      );
      handleApiResponse(res);
    } catch (err) {
      setError(true);

    } finally {
      setLoad(false);
    }
  };

  // Fonction pour accepté un joueur
  const handleValid = async (value) => {
    setLoad(true);
    try {
      const res = await axios.put(linkBackend + "tournaments/" + idTournament, {
        id_user: value,
      });
      handleApiResponse(res);
    } catch (err) {
      setError(true);

    } finally {
      setLoad(false);
    }
  };

  // Fonction pour ajouter un joueur manuellement
  const handleAddPlayer = async (e) => {
    e.preventDefault();
    setLoad(true);
    try {
      const res = await axios.post(
        linkBackend + "tournaments/" + idTournament,
        {
          pseudo: e.target.elements.pseudo.value,
        },
      );
      handleApiResponse(res);
    } catch (err) {
      setError(true);

    } finally {
      setLoad(false);
    }
  };

  // Fonction quand je décide de démarrer le tournoi
  const handleGoTournament = async () => {
    setLoad(true);
    try {
      const res = await axios.put(
        linkBackend + `gotournaments/${style}/` + idTournament,
      );
      setResponseGoTournament(res.data);
      setTimeout(() => {
        recharge();
      }, 1000);
    } catch (err) {
      setError(true);

    } finally {
      setLoad(false);
    }
  };

  const handleCreatePlayers = async () => {
    if (!nbPlayers || nbPlayers <= 0) return;
    setLoad(true);
    try {
      await axios.post(
        linkBackend + "tournaments/create_players/" + idTournament,
        {
          nbPlayers: nbPlayers,
        },
      );
      recharge();
    } catch (err) {

      setError(true);
    } finally {
      setLoad(false);
    }
  };

  const handlePayement = async () => {
    try {
      setLoad(true);
      const res = await axios.post(
        linkBackend + "log/create-checkout-session/" + idTournament,
      );
      window.open(res.data.url, "_blank", "noopener,noreferrer");
    } catch (err) {

      setError(true);
    } finally {
      setLoad(false);
    }
  };

  const handleModifyPrice = async (e) => {
    e.preventDefault();
    setLoad(true);
    try {
      await axios.put(linkBackend + "tournaments/prix_entree/" + idTournament, {
        prix_entree: e.target.elements.prix_entree.value,
      });
      setEditPrix(false);
      recharge();
    } catch (err) {
      setError(true);

    } finally {
      setLoad(false);
    }
  };


  return (
    <div className="space-y-6">
      {confirmDeleteAttente && (
        <ConfirmModal
          message={`Refuser et supprimer "${confirmDeleteAttente.pseudo}" de la liste d'attente ?`}
          onConfirm={() => {
            handleDeleteAttente(confirmDeleteAttente.id_user);
            setConfirmDeleteAttente(null);
          }}
          onCancel={() => setConfirmDeleteAttente(null)}
        />
      )}
      {confirmDeleteValid && (
        <ConfirmModal
          message={`Supprimer "${confirmDeleteValid.pseudo}" (n°${confirmDeleteValid.numero}) du concours ?`}
          onConfirm={() => {
            handleDeleteValid(confirmDeleteValid.numero);
            setConfirmDeleteValid(null);
          }}
          onCancel={() => setConfirmDeleteValid(null)}
        />
      )}
      {/* Recherche joueurs en attente */}
      <input
        type="text"
        placeholder="Rechercher par nom ou numéro..."
        value={searchAttente}
        onChange={(e) => setSearchAttente(e.target.value)}
        className="w-full h-10 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 text-[var(--color-primary)] placeholder-[var(--color-gray-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors mb-3"
      />
      {/* Joueurs en attente */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[var(--color-gold)]/10 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-[var(--color-gold)]" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-primary)]">
              Joueurs en attente
            </h3>
            <p className="text-sm text-[var(--color-gray)]">
              {listPlayersAttente.length}{" "}
              {listPlayersAttente.length > 1 ? "joueurs" : "joueur"} en attente
            </p>
          </div>
        </div>
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {/* On liste les joueurs qui sont en attente en filtrant avec le colonne "valider" */}
          {listPlayersAttente.map((j) => (
            <li
              key={j.id_user}
              className="flex items-center justify-between gap-2 p-3 bg-[var(--color-bg-mid)] rounded-xl"
            >
              {/* Pseudo du joueur */}
              <span className="font-medium text-[var(--color-primary)] truncate min-w-0">
                {j.pseudo}
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Bouton pour supprimer ce joueur */}
                <button
                  onClick={() => setConfirmDeleteAttente(j)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-all duration-300 text-sm"
                >
                  <UserX className="w-4 h-4" />
                  Refuser
                </button>
                {/* Bouton pour accepté ce joueur */}
                <button
                  onClick={() => handleValid(j.id_user)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-green-200 text-green-600 hover:bg-green-50 transition-all duration-300 text-sm"
                >
                  <UserCheck className="w-4 h-4" />
                  Accepter
                </button>
              </div>
              {/* Message qui va apparaitre quand on va supprimer ou accepté un joueur, vérifie si on parle d'une suppression ou d'une validation et vérifie l'id pour bien affiché ce message au joueur concerné */}
              {responseAPI.res == 1 && responseAPI.id == j.id_user && (
                <p className="text-sm text-[var(--color-primary)] mt-1">
                  {responseAPI.msg}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
      {/* Recherche joueurs validés */}
      <input
        type="text"
        placeholder="Rechercher par nom ou numéro..."
        value={searchValider}
        onChange={(e) => setSearchValider(e.target.value)}
        className="w-full h-10 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 text-[var(--color-primary)] placeholder-[var(--color-gray-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors mb-3"
      />
      {/* Joueurs acceptés */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-green-600" />
          </div>
          <div>
            {/* On va lister tous les joueurs qui n'ont pas encore été accepté pour ce tournoi en question dans la base de données */}
            <h3 className="font-semibold text-[var(--color-primary)]">
              Joueurs acceptés
            </h3>
            <p className="text-sm text-[var(--color-gray)]">
              {listPlayersValider.length}{" "}
              {listPlayersValider.length > 1 ? "joueurs" : "joueur"} accepté
            </p>
          </div>
        </div>
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {listPlayersValider.map((j) => (
            <li
              key={j.numero}
              className="flex items-center justify-between gap-2 p-3 bg-[var(--color-bg-mid)] rounded-xl"
            >
              <div className="min-w-0 flex items-baseline gap-2">
                <span className="font-medium text-[var(--color-primary)] truncate">
                  {j.pseudo}
                </span>
                <span className="text-sm text-[var(--color-gray)] flex-shrink-0">
                  #{j.numero}
                </span>
              </div>
              <button
                onClick={() => setConfirmDeleteValid(j)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-all duration-300 text-sm flex-shrink-0"
              >
                <UserX className="w-4 h-4" />
                Supprimer
              </button>
              {responseAPI.res == 1 && responseAPI.numero == j.numero && (
                <p className="text-sm text-[var(--color-primary)] mt-1">
                  {responseAPI.msg}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
      {/* Ajouter un joueur manuellement */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <h3 className="font-semibold text-[var(--color-primary)]">
            Ajouter un joueur manuellement
          </h3>
        </div>
        {/* Form pour ajouter un joueur manuellement */}
        <form onSubmit={handleAddPlayer} className="flex gap-2">
          <input
            type="text"
            name="pseudo"
            placeholder="Entrez un pseudo..."
            className="flex-1 h-12 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 text-[var(--color-primary)] placeholder-[var(--color-gray-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
          <input
            type="submit"
            value="Inscrire"
            className="h-12 px-6 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white rounded-xl font-medium cursor-pointer hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-all duration-300"
          />
        </form>
      </div>
      {/* Créer des joueurs automatiquement */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <h3 className="font-semibold text-[var(--color-primary)]">
            Créer des joueurs automatiquement
          </h3>
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            placeholder="Nombre de joueurs"
            value={nbPlayers}
            onChange={(e) => setNbPlayers(e.target.value)}
            className="flex-1 h-12 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 text-[var(--color-primary)] placeholder-[var(--color-gray-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
          <button
            onClick={handleCreatePlayers}
            className="h-12 px-6 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white rounded-xl font-medium hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-all duration-300"
          >
            Créer
          </button>
        </div>
      </div>
      {listPlayers.style == "cascade" && (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-[var(--color-gold)]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-[var(--color-gold)]" />
              </div>
              <h3 className="font-semibold text-[var(--color-primary)] truncate">
                Prix d'entrée par équipe
              </h3>
            </div>
            {editPrix ? (
              <form
                onSubmit={handleModifyPrice}
                className="flex items-center gap-2"
              >
                <input
                  type="number"
                  name="prix_entree"
                  min="0"
                  defaultValue={listPlayers.prix_entree}
                  className="w-24 h-9 px-3 rounded-xl border border-[var(--color-primary)] text-[var(--color-primary)] text-center focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditPrix(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-bold text-[var(--color-gold)] text-lg">
                  {listPlayers.prix_entree}€
                </span>
                <button
                  onClick={() => setEditPrix(true)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-bg-mid)] transition-colors"
                >
                  <Pencil className="w-4 h-4 text-[var(--color-gray-light)]" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Lancer le tournoi */}
      <button
        onClick={handleGoTournament}
        className="w-full flex items-center justify-center gap-2 h-14 bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white rounded-2xl font-semibold text-lg shadow-xl hover:opacity-90 transition-all duration-300"
      >
        <Play className="w-6 h-6" />
        Lancer le concours
      </button>
      {responseGoTournament.message && (
        <p className="text-center text-sm text-[var(--color-primary)] bg-[var(--color-bg-mid)] rounded-xl p-3">
          {responseGoTournament.message}
        </p>
      )}
      {responseGoTournament.res == 1 && (
        <button
          onClick={handlePayement}
          className="w-full flex items-center justify-center gap-2 h-12 border border-[var(--color-gold)] text-[var(--color-gold)] rounded-2xl font-medium hover:bg-[var(--color-gold)]/10 transition-all duration-300"
        >
          <CreditCard className="w-5 h-5" />
          Aller payer
        </button>
      )}
    </div>
  );
};

export default NoStartTournament;
