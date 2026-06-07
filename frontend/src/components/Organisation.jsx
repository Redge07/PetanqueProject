import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { linkBackend } from "../constants/LinkBackend";
import { UsersContext } from "../App";
import { Plus, Trash2, Eye, X, Share2, Target } from "lucide-react";
import { getFormatLabel, getFormatIcon } from "../utils/formatLabels";
import ShareModal from "./ui/ShareModal";
import ConfirmModal from "./ui/ConfirmModal";

const Organisation = ({ player }) => {
  const [tournaments, setTournaments] = useState({ res: 0 });
  const [addTournament, setAddTournament] = useState(false);
  const { setLoad, setError } = useContext(UsersContext);
  const [styleTournament, setStyleTournament] = useState("arbre");
  const [shareModal, setShareModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const recharge = async () => {
    try {
      const res = await axios.get(linkBackend + "organisateurs/" + player.id);
      setTournaments(res.data);
    } catch (err) {
      setError(true);
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    setLoad(true);
    recharge();
  }, []);

  const createTournament = async (e) => {
    e.preventDefault();
    setLoad(true);
    setAddTournament(false);
    try {
      await axios.post(linkBackend + "organisateurs/" + player.id, {
        name: e.target.elements.name.value,
        style: e.target.elements.style_tournament.value,
        prix_entree: e.target.elements.prix_entree?.value || 0,
      });
    } catch (err) {
      setError(true);
    } finally {
      recharge();
    }
  };

  const deleteTournament = async (id) => {
    setConfirmDelete(null);
    setLoad(true);
    try {
      await axios.delete(linkBackend + "organisateurs/" + id);
    } catch (err) {
      setError(true);
    } finally {
      recharge();
    }
  };

  return (
    <div className="mt-6">
      {shareModal && (
        <ShareModal
          tournament={shareModal}
          onClose={() => setShareModal(null)}
        />
      )}
      {confirmDelete && (
        <ConfirmModal
          message={`Supprimer le concours "${confirmDelete.name}" ? Cette action est irréversible.`}
          onConfirm={() => deleteTournament(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {tournaments.res == 0 ? (
        /* Empty state : invite à créer le premier concours */
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-[var(--color-border)] text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <Target className="w-8 h-8 text-[var(--color-gold)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--color-primary)] mb-1">
            Aucun concours pour le moment
          </h3>
          <p className="text-[var(--color-gray)] text-sm mb-6 max-w-sm mx-auto">
            Créez votre premier concours de pétanque pour commencer à gérer vos
            parties, vos joueurs et vos résultats.
          </p>
          <button
            onClick={() => setAddTournament(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white rounded-xl font-medium shadow-lg hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            Créer mon premier concours
          </button>
        </div>
      ) : (
        <div className="mb-6">
          <p className="text-[var(--color-gray)] mb-4">
            Vous avez{" "}
            <span className="font-semibold text-[var(--color-primary)]">
              {tournaments.results.length}
            </span>{" "}
            concours
          </p>
          <ul className="space-y-3">
            {tournaments.results.map((t) => {
              const FormatIcon = getFormatIcon(t.style);
              const isFinished = t.start == 2;
              return (
              <li
                key={t.id}
                className={`bg-white rounded-2xl p-4 shadow-sm border border-[var(--color-border)] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between hover:shadow-md transition-all duration-300 ${isFinished ? "opacity-60" : ""}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                    <FormatIcon className="w-5 h-5 text-[var(--color-gold)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--color-primary)] truncate">
                      {t.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs font-medium text-[var(--color-gray)]">
                        {getFormatLabel(t.style)}
                      </span>
                      <span className="text-xs text-[var(--color-gray-light)]">
                        #{t.id}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          t.start == 0
                            ? "bg-orange-100 text-orange-500"
                            : t.start == 1
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {t.start == 0
                          ? "Pas commencé"
                          : t.start == 1
                            ? "En cours"
                            : "Terminé"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:flex-shrink-0">
                  <button
                    onClick={() => setShareModal(t)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 transition-all duration-300 text-sm font-medium"
                    title="Partager le numéro du concours"
                  >
                    <Share2 className="w-4 h-4" />
                    Partager
                  </button>
                  <NavLink
                    to={"/" + t.id}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-all duration-300 text-sm font-medium shadow-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Voir
                  </NavLink>
                  <button
                    onClick={() => setConfirmDelete(t)}
                    className="flex items-center justify-center p-2 rounded-xl text-[var(--color-gray-light)] hover:text-red-500 hover:bg-red-50 transition-all duration-300 flex-shrink-0"
                    title="Supprimer le concours"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
              );
            })}
          </ul>

          {/* Gros bouton de création, en bas de la liste */}
          <button
            onClick={() => setAddTournament(true)}
            className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white rounded-2xl font-semibold shadow-lg hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            Créer un concours
          </button>
        </div>
      )}

      {addTournament && (
        <form
          onSubmit={createTournament}
          className="mt-4 bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl space-y-4"
        >
          <input
            type="text"
            minLength={3}
            name="name"
            placeholder="Nom du concours"
            className="w-full h-12 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 text-[var(--color-primary)] placeholder-[var(--color-gray-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
          <select
            name="style_tournament"
            value={styleTournament}
            onChange={(e) => setStyleTournament(e.target.value)}
            className="w-full h-12 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          >
            <option value="arbre">Élimination directe</option>
            <option value="cascade">Cascade</option>
            <option value="classement">Poules + Finale</option>
          </select>

          {styleTournament === "cascade" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-primary)]">
                Prix d'entrée par équipe (€)
              </label>
              <input
                type="number"
                defaultValue="10"
                min="0"
                name="prix_entree"
                className="w-full h-12 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 text-[var(--color-primary)] placeholder-[var(--color-gray-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>
          )}
          <div className="flex gap-3">
            <input
              type="submit"
              value="Créer"
              className="flex-1 h-12 bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white rounded-xl font-medium cursor-pointer hover:opacity-90 transition-all duration-300"
            />
            <button
              onClick={() => setAddTournament(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-border)] text-[var(--color-gray)] hover:bg-[var(--color-bg-mid)] transition-all duration-300"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Organisation;
