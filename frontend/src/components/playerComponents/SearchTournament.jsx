import axios from "axios";
import React, { useContext, useState } from "react";
import { linkBackend } from "../../constants/LinkBackend";
import { UsersContext } from "../../App";
import { Search } from "lucide-react";

const SearchTournament = ({ player, recharge }) => {
  // State qui va récupérer le tournoi qui a été chercher dans la barre de recherche pour vouloir s'inscrire a un tournoi, -1 par défaut pour dire que aucune recherche n'a été essayer, 0 pour dire que le résultat de la recherche n'a pas trouvé de tournoi correspondant a cette id, 1 a trouver un tournoi qui correspond a cette id et 2 qui dit que le tournoi a été trouver mais a deja commencé
  const [dataTournament, setDataTournament] = useState({ res: -1 });
  // Récupérer un petit message pour dire que l'utilisateur a bien été inscrit au tournoi
  const [responseInscription, setResponseInscription] = useState("");
  const { setLoad, setError } = useContext(UsersContext);
  // Fonction pour récupérer le tournoi trouver grace a la recherche (quand on veut trouver un tournoi pour s'inscrire)
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoad(true);
    const idSearch = e.target.elements.id.value;
    try {
      const res = await axios.get(linkBackend + "players/search/" + idSearch);
      setDataTournament(res.data);
    } catch (err) {
      setError(true);
      console.log(err);
    } finally {
      recharge();
    }
  };
  // Fonction pour s'inscrire a un tournoi
  const handleInscrire = async (e) => {
    setLoad(true);
    e.preventDefault();
    const pseudo = e.target.elements.pseudo.value;
    try {
      const res = await axios.post(linkBackend + "players/", {
        idUser: player.id,
        idTournament: dataTournament.id,
        pseudo: pseudo,
      });
      setResponseInscription(res.data.res);
    } catch (err) {
      setError(true);
      console.log(err);
    } finally {
      recharge();
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
      <p className="text-[var(--color-gray)] mb-4">
        Vous ne participez à aucun tournoi
      </p>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="number"
          name="id"
          placeholder="Rechercher un tournoi avec son id..."
          required
          className="flex-1 h-12 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 text-[var(--color-primary)] placeholder-[var(--color-gray-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
        />
        <input
          type="submit"
          value="Chercher"
          className="h-12 px-6 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white rounded-xl font-medium cursor-pointer hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-all duration-300"
        />
      </form>

      {/* Après avoir cherché un tournoi, l'id ne correspond a aucun tournoi */}
      {dataTournament.res == 0 && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl p-3">
          Cette id ne correspond à aucun tournoi
        </p>
      )}

      {/* On a trouvé le tournoi, on propose de s'inscrire en tapant un pseudo et de s'inscrire */}
      {dataTournament.res == 1 && (
        <div className="mt-4 p-4 bg-[var(--color-bg-mid)] rounded-xl border border-[var(--color-gold)]/20">
          <p className="font-semibold text-[var(--color-primary)] mb-1">
            {dataTournament.name}
          </p>
          <p className="text-sm text-[var(--color-gray)] mb-4">
            Mode {dataTournament.style}
          </p>
          <form onSubmit={handleInscrire} className="flex gap-2">
            <input
              type="text"
              name="pseudo"
              placeholder="Entrer votre pseudo"
              required
              className="flex-1 h-12 px-4 rounded-xl border border-[var(--color-border)] bg-white text-[var(--color-primary)] placeholder-[var(--color-gray-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
            <input
              type="submit"
              value="S'inscrire"
              className="h-12 px-6 bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white rounded-xl font-medium cursor-pointer hover:opacity-90 transition-all duration-300"
            />
          </form>
          {responseInscription && (
            <p className="mt-3 text-sm text-[var(--color-primary)] bg-white rounded-xl p-3">
              {responseInscription}
            </p>
          )}
        </div>
      )}

      {/* On a trouvé un tournoi mais il a deja commencé donc on ne peut pas s'inscrire */}
      {dataTournament.res == 2 && (
        <p className="text-sm text-[var(--color-gray)] bg-[var(--color-bg-mid)] rounded-xl p-3 mt-4">
          Le tournoi {dataTournament.name} à déja commencé, vous ne pouvez pas y
          participer
        </p>
      )}
    </div>
  );
};

export default SearchTournament;
