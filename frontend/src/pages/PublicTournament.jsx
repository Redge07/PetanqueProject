import React, { useEffect, useState, useRef } from "react";
import { useParams, NavLink } from "react-router-dom";
import axios from "axios";
import { linkBackend } from "../constants/LinkBackend";
import { getFormatLabel } from "../utils/formatLabels";
import createPaires from "../utils/CreatePaires";
import { Trophy, RefreshCw, Maximize2, Share2 } from "lucide-react";
import ShareModal from "../components/ui/ShareModal";

const REFRESH_INTERVAL = 30000;

const PublicTournament = () => {
  const { idTournament } = useParams();
  const [data, setData] = useState(null);
  const [pairesInfos, setPaireInfos] = useState({});
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [shareModal, setShareModal] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef(null);

  const load = async () => {
    try {
      const res = await axios.get(linkBackend + "tournaments/" + idTournament);
      const filteredMatches = res.data.matches
        ? res.data.matches.filter(
            (m) => m.id_playerA && (!m.end || m.end === -1),
          )
        : [];
      setData({ ...res.data, matches: filteredMatches });
      setPaireInfos(createPaires(filteredMatches));
      setLastRefresh(new Date());
    } catch {
      // silencieux si le concours n'existe pas
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [idTournament]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-bg-mid)] to-[var(--color-bg-dark)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)] animate-spin mx-auto mb-4" />
          <p className="text-[var(--color-gray)]">Chargement du concours…</p>
        </div>
      </div>
    );
  }

  const formatTour = (t) => {
    if (t === 1) return "Finale";
    if (t === 0.5) return "Finale B vs B2";
    return `1/${t} de finale`;
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-bg-mid)] to-[var(--color-bg-dark)]"
    >
      {shareModal && (
        <ShareModal
          tournament={{ id: idTournament, name: data.name }}
          onClose={() => setShareModal(false)}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] px-6 py-5 shadow-xl">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--color-gold)]/20 rounded-xl flex items-center justify-center">
              <Trophy className="w-7 h-7 text-[var(--color-gold)]" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">
                {data.name || `Concours #${idTournament}`}
              </h1>
              <p className="text-white/70 text-sm">
                {getFormatLabel(data.style)}
                {data.res === 0 && " · En attente de démarrage"}
                {data.res === 1 && " · En cours"}
                {data.res === 2 && " · Terminé"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white/50 text-xs hidden sm:block">
              Mis à jour à {lastRefresh.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <button
              onClick={load}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Rafraîchir"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShareModal(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Partager"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Plein écran"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8">

        {/* Concours pas encore commencé */}
        {data.res === 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-orange-400" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--color-primary)] mb-2">
              Le concours n'a pas encore démarré
            </h2>
            <p className="text-[var(--color-gray)]">
              {data.results?.filter((p) => p.valider === 1).length ?? 0} équipe(s) inscrite(s)
            </p>
          </div>
        )}

        {/* Concours terminé */}
        {data.res === 2 && (
          <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-2xl p-10 shadow-xl text-center text-white mb-6">
            <div className="w-20 h-20 bg-[var(--color-gold)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-12 h-12 text-[var(--color-gold)]" />
            </div>
            <p className="text-[var(--color-gold)] text-sm font-medium mb-2">
              Vainqueur du concours
            </p>
            <h2 className="text-4xl font-bold">{data.vainqueur}</h2>
          </div>
        )}

        {/* Concours en cours */}
        {data.res === 1 && (
          <div className="space-y-6">

            {/* Vainqueurs de groupes (cascade/classement) */}
            {data.vainqueurs && (
              <div className="flex flex-wrap gap-3">
                {["A", "B", "B2", "C"].map((g) => {
                  const v = data.vainqueurs[`vainqueur${g}`];
                  if (!v) return null;
                  return (
                    <div
                      key={g}
                      className="flex items-center gap-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-2xl px-5 py-3 text-white shadow-lg"
                    >
                      <Trophy className="w-5 h-5 text-[var(--color-gold)]" />
                      <div>
                        <p className="text-[var(--color-gold)] text-xs">Groupe {g}</p>
                        <p className="font-semibold">{v}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Matchs groupés par round/tour */}
            {pairesInfos.rounds && [...pairesInfos.rounds].sort((a, b) => b - a).map((r) => {
              const matchesForRound = data.matches.filter((m) => m.round === r);
              if (matchesForRound.length === 0) return null;

              return (
                <div key={r} className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
                  {/* Titre du round */}
                  <h2 className="text-lg font-semibold text-[var(--color-primary)] mb-4">
                    {r === 4
                      ? "Phase finale"
                      : data.style === "classement"
                        ? `Poules — Tour ${r}`
                        : `Round ${r}`}
                  </h2>

                  {/* Si phase finale (r=4), grouper par tour */}
                  {r === 4 ? (
                    <div className="space-y-4">
                      {[...pairesInfos.tours].sort((a, b) => a - b).map((t) => {
                        const matches = matchesForRound.filter((m) => m.class === t);
                        if (matches.length === 0) return null;
                        return (
                          <div key={t}>
                            <p className="text-sm font-medium text-[var(--color-gray)] mb-2">
                              {formatTour(t)}
                            </p>
                            <div className="space-y-2">
                              {matches.map((m, i) => (
                                <MatchCard key={i} match={m} />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {matchesForRound.map((m, i) => (
                        <MatchCard key={i} match={m} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <NavLink
            to="/"
            className="text-xs text-[var(--color-gray-light)] hover:text-[var(--color-primary)] transition-colors"
          >
            PétanqueManager
          </NavLink>
          <p className="text-xs text-[var(--color-gray-light)] mt-1">
            Rafraîchissement automatique toutes les 30 secondes
          </p>
        </div>
      </div>
    </div>
  );
};

const MatchCard = ({ match }) => {
  const hasResult = match.id_winner > 0;
  const aWon = hasResult && match.id_winner === match.id_playerA;
  const bWon = hasResult && match.id_winner === match.id_playerB;

  return (
    <div className={`rounded-xl border p-3 ${hasResult ? "border-[var(--color-border)] bg-[var(--color-bg-mid)]" : "border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5"}`}>
      {match.groupe && (
        <span className="text-xs text-[var(--color-gray)] mb-2 block">
          Groupe {match.groupe}
          {match.barrage === 1 && (
            <span className="ml-2 text-orange-500 font-medium">Barrage</span>
          )}
        </span>
      )}
      <div className="flex items-center gap-2">
        {/* Équipe A */}
        <div className={`flex-1 text-center py-2 px-3 rounded-lg ${aWon ? "bg-[var(--color-primary)] text-white" : "bg-white text-[var(--color-primary)]"}`}>
          <p className={`font-semibold text-sm truncate ${aWon ? "text-white" : ""}`}>
            {match.pseudo_A}
          </p>
          {hasResult && (
            <p className={`text-xs font-bold ${aWon ? "text-[var(--color-gold)]" : "opacity-60"}`}>
              {match.score_A ?? "—"}
            </p>
          )}
        </div>

        <span className="text-xs font-bold text-[var(--color-gray-light)] flex-shrink-0">VS</span>

        {/* Équipe B */}
        <div className={`flex-1 text-center py-2 px-3 rounded-lg ${bWon ? "bg-[var(--color-primary)] text-white" : "bg-white text-[var(--color-primary)]"}`}>
          <p className={`font-semibold text-sm truncate ${bWon ? "text-white" : ""}`}>
            {match.id_playerB ? match.pseudo_B : "À déterminer"}
          </p>
          {hasResult && (
            <p className={`text-xs font-bold ${bWon ? "text-[var(--color-gold)]" : "opacity-60"}`}>
              {match.score_B ?? "—"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicTournament;
