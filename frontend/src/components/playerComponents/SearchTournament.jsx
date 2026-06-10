import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { linkBackend } from "../../constants/LinkBackend";
import { UsersContext } from "../../App";
import { Search, Hash, MapPin, Users, Eye } from "lucide-react";
import { getFormatLabel, getFormatIcon } from "../../utils/formatLabels";

// Formulaire d'inscription — état local pour éviter tout re-render du parent à la frappe
function InscriptionForm({ tournament, onSubmit, responseInscription }) {
  const [pseudo, setPseudo] = useState("");
  return (
    <div className="mt-4 p-4 bg-[var(--color-bg-mid)] rounded-xl border border-[var(--color-gold)]/20">
      <p className="text-sm font-medium text-[var(--color-primary)] mb-2">
        Inscrire mon équipe
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Nom de l'équipe (ex: Dupont / Martin)"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          className="flex-1 min-w-0 h-11 px-4 rounded-xl border border-[var(--color-border)] bg-white text-[var(--color-primary)] placeholder-[var(--color-gray-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
        />
        <button
          onClick={() => onSubmit(tournament, pseudo)}
          disabled={!pseudo.trim()}
          className="flex-shrink-0 h-11 px-5 bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white rounded-xl font-medium hover:opacity-90 transition-all duration-300 disabled:opacity-40"
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
}

// Carte d'événement d'un concours — module-level
function TournamentCard({ t, isOpen, onToggle, onSubmit, responseInscription }) {
  const FormatIcon = getFormatIcon(t.style);
  const nb = Number(t.nb_joueurs ?? 0);
  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
        isOpen
          ? "border-[var(--color-gold)] shadow-lg"
          : "border-[var(--color-border)] hover:shadow-md hover:border-[var(--color-primary)]/30"
      }`}
    >
      {/* Liseré supérieur doré */}
      <div className="h-1 bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)]" />

      <div className="p-4 bg-white">
        {/* Statut + format */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
            Inscriptions ouvertes
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-[var(--color-gray)] border border-[var(--color-border)] px-2.5 py-1 rounded-full flex-shrink-0">
            <FormatIcon className="w-3.5 h-3.5" />
            {getFormatLabel(t.style)}
          </span>
        </div>

        {/* Nom du concours */}
        <h3 className="text-lg font-bold text-[var(--color-primary)] truncate">
          {t.name}
        </h3>

        {/* Méta : inscrits, lieu, numéro */}
        <div className="flex items-center gap-4 mt-2 text-sm text-[var(--color-gray)] flex-wrap">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            {nb} équipe{nb > 1 ? "s" : ""} inscrite{nb > 1 ? "s" : ""}
          </span>
          {t.lieu && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {t.lieu}
            </span>
          )}
          <span className="text-[var(--color-gray-light)] text-xs ml-auto">
            #{t.id}
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={() => onToggle(isOpen ? null : t)}
          className={`w-full mt-4 h-11 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
            isOpen
              ? "bg-[var(--color-bg-mid)] text-[var(--color-primary)]"
              : "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] shadow-sm"
          }`}
        >
          {isOpen ? (
            "Fermer"
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Rejoindre ce concours
            </>
          )}
        </button>

        {isOpen && (
          <InscriptionForm
            tournament={t}
            onSubmit={onSubmit}
            responseInscription={responseInscription}
          />
        )}
      </div>
    </div>
  );
}

const SearchTournament = ({ player, recharge }) => {
  const [tab, setTab] = useState("list");
  const [nameQuery, setNameQuery] = useState("");
  const [nameResults, setNameResults] = useState([]);
  const [availableList, setAvailableList] = useState([]);
  const [idQuery, setIdQuery] = useState("");
  const [dataTournament, setDataTournament] = useState({ res: -1 });
  const [responseInscription, setResponseInscription] = useState("");
  const [selectedTournament, setSelectedTournament] = useState(null);
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

  const handleInscrire = async (tournament, pseudo) => {
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

  // Props communes aux cartes
  const cardProps = {
    onSubmit: handleInscrire,
    responseInscription,
    onToggle: (t) => {
      setSelectedTournament(t);
      setResponseInscription("");
    },
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
      {/* Message principal bien visible */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-[var(--color-primary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Search className="w-7 h-7 text-[var(--color-primary)]" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--color-primary)]">
          Vous ne participez à aucun concours
        </h3>
        <p className="text-sm text-[var(--color-gray)] mt-1 max-w-md mx-auto">
          Trouvez un concours ci-dessous et inscrivez-vous pour suivre vos
          matchs en direct.
        </p>
      </div>

      {/* Onglets */}
      <div className="flex rounded-xl bg-[var(--color-bg-mid)] p-1 mb-5">
        {[
          { id: "list", label: "Concours disponibles", icon: MapPin },
          { id: "name", label: "Recherche par nom", icon: Search },
          { id: "id", label: "Par numéro", icon: Hash },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              setTab(id);
              setSelectedTournament(null);
              setResponseInscription("");
            }}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
              {availableList.map((t) => (
                <TournamentCard
                  key={t.id}
                  t={t}
                  isOpen={selectedTournament?.id === t.id}
                  {...cardProps}
                />
              ))}
            </div>
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
              onChange={(e) => {
                setNameQuery(e.target.value);
                setSelectedTournament(null);
                setResponseInscription("");
              }}
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 text-[var(--color-primary)] placeholder-[var(--color-gray-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
          </div>
          {nameQuery.length >= 2 && nameResults.length === 0 && (
            <p className="text-sm text-[var(--color-gray)] text-center py-3">
              Aucun résultat
            </p>
          )}
          {nameResults.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
              {nameResults.map((t) => (
                <TournamentCard
                  key={t.id}
                  t={t}
                  isOpen={selectedTournament?.id === t.id}
                  {...cardProps}
                />
              ))}
            </div>
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
              className="flex-1 min-w-0 h-12 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 text-[var(--color-primary)] placeholder-[var(--color-gray-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
            <button
              type="submit"
              className="flex-shrink-0 h-12 px-6 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white rounded-xl font-medium hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-all duration-300"
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
            <div className="max-w-xl mx-auto">
              <TournamentCard
                t={selectedTournament}
                isOpen={true}
                {...cardProps}
              />
            </div>
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
