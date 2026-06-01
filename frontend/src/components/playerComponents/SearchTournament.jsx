import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { linkBackend } from "../../constants/LinkBackend";
import { UsersContext } from "../../App";
import { Search, Hash, MapPin, Trophy } from "lucide-react";
import { getFormatLabel } from "../../utils/formatLabels";

const SearchTournament = ({ player, recharge }) => {
  const [tab, setTab] = useState("list");
  const [nameQuery, setNameQuery] = useState("");
  const [nameResults, setNameResults] = useState([]);
  const [availableList, setAvailableList] = useState([]);
  const [idQuery, setIdQuery] = useState("");
  const [dataTournament, setDataTournament] = useState({ res: -1 });
  const [responseInscription, setResponseInscription] = useState("");
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [pseudo, setPseudo] = useState("");
  const { setLoad, setError } = useContext(UsersContext);

  // Charger la liste des concours disponibles au montage
  useEffect(() => {
    const loadAvailable = async () => {
      try {
        const res = await axios.get(linkBackend + "players/available");
        setAvailableList(res.data);
      } catch {
        // silencieux, la liste restera vide
      }
    };
    loadAvailable();

    // Pré-remplir depuis ?id= dans l'URL
    const params = new URLSearchParams(window.location.search);
    const joinId = params.get("id");
    if (joinId) {
      setTab("id");
      setIdQuery(joinId);
      handleSearchById(joinId);
    }
  }, []);

  // Recherche par nom (déclenché en live)
  useEffect(() => {
    if (!nameQuery.trim() || nameQuery.length < 2) {
      setNameResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await axios.get(
          linkBackend + "players/search-name/" + encodeURIComponent(nameQuery),
        );
        setNameResults(res.data);
      } catch {
        setNameResults([]);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [nameQuery]);

  const handleSearchById = async (id) => {
    if (!id) return;
    setLoad(true);
    try {
      const res = await axios.get(linkBackend + "players/search/" + id);
      setDataTournament(res.data);
      if (res.data.res === 1) setSelectedTournament(res.data);
    } catch {
      setError(true);
    } finally {
      setLoad(false);
    }
  };

  const handleSearchByIdSubmit = (e) => {
    e.preventDefault();
    handleSearchById(idQuery);
  };

  const handleInscrire = async (tournament) => {
    if (!pseudo.trim()) return;
    setLoad(true);
    try {
      const res = await axios.post(linkBackend + "players/", {
        idUser: player.id,
        idTournament: tournament.id,
        pseudo,
      });
      setResponseInscription(res.data.res);
    } catch {
      setError(true);
    } finally {
      recharge();
      setLoad(false);
    }
  };

  const InscriptionForm = ({ tournament }) => (
    <div className="mt-4 p-4 bg-[var(--color-bg-mid)] rounded-xl border border-[var(--color-gold)]/20">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-4 h-4 text-[var(--color-gold)]" />
        <p className="font-semibold text-[var(--color-primary)]">
          {tournament.name}
        </p>
        <span className="text-xs text-white bg-[var(--color-primary)] px-2 py-0.5 rounded-full">
          {getFormatLabel(tournament.style)}
        </span>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Votre pseudo pour ce concours"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          className="flex-1 h-11 px-4 rounded-xl border border-[var(--color-border)] bg-white text-[var(--color-primary)] placeholder-[var(--color-gray-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
        />
        <button
          onClick={() => handleInscrire(tournament)}
          disabled={!pseudo.trim()}
          className="h-11 px-5 bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white rounded-xl font-medium hover:opacity-90 transition-all duration-300 disabled:opacity-40"
        >
          S'inscrire
        </button>
      </div>
      {responseInscription && (
        <p className="mt-2 text-sm text-[var(--color-primary)] bg-white rounded-xl p-3">
          {responseInscription}
        </p>
      )}
    </div>
  );

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
      <p className="text-[var(--color-gray)] mb-5">
        Vous ne participez à aucun concours
      </p>

      {/* Onglets */}
      <div className="flex rounded-xl bg-[var(--color-bg-mid)] p-1 mb-5">
        {[
          { id: "list", label: "Concours disponibles", icon: MapPin },
          { id: "name", label: "Recherche par nom", icon: Search },
          { id: "id", label: "Par numéro", icon: Hash },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setTab(id); setSelectedTournament(null); setResponseInscription(""); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${tab === id ? "bg-white text-[var(--color-primary)] shadow-sm" : "text-[var(--color-gray)]"}`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Onglet : Liste des disponibles */}
      {tab === "list" && (
        <div>
          {availableList.length === 0 ? (
            <p className="text-sm text-[var(--color-gray)] text-center py-4">
              Aucun concours disponible pour le moment
            </p>
          ) : (
            <ul className="space-y-2">
              {availableList.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setSelectedTournament(selectedTournament?.id === t.id ? null : t)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 text-left ${selectedTournament?.id === t.id ? "border-[var(--color-gold)] bg-[var(--color-gold)]/5" : "border-[var(--color-border)] hover:border-[var(--color-primary)]/30 bg-[var(--color-bg-mid)]"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[var(--color-primary)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-4 h-4 text-[var(--color-primary)]" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--color-primary)] text-sm">{t.name}</p>
                        <p className="text-xs text-[var(--color-gray)]">{getFormatLabel(t.style)} • #{t.id}</p>
                      </div>
                    </div>
                    <span className="text-xs text-[var(--color-gold)] font-medium">
                      {selectedTournament?.id === t.id ? "Fermer" : "Rejoindre"}
                    </span>
                  </button>
                  {selectedTournament?.id === t.id && (
                    <InscriptionForm tournament={t} />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Onglet : Recherche par nom */}
      {tab === "name" && (
        <div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-gray-light)]" />
            <input
              type="text"
              placeholder="Nom du concours..."
              value={nameQuery}
              onChange={(e) => { setNameQuery(e.target.value); setSelectedTournament(null); setResponseInscription(""); }}
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 text-[var(--color-primary)] placeholder-[var(--color-gray-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
          </div>
          {nameQuery.length >= 2 && nameResults.length === 0 && (
            <p className="text-sm text-[var(--color-gray)] text-center py-3">Aucun résultat</p>
          )}
          {nameResults.length > 0 && (
            <ul className="space-y-2">
              {nameResults.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setSelectedTournament(selectedTournament?.id === t.id ? null : t)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 text-left ${selectedTournament?.id === t.id ? "border-[var(--color-gold)] bg-[var(--color-gold)]/5" : "border-[var(--color-border)] hover:border-[var(--color-primary)]/30 bg-[var(--color-bg-mid)]"}`}
                  >
                    <div>
                      <p className="font-medium text-[var(--color-primary)] text-sm">{t.name}</p>
                      <p className="text-xs text-[var(--color-gray)]">{getFormatLabel(t.style)} • #{t.id}</p>
                    </div>
                    <span className="text-xs text-[var(--color-gold)] font-medium">
                      {selectedTournament?.id === t.id ? "Fermer" : "Rejoindre"}
                    </span>
                  </button>
                  {selectedTournament?.id === t.id && (
                    <InscriptionForm tournament={t} />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Onglet : Par numéro (ID) */}
      {tab === "id" && (
        <div>
          <form onSubmit={handleSearchByIdSubmit} className="flex gap-2 mb-4">
            <input
              type="number"
              value={idQuery}
              onChange={(e) => setIdQuery(e.target.value)}
              placeholder="Numéro du concours..."
              required
              className="flex-1 h-12 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 text-[var(--color-primary)] placeholder-[var(--color-gray-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
            <button
              type="submit"
              className="h-12 px-6 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white rounded-xl font-medium hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-all duration-300"
            >
              Chercher
            </button>
          </form>

          {dataTournament.res == 0 && (
            <p className="text-sm text-red-500 bg-red-50 rounded-xl p-3">
              Ce numéro ne correspond à aucun concours
            </p>
          )}
          {dataTournament.res == 1 && selectedTournament && (
            <InscriptionForm tournament={selectedTournament} />
          )}
          {dataTournament.res == 2 && (
            <p className="text-sm text-[var(--color-gray)] bg-[var(--color-bg-mid)] rounded-xl p-3">
              Le concours {dataTournament.name} a déjà commencé, vous ne pouvez
              pas y participer
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchTournament;
