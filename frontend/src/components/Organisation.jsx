import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { linkBackend } from "../constants/LinkBackend";
import { UsersContext } from "../App";
import { Plus, Trash2, Eye, X } from "lucide-react";

const Organisation = ({ player }) => {
  // State qui contiendra les tournoi que gère ce compte en question
  const [tournaments, setTournaments] = useState({ res: 0 });
  // State qui gère l'apparition du formulaire pour crée un tournoi pour le joueur connecté
  const [addTournament, setAddTournament] = useState(false);
  const { setLoad, setError } = useContext(UsersContext);
  // Fonction qui récupère les tournoi que gère le joueur
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

  // Fonction qui crée un nouveau tournoi pour le joueur connecté
  const createTournament = async (e) => {
    e.preventDefault();
    setLoad(true);
    setAddTournament(false);
    try {
      await axios.post(linkBackend + "organisateurs/" + player.id, {
        name: e.target.elements.name.value,
        style: e.target.elements.style_tournament.value,
        prix_entree: e.target.elements.prix_entree.value,
      });
    } catch (err) {
      setError(true);
      console.log(err);
    } finally {
      recharge();
    }
  };

  // Fonction qui supprime un tournoi
  const deleteTournament = async (value) => {
    setLoad(true);
    try {
      await axios.delete(linkBackend + "organisateurs/" + value);
    } catch (err) {
      setError(true);
      console.log(err);
    } finally {
      recharge();
    }
  };

  return (
    <div className="mt-6">
      {/* Si l'api qui renvoie les tournoi a res = 0 ca veut dire que le joueur en question ne gère pas de tournoi */}
      {tournaments.res == 0 ? (
        <p className="text-[var(--color-gray)] mb-4">
          Vous n'avez aucun tournoi
        </p>
      ) : (
        // Si le joueur gère bien des tournois, alors on map les tournoi contenu dans tournament avec la clé "résults"
        <div className="mb-6">
          <p className="text-[var(--color-gray)] mb-4">
            Vous avez{" "}
            <span className="font-semibold text-[var(--color-primary)]">
              {tournaments.results.length}
            </span>{" "}
            tournoi{tournaments.results.length > 1 ? "s" : ""}
          </p>
          <ul className="space-y-3">
            {tournaments.results.map((t) => (
              <li
                key={t.id}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-xl flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-[var(--color-primary)]">
                    {t.name}
                  </p>
                  <p className="text-sm text-[var(--color-gray)]">
                    Mode {t.style}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <NavLink
                    to={"/" + t.id}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl border border-[var(--color-border)] text-[var(--color-primary)] hover:bg-[var(--color-bg-mid)] transition-all duration-300 text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Voir
                  </NavLink>
                  {/* Bouton pour supprimer ce tournoi précis qui apparait avec le map */}
                  <button
                    onClick={() => deleteTournament(t.id)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-all duration-300 text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bouton qui fait apparaitre le formulaire pour pouvoir crée un tournoi */}
      <button
        onClick={() => setAddTournament(true)}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white rounded-xl font-medium shadow-lg hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-all duration-300"
      >
        <Plus className="w-5 h-5" />
        Créer un tournoi
      </button>

      {/* Si le state qui gère l'apparition du formulaire pour créer un tournoi est a true, alors le formulaire apparait */}
      {addTournament && (
        <form
          onSubmit={createTournament}
          className="mt-4 bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl space-y-4"
        >
          <input
            type="text"
            minLength={3}
            name="name"
            placeholder="Nom du tournoi"
            className="w-full h-12 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 text-[var(--color-primary)] placeholder-[var(--color-gray-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
          <select
            name="style_tournament"
            className="w-full h-12 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          >
            <option value="arbre">Arbre</option>
            <option value="cascade">Cascade</option>
            <option value="classement">Classement</option>
          </select>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-primary)]">
              Prix d'entrée par équipe (€) (falcultatif, modifiable après la
              création du tournoi)
            </label>
            <input
              type="number"
              defaultValue="10"
              name="prix_entree"
              min="0"
              className="w-full h-12 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 text-[var(--color-primary)] placeholder-[var(--color-gray-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <input
              type="submit"
              value="Créer"
              className="flex-1 h-12 bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white rounded-xl font-medium cursor-pointer hover:opacity-90 transition-all duration-300"
            />
            {/* Bouton pour annuler le fait de créer un tournoi et donc reppasser le state "addTournament" a false */}
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
