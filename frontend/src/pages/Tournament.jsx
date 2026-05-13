import React, { useEffect, useState, useContext, createContext } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { UsersContext } from "../App";
import axios from "axios";
import { linkBackend } from "../constants/LinkBackend";
import NoStartTournament from "../components/tournamentComponents/NoStartTournament";
import ArbreTournament from "../components/tournaments/ArbreTournament";
import Cascade from "../components/tournaments/Cascade";
import ClassementTournament from "../components/tournaments/ClassementTournament";
import createPaires from "../utils/CreatePaires";
import Map from "../components/tournamentComponents/Map";
import NotConnect from "../constants/NotConnect";
import { ChevronLeft, Trophy } from "lucide-react";

export const OrgaContext = createContext();

const Tournament = () => {
  // State qui récupère l'id de l'url pour savoir quel tournoi on doit afficher
  const { idTournament } = useParams();
  // State qui récupère une variable global pour savoir si on est connecté
  const { setLoad, setError, player } = useContext(UsersContext);
  const navigate = useNavigate();
  // State qui va récupérer tous les joueurs qui sont en lien avec le tournoi, vérifie aussi si le tournoi a commencé, si res = 0 alors le tournoi n'a pas commencé et on doit afficher les joueurs, sinon res = 1 et ca a commencé
  const [listPlayers, setListPlayers] = useState({});
  const [fullListPlayers, setFullListPlayers] = useState({});
  // State qui dit que tel joueur a gagné
  const [responseWin, setResponseWin] = useState("");
  // State qui va nous aider quand faudra afficher les matchs trié par leurs catégories
  const [pairesInfos, setPaireInfos] = useState({});
  const formatTournament = {
    arbre: ArbreTournament,
    cascade: Cascade,
    classement: ClassementTournament,
  };
  const TournamentComponent = formatTournament[listPlayers.style];

  // Fonction qui recharge la page, on sait si le tournoi a commencé et quels sont les joueurs qui y participe
  const recharge = async () => {
    setLoad(true);
    try {
      const res = await axios.get(linkBackend + "tournaments/" + idTournament);
      setFullListPlayers(res.data.matches);
      setResponseWin("");
      const filteredMatches = res.data.matches
        ? res.data.matches.filter(
            (match) => match.id_playerA && (!match.end || match.end == -1),
          )
        : [];

      setListPlayers({
        ...res.data,
        matches: filteredMatches,
      });
      // Fonction pour connaitre les groupes, round et tour qui se déroulent pour voir les trucs qu'on affiche seulement
      const { rounds, groupes, tours } = createPaires(filteredMatches);
      setPaireInfos({ rounds, groupes, tours });
    } catch (err) {
      setError(true);
      console.log(err);
      navigate("/");
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    recharge();
  }, []);

  if (!player) return <NotConnect />;

  return (
    // Comme on est un organisateur on définit une variable "orga" a true qui fera des diiferences entre un participant ou un organisateur qui affiche un tournoi
    <OrgaContext.Provider value={{ orga: true }}>
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-bg-mid)] to-[var(--color-bg-dark)]">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-xl flex items-center justify-center shadow-lg">
                <Trophy className="w-6 h-6 text-[var(--color-gold)]" />
              </div>
              <h2 className="text-2xl font-light text-[var(--color-primary)]">
                Tournoi <span className="font-semibold">#{idTournament}</span>
              </h2>
            </div>
            <NavLink
              to="/"
              className="flex items-center gap-2 text-[var(--color-gray)] hover:text-[var(--color-primary)] hover:bg-white/50 px-4 py-2 rounded-xl transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5" />
              Retour
            </NavLink>
          </div>

          {/* Si le tournoi n'a pas commencé on va afficher les joueurs en attente et accepté */}
          {listPlayers.res == 0 && (
            <NoStartTournament
              listPlayers={listPlayers}
              recharge={recharge}
              idTournament={idTournament}
              style={listPlayers.style}
            />
          )}

          {/* Le tournoi a commencé */}
          {listPlayers.res == 1 && (
            <div>
              <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-2xl p-6 text-white shadow-xl mb-6">
                <p className="text-[var(--color-gold)] text-sm font-medium mb-1">
                  Tournoi en cours
                </p>
                <h2 className="text-2xl font-semibold">
                  Mode {listPlayers.style}
                </h2>
                {responseWin && (
                  <p className="mt-2 text-white/80 text-sm">{responseWin}</p>
                )}
              </div>
              {TournamentComponent && (
                <TournamentComponent
                  fullListPlayers={fullListPlayers}
                  listPlayers={listPlayers}
                  pairesInfos={pairesInfos}
                  setResponseWin={setResponseWin}
                  idTournament={idTournament}
                  recharge={recharge}
                />
              )}
            </div>
          )}

          {/* Le tournoi est fini est on affiche le vainqueur */}
          {listPlayers.res == 2 && (
            <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-2xl p-8 shadow-xl text-center text-white">
              <div className="w-20 h-20 bg-[var(--color-gold)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-[var(--color-gold)]" />
              </div>
              <h1 className="text-2xl font-semibold">
                Le vainqueur est{" "}
                <span className="text-[var(--color-gold)]">
                  {listPlayers.vainqueur}
                </span>
              </h1>
            </div>
          )}

          <div className="mt-8">
            <Map idTournament={idTournament} />
          </div>
        </div>
      </div>
    </OrgaContext.Provider>
  );
};

export default Tournament;
