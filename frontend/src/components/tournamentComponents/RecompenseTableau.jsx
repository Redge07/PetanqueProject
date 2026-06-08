import React, { useContext, useEffect, useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { UsersContext } from "../../App";
import { linkBackend } from "../../constants/LinkBackend";
import axios from "axios";

const RecompenseTableau = ({
  matches = [],
  idTournament,
  recharge,
  prix_entree,
  nb_joueurs,
}) => {
  const { setLoad, setError } = useContext(UsersContext);
  const [editMatch, setEditMatch] = useState(null);
  const tours = [...new Set(matches.map((m) => m.class))]
    .filter((tour) => tour > 0)
    .sort((a, b) => b - a);
  const groupes = [...new Set(matches.map((m) => m.groupe))];
  const handleSubmitRecompense = async (e) => {
    e.preventDefault();
    const recompense = e.target.elements.recompense.value;
    try {
      setLoad(true);
      await axios.put(linkBackend + "tournaments/recompense/" + idTournament, {
        groupe: editMatch[0],
        tour: editMatch[1],
        recompense,
      });
      setEditMatch(null);
      recharge();
    } catch (err) {
      setError(true);


    } finally {
      setLoad(false);
    }
  };
  const handleSubmitRecompenseNbVictoire = async (e, nb_victoires) => {
    e.preventDefault();
    const recompense = e.target.elements.recompense.value;
    try {
      setLoad(true);
      await axios.put(
        linkBackend + "tournaments/recompense_victoire/" + idTournament,
        {
          recompense,
          nb_victoires,
        },
      );
      setEditMatch(null);
      recharge();
    } catch (err) {
      setError(true);


    } finally {
      setLoad(false);
    }
  };
  const totalRecompenses = matches.reduce(
    (total, match) => total + match.recompense,
    0,
  );
  const reste = nb_joueurs * prix_entree - totalRecompenses;

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl mb-6">
      <h3 className="text-lg font-semibold text-[var(--color-primary)] mb-1">
        Tableau des récompenses
      </h3>
      <p className="text-sm text-[var(--color-gray)] mb-4">
        Cliquez sur un montant pour le modifier
      </p>

      {/* Tableau */}
      <div className="overflow-x-auto mb-6">
        <ul className="min-w-full">
          {/* Header */}
          <li className="flex gap-2 border-b border-[var(--color-border)] pb-2 mb-2">
            <div className="flex-1 flex justify-center items-center text-sm font-medium text-[var(--color-gray)]">
              Groupe
            </div>
            {tours.map((tour) => (
              <div
                className="flex-1 flex justify-center items-center text-sm font-medium text-[var(--color-gray)]"
                key={tour}
              >
                {tour == 1
                  ? "Finale"
                  : tour == 0.5
                    ? "Finale B vs B2"
                    : `1/${tour}`}
              </div>
            ))}
          </li>

          {/* Lignes groupes */}
          {groupes.map((groupe) => (
            <li
              key={groupe}
              className="flex gap-2 py-2 border-b border-[var(--color-border)] last:border-0"
            >
              <div className="flex-1 flex justify-center items-center font-semibold text-[var(--color-primary)]">
                {groupe}
              </div>
              {tours.map((tour) => {
                const match = matches.find(
                  (match) => match.class == tour && match.groupe == groupe,
                );
                return (
                  <div
                    className="flex-1 flex justify-center items-center"
                    key={tour}
                  >
                    {editMatch?.[0] === groupe && editMatch?.[1] === tour ? (
                      <form
                        className="flex items-center gap-1"
                        onSubmit={handleSubmitRecompense}
                      >
                        <input
                          type="number"
                          name="recompense"
                          className="w-16 h-8 px-2 rounded-lg border border-[var(--color-primary)] text-[var(--color-primary)] text-center text-sm focus:outline-none"
                          defaultValue={match.recompense}
                        />
                        <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors">
                          <Check className="w-4 h-4 cursor-pointer" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditMatch(null)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
                        >
                          <X className="w-4 h-4 cursor-pointer" />
                        </button>
                      </form>
                    ) : (
                      <div className="flex justify-center items-center gap-1 group">
                        <span className="font-semibold text-[var(--color-gold)]">
                          {match ? `${Math.round(match.recompense)}€` : "—"}
                        </span>
                        {match && (
                          <Pencil
                            onClick={() => setEditMatch([groupe, tour])}
                            className="w-3 h-3 text-[var(--color-gray-light)] hover:text-[var(--color-primary)] cursor-pointer transition-colors"
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-[var(--color-border)] pt-4">
          <p className="text-sm text-[var(--color-gray)] mb-4">
            Récompenses quand un joueur atteint tant de victoires en phase de
            poule
          </p>
          <div className="flex gap-5">
            {/* 1 victoire */}
            <div className="bg-[var(--color-bg-mid)] rounded-xl p-4 border border-[var(--color-border)] flex-1 flex flex-col justify-center items-center">
              <p className="text-xs text-[var(--color-gray)] font-medium mb-2">
                1ère victoire
              </p>
              {editMatch === 1 ? (
                <form
                  onSubmit={(e) => handleSubmitRecompenseNbVictoire(e, 1)}
                  className="flex items-center gap-1"
                >
                  <input
                    type="number"
                    name="recompense"
                    className="w-16 h-8 px-2 rounded-lg border border-[var(--color-primary)] text-[var(--color-primary)] text-center text-sm focus:outline-none"
                    defaultValue={
                      matches.find((m) => m.round == 1 && m.groupe == "A")
                        ?.recompense
                    }
                  />
                  <button
                    type="submit"
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMatch(null)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-1 group">
                  <span className="font-semibold text-[var(--color-gold)]">
                    {
                      matches.find((m) => m.round == 1 && m.groupe == "A")
                        ?.recompense
                    }
                    €
                  </span>
                  <Pencil
                    onClick={() => setEditMatch(1)}
                    className="w-3 h-3 text-[var(--color-gray-light)] hover:text-[var(--color-primary)] cursor-pointer transition-colors"
                  />
                </div>
              )}
            </div>

            {/* 2 victoires */}
            <div className="bg-[var(--color-bg-mid)] rounded-xl p-4 border border-[var(--color-border)] flex-1 flex flex-col justify-center items-center">
              <p className="text-xs text-[var(--color-gray)] font-medium mb-2">
                2ème victoire
              </p>
              {editMatch === 2 ? (
                <form
                  onSubmit={(e) => handleSubmitRecompenseNbVictoire(e, 2)}
                  className="flex items-center gap-1"
                >
                  <input
                    type="number"
                    name="recompense"
                    className="w-16 h-8 px-2 rounded-lg border border-[var(--color-primary)] text-[var(--color-primary)] text-center text-sm focus:outline-none"
                    defaultValue={
                      matches.find((m) => m.round == 2 && m.groupe == "A")
                        ?.recompense
                    }
                  />
                  <button
                    type="submit"
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMatch(null)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-1 group">
                  <span className="font-semibold text-[var(--color-gold)]">
                    {
                      matches.find((m) => m.round == 2 && m.groupe == "A")
                        ?.recompense
                    }
                    €
                  </span>
                  <Pencil
                    onClick={() => setEditMatch(2)}
                    className="w-3 h-3 text-[var(--color-gray-light)] hover:text-[var(--color-primary)] cursor-pointer transition-colors"
                  />
                </div>
              )}
            </div>

            {/* 3 victoires */}
            <div className="bg-[var(--color-bg-mid)] rounded-xl p-4 border border-[var(--color-border)] flex-1 flex flex-col justify-center items-center">
              <p className="text-xs text-[var(--color-gray)] font-medium mb-2">
                3ème victoire
              </p>
              {editMatch === 3 ? (
                <form
                  onSubmit={(e) => handleSubmitRecompenseNbVictoire(e, 3)}
                  className="flex items-center gap-1"
                >
                  <input
                    type="number"
                    name="recompense"
                    className="w-16 h-8 px-2 rounded-lg border border-[var(--color-primary)] text-[var(--color-primary)] text-center text-sm focus:outline-none"
                    defaultValue={
                      matches.find((m) => m.round == 3 && m.groupe == "A")
                        ?.recompense
                    }
                  />
                  <button
                    type="submit"
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMatch(null)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-1 group">
                  <span className="font-semibold text-[var(--color-gold)]">
                    {
                      matches.find((m) => m.round == 3 && m.groupe == "A")
                        ?.recompense
                    }
                    €
                  </span>
                  <Pencil
                    onClick={() => setEditMatch(3)}
                    className="w-3 h-3 text-[var(--color-gray-light)] hover:text-[var(--color-primary)] cursor-pointer transition-colors"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Infos cagnotte */}
      <div className="space-y-2 pt-4 border-t border-[var(--color-border)]">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-gray)]">Nombre de joueurs</span>
          <span className="font-medium text-[var(--color-primary)]">
            {nb_joueurs}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-gray)]">Cagnotte globale</span>
          <span className="font-medium text-[var(--color-primary)]">
            {nb_joueurs * prix_entree}€
          </span>
        </div>
        {totalRecompenses > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--color-gray)]">Total distribué</span>
            <span className="font-medium text-[var(--color-gold)]">
              {Math.round(totalRecompenses)}€
            </span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm pt-2 border-t border-[var(--color-border)]">
          <span className="font-semibold text-[var(--color-primary)]">
            Reste
          </span>
          <span
            className={`font-semibold ${reste < 0 ? "text-red-500" : "text-green-600"}`}
          >
            {Math.round(reste)}€
          </span>
        </div>
      </div>
    </div>
  );
};

export default RecompenseTableau;
