import axios from "axios";
import React, { useEffect, useState } from "react";
import MyTournament from "./MyTournament";

const Participant = ({ player }) => {
  // State pour contenir le tournoi qui a été trouver grace à l'id dans la recherche de tournoi
  const [tournament, setTournament] = useState({});
  // State qui va contenir le tournoi sur lequel le joueur est inscrit en direct
  const [tournamentActuel, setTournamentActuel] = useState({ res: 0 });
  // State qui gère l'apparition du formulaiure pour pouvoir s'inscrire a un tournoi, évidemment le tournoi est celui qu'on a trouvé grace a l'id au préalable
  const [formulaire, setFormulaire] = useState(false);
  // State qui va contenir l'id du tournoi qu'on a trouvé en recherchant un tournoi
  const [idTournament, setIdTournament] = useState();
  // State qui contenir la réponse de l'api quand on voudra s'inscrire a un tournoi, soit on a réussi a s'inscrire au tournoi, soit le joueur est deja inscrit a un autre tournoi
  const [resForm, setResForm] = useState("");
  // State qui gère l'apparition du formulaire pour trouver un tournoi (donc avec la volonté de vouloir s'inscrire)
  const [searchTournament, setSearchTournament] = useState(true);
  // Fonction trouver un tournoi grace a l'id, le joueur cherche un tournoi avec l'id, et quand il valide, on lui renvoie le tournoi auquel correspond l'id
  const handleSearch = (e) => {
    e.preventDefault();
    axios
      .get(
        "http://localhost:5000/get_tournament_players/" +
          e.target.elements.tournoi.value
      )
      .then((res) => {
        setTournament(res.data);
      });
  };

  // Fonction quand on valide le formulaire d'inscription a un tournoi, si le joueur est inscrit on lance la fonction recharge, pour afficher le fait que le joueur participe bien a un tournoi
  const handleInscrire = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:5000/add_player/" + idTournament, {
        pseudo: e.target.elements.pseudo.value,
        iduser: player.id,
      })
      .then((res) => {
        setResForm(res.data);
        if (res.data.res == 1) {
          recharge();
        }
      });
  };

  // Fonction pour se retirer soit meme d'un tournoi
  const handleRetirer = async (value) => {
    await axios.delete(
      "http://localhost:5000/delete_player_tournament_via_iduser/" + value
    );
    recharge();
  };

  // Fonction qui charge la page et donc pour vérifier si le joueur participe a un tournoi
  const recharge = () => {
    axios
      .get("http://localhost:5000/get_tournament_user/" + player.id)
      .then((res) => {
        setFormulaire(false);
        setTournament(false);
        setTournamentActuel(res.data);
        // Si le joueur participe bien a un tournoi alors on enlève le fait de vouloir trouver un tournoi pour s'inscrire car le joueur est du coup deja inscrit a un tournoi
        if (res.data.res == 1) {
          setSearchTournament(false);
        } else {
          // Sinon a on affiche bien le fait de vouloir trouver un tournoi pour s'inscrire
          setSearchTournament(true);
        }
      });
  };

  useEffect(() => {
    recharge();
  }, []);

  return (
    <div>
      <h1>Participant</h1>
      {/* Afficher le formulaire pour rechercher un tournoi avec l'id */}
      {searchTournament && (
        <div>
          {/* Formulaire pour chercher un tournoi */}
          <form onSubmit={handleSearch}>
            <input
              type="text"
              name="tournoi"
              placeholder="Entrer l'id du tournoi..."
            />
            <input type="submit" value="Chercher" />
          </form>

          {/* Si la recherche a abouti et donc trouver un tournoi existant, alors on affiche le tournoi en question */}
          {tournament.res == 1 && (
            <ul>
              <li>{tournament.results[0].name}</li>
              <button
                onClick={() => {
                  setFormulaire(true);
                  setIdTournament(tournament.results[0].id);
                }}
              >
                Participer
              </button>
            </ul>
          )}
          {/* Sinon il n'y a pas de tournoi qui correspond */}
          {tournament.res == 0 && (
            <p>Aucun tournoi ne correspond a cette identifiant</p>
          )}
          {/* Si on a bien trouver un tournoi pour la recherche, on fait apparaitre le form pour s'inscrire */}
          {formulaire && (
            <form onSubmit={handleInscrire}>
              <input
                type="text"
                minLength="3"
                placeholder="Entrez votre pseudo..."
                name="pseudo"
              />
              <input type="submit" value={"S'inscrire"} />
              <button onClick={() => setFormulaire(false)}>Stop</button>
            </form>
          )}
          {/* Nous dit si la réponse de l'api pour inscrire un joueur (oui ou alors non car le joueur est deja inscrit) */}
          {/* <p>{resForm.msg}</p> */}
        </div>
      )}
      {tournamentActuel.res == 0 ? (
        <p>Vous ne participez a aucun tournoi actuellement</p>
      ) : (
        <div>
          {tournamentActuel.results.name}{" "}
          <div>
            {tournamentActuel.valider == 1 ? (
              <MyTournament player={player} idT={tournamentActuel.results.id} />
            ) : (
              <div>
                <p>En attente</p>
                <button onClick={() => handleRetirer(player.id)}>
                  Se retirer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Participant;
