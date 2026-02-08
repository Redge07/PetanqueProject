const { createArbre } = require("../../constants/createArbre");
const { query } = require("../../constants/query");
const { updatePlayers } = require("../../constants/updatePlayers");

// API pour lançer officiellement un tournoi en mode arbre
exports.goTournamentArbre = async (req, res) => {
  try {
    const idTournament = req.params.id;
    let listPlayers = [];
    let groupe = "";
    let round = 0;
    const body = Object.keys(req.body || {}).length;
    console.log(body);

    // Si on a pas envoyé un body à l'API alors ça veut dire qu'on lançe un arbre classique
    if (!body) {
      // On récupère tous les joueurs inscrit du tournoi
      listPlayers = await query(
        "select * from players where id_tournament = ? and valider = 1",
        [idTournament],
      );
      // On accepte pas de lançer le tournoi si on voit qu'il y a moins de 2 joueurs inscrit
      if (listPlayers.length < 2)
        return res.status(200).send("Il faut au moins 2 joueurs");
      await query("update tournaments set start = ? where id = ?", [
        1,
        idTournament,
      ]);
      // Comme on lançe le tournoi avec les joueurs inscrit on peut supprimer les joueurs qui avaient fait la demande d'inscription qui ont pas été inscrit
      await query(
        "delete from players where id_tournament = ? and valider = 0",
        [idTournament],
      );
      // Si il y a bien un body envoyé à l'API alors ça veut dire qu'on lançe un arbre mais dans le mode du tournoi en classement, on lançe un arbre pour un groupe précis (groupe A, B ou C)
    } else {
      round = 4;
      // Si on crée pour le groupe A, alors qon initialise la variable groupe à "A" et on prend la listPlayers de ce tournoi en arbre précis sera avec la listPlayers des joueurs du groupe "A"
      if (req.body.listPlayersA) {
        console.log("groupeA");

        listPlayers = req.body.listPlayersA;
        groupe = "A";
        console.log(listPlayers);
      } else if (req.body.listPlayersB) {
        console.log("groupeB");
        listPlayers = req.body.listPlayersB;
        groupe = "B";
        console.log(listPlayers);
      } else if (req.body.listPlayersC) {
        console.log("groupeC");
        listPlayers = req.body.listPlayersC;
        groupe = "C";
        console.log(listPlayers);
      }
      // Si la listPlayers du groupe en question ne contient seulement un joueur alors on déclare cette unique joueur comme vainqueur de son groupe (on modifie le joueur, on ajoute le vainqueur du groupe dans la table tournaments)
      if (listPlayers.length == 1) {
        await query(
          "update players set id_versus = 0, class = ? where id_tournament = ? and numero = ?",
          [0.5, idTournament, listPlayers[0].numero],
        );
        await query(
          `update tournaments set vainqueur${groupe} = ? where id = ?`,
          [listPlayers[0].pseudo, idTournament],
        );
        // Si on est dans le groupe C ça veut dire qu'on a déjà crée les tournoi en arbre du groupe A et B et que on peut supprimer tous les joueurs qui ont pas été selectionné pour faire les tournoi des groupes A, B et C
        if (groupe == "C")
          await query(
            "delete from players where id_versus = 0 and id_tournament = ?",
            [idTournament],
          );
        return res.status(200).send("Oui");
      }
      // Si le groupe n'a pas de joueur, c'est qu'on ne souhaite pas faire de tournoi pour ce groupe
      if (!listPlayers.length) {
        // Pareil si c'est on est au groupe C alors on supprimer tous les joueurs sélectionné
        if (groupe == "C")
          await query(
            "delete from players where id_versus = 0 and id_tournament = ?",
            [idTournament],
          );
        return res.status(200).send("pas de joueur pour ce groupe");
      }
    }
    // C'est le moment de créer le tournoi en arbre, que se soit pour un arbre classqiue ou l'arbre d'un groupe d'un tournoi en mode classement
    let { prelim, p2, tirage, number } = await createArbre(
      listPlayers,
      idTournament,
      true,
      round,
      groupe,
    );

    // Les matches préliminaire ont été crée et rempli de joueur, il faut maintenant ajouter les quelques joueurs qui attendent au tour d'apres
    // On récupère le numéro de match qui représente le début des matches apres les matches préliminaire
    const numberStart = prelim / 2 + 1;
    number = numberStart;
    let lettre = "A";
    // ListPlayers représente les joueurs qui attendent d'etre placé la phase au dessus des barrages, en envoyant a createArbre ça a vraiment modifié la variable d'origine
    for (let i = 0; i <= listPlayers.length - 1; i++) {
      // p2 représente le nombre de joueurs qui doivent etre dans la phase au-dessus, donc divisé par 2 c'est le nombre de matches (p2 = 8 alors 4 matches et donc quart de finale enfaite)

      // Si on arrive au joueur qui dépasse le nombre matches ça veut dire que tous les matches on deja leur joueur A, donc les prochains joueurs seront des joueurs B et le numéro recommence a numéro start car le joueur B affrontera un joueur A qui a déjà était placé, donc ils auront le meme numéro de match
      if (i == p2 / 2) {
        number = numberStart;
        lettre = "B";
      }
      await query(
        `update matches2 set id_player${lettre} = ?, pseudo_${lettre} = ? where id_tournament = ? and number = ? and groupe = ?`,
        [
          listPlayers[i].numero,
          listPlayers[i].pseudo,
          idTournament,
          number,
          groupe,
        ],
      );
      number++;
    }
    // Le joueur est placé dans la table matches et faut juste mettre ces infos a jour dans la table players
    await updatePlayers(
      [
        ...listPlayers.map((player) => player.numero),
        ...tirage.map((player) => player.numero),
      ],
      idTournament,
    );
    // On a fini de créer le tournoi pour le groupe en question, si c'est le groupe C alors faut supprimer les joueurs non sélectionnées pour la suite du tournoi

    if (groupe == "C")
      await query(
        "delete from players where id_versus = 0 and id_tournament = ?",
        [idTournament],
      );

    return res.status(200).send("Oui");
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};

const connection = require("../../config/db");

// API pour créer automatiquement X joueurs dans un tournoi donné
exports.create_players = (req, res) => {
  console.log("yo");

  const idTournament = req.params.id;
  const { nbPlayers, groupe = "A" } = req.body; // ex : { nbPlayers: 30 }

  if (!nbPlayers || nbPlayers < 2)
    return res.status(400).json({ message: "Nombre de joueurs invalide" });

  const players = [];
  for (let i = 1; i <= nbPlayers; i++) {
    players.push([
      `Test${i}`, // pseudo
      0, // id_versus
      nbPlayers, // class
      idTournament, // id_tournament
      -1, // id_user
      1, // valider
      i, // numero
      1, // round
      groupe, // groupe
      1, // num_match
      null, // barrage
    ]);
  }

  const sql = `
    INSERT INTO players
    (pseudo, id_versus, class, id_tournament, id_user, valider, numero, round, groupe, dispo, barrage)
    VALUES ?
  `;

  connection.query(sql, [players], (err) => {
    if (err) {
      console.error("Erreur SQL :", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({
      message: `${nbPlayers} joueurs créés pour le tournoi ${idTournament}`,
    });
  });
};
