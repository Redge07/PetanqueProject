const { query } = require("../constants/query");

const status = {
  noStart: 0,
  start: 1,
  end: 2,
};

// API pour récupérer toutes les information d'un tournoi en particulier
exports.charge = async (req, res) => {
  try {
    const idTournament = req.params.id;
    const tournament = (
      await query("select * from tournaments where id = ?", [idTournament])
    )[0];
    // On regarde si le tournoi a déjà des vainqueurs enregistré
    const vainqueurs = {
      vainqueurA: tournament.vainqueurA,
      vainqueurB: tournament.vainqueurB,
      vainqueurC: tournament.vainqueurC,
    };
    // Si le tournoi n'a pas encore commencé
    if (tournament.start == 0) {
      // On récupère tous les joueurs qui sont en lien avec ce tournoi
      const listPlayers = await query(
        "select * from players where id_tournament = ?",
        [idTournament],
      );
      return res.status(200).json({
        res: status.noStart,
        results: listPlayers,
        style: tournament.style,
      });
    }
    // Sinon ça veut dire que le tournoi a bien commencé et que les matches ont déjà eté généré, donc on récupère ces matches
    const matches = await query(
      "select * from matches2 where id_tournament = ?",
      [idTournament],
    );
    // Si le tournoi est en cours
    if (tournament.start == 1) {
      return res.status(200).json({
        res: status.start,
        matches,
        style: tournament.style,
        vainqueurs,
      });
    }
    // Si le tournoi est fini (c'est les cas que pour le tournoi en arbre)
    if (tournament.start == 2) {
      return res
        .status(200)
        .json({ res: status.end, matches, vainqueur: tournament.vainqueur });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};

// API pour récupérer le classement d'un tournoi en mode classement, ça nous renvoie tous les joueurs avec leurs points actuel
exports.charge_classement = async (req, res) => {
  try {
    const idTournament = req.params.id;
    // On récupère tous les matches qui sont en phase de poule, tous les matches sont déjà rempli de joueurs car des le début du tournoi tous les joueurs savent leurs 3 adversaires de poule
    const matches = await query(
      "select * from matches2 where id_tournament = ? and round < 4",
      [idTournament],
    );
    // A l'aide des matches du tournoi qui ont été généré on peut calculer le nombre de points des joueurs, on déclare un tableau vide qui se remplira des joueurs qui participent au tournoi
    let players = [];
    // On va itérer chaque match
    matches.forEach((match) => {
      // On va d'abord ce concentrer sur le joueur A de ce match en question (peut etre qu'il faudra l'enregistré dans le tableau players ou alors mettre a jour ses données si il est deja dans le tableau players)
      let playerA = players.find((p) => p.numero == match.id_playerA);
      // Si on a pas trouvé le joueur A du match en question dans le tableau players alors il faut l'enregistré dans le tableau et on peut enregistré toutes ces caractéristique car c'est le joueur qui représente le joueur A dans ce match en question
      if (!playerA) {
        players.push({
          numero: match.id_playerA,
          pseudo: match.pseudo_A,
          points:
            match.id_winner == match.id_playerA
              ? match.score_A + 5
              : match.score_A,
          // Si le match a déjà un gagnant on peut noter que ce joueur a déjà fait un match, on note seulement 1 match pour l'instant car c'est la première fois qu'on le chope dans l'itération des matches. Peut etre qu'il a fait 2 match mais ça on le notera plus tard si on le revoie dans un match en continuant l'itération
          nb_matchs_jouer: match.id_winner > 0 ? 1 : 0,
        });
        // Sinon ça veut dire qu'on avait déjà enregistré le joueur A dans la tableau players et que la on la retrouvé dans un autre match
        // Si le match auquel on la retrouvé une deuxième fois a un gagnant ça veut dire qu'il faut donc mettre a jour ses infos car on sait qu'il a fait un match supplémentaires.
        // Si ce match n'a pas de gagnant on peut s'arreter la pour le joueur A du match car on n'a rien a mettre a jour
      } else if (match.id_winner > 0) {
        // Donc on avait récupéré le joueur dans le tableau players et on a toutes infos qui manque d'etre mis a jour
        // On récupére donc ces points actuel et ces matches joué qui vont etre actualisé grace au match auquel on est dans l'itération
        const points = playerA.points;
        const nb_matchs_jouer = playerA.nb_matchs_jouer;
        playerA.points =
          points +
          (match.id_winner == playerA.numero
            ? match.score_A + 5
            : match.score_A);
        playerA.nb_matchs_jouer = nb_matchs_jouer + 1;
      }
      // Donc la on a tout fait pour la joueur A du match en question (on l'a enregistré dans le tableau ou on a mis ces infos a jour)
      // Maintenant on passe au joueur B du match en question
      let playerB = players.find((p) => p.numero == match.id_playerB);
      // Si le joueur B ne fait pas parti du tableau players alors faut l'enregistré
      if (!playerB) {
        players.push({
          numero: match.id_playerB,
          pseudo: match.pseudo_B,
          points:
            match.id_winner == match.id_playerB
              ? match.score_B + 5
              : match.score_B,
          nb_matchs_jouer: match.id_winner > 0 ? 1 : 0,
        });
        // Sinon on met a jour ces infos si le match en question est deja fini
      } else if (match.id_winner > 0) {
        const points = playerB.points;
        const nb_matchs_jouer = playerB.nb_matchs_jouer;
        playerB.points =
          points +
          (match.id_winner == playerB.numero
            ? match.score_B + 5
            : match.score_B);
        playerB.nb_matchs_jouer = nb_matchs_jouer + 1;
      }
    });
    return res.status(200).json(players);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};

// API pour supprimer la demande d'un utilisateur qui souhaite participer au tournoi
exports.delete_players_attente = async (req, res) => {
  try {
    const idUser = req.params.id;
    await query("delete from players where id_user = ?", [idUser]);
    return res.status(200).json({
      res: 1,
      id: idUser,
      msg: "Le joueur a été supprimé du tournoi",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};

// API pour supprimer un joueur qu'on a inscrit au tournoi de manière officiel
exports.delete_players_valid = async (req, res) => {
  try {
    const { numero } = req.body;
    const idTournament = req.params.id;
    await query("delete from players where numero = ? and id_tournament = ?", [
      numero,
      idTournament,
    ]);
    return res.status(200).json({
      res: 1,
      numero: req.body.numero,
      msg: "Le joueur a été supprimé du tournoi",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};

// API pour accepter la demande d'un utilisateur pour participer au tournoi
exports.valid = async (req, res) => {
  try {
    const idTournament = req.params.id;
    const idUser = req.body.id_user;
    const listPlayers = await query(
      "select * from players where id_tournament = ? and valider = 1",
      [idTournament],
    );
    await query(
      "update players set valider = 1, numero = ? where id_user = ?",
      [listPlayers.length + 1, idUser],
    );
    return res.status(200).json({
      res: 1,
      id: idTournament,
      msg: "Le joueur a été ajouté au tournoi",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};

// API pour ajouté un joueur au tournoi (un joueur virtuel sans compte utilisateur)
exports.add_player = async (req, res) => {
  try {
    const { pseudo } = req.body;
    const idTournament = req.params.id;
    const listPlayers = await query(
      "select * from players where id_tournament = ? and valider = 1",
      [idTournament],
    );
    await query(
      "insert into players (pseudo, id_versus, class, id_tournament, id_user, valider, numero) values(?, 0, 0, ?, -1, 1, ?)",
      [pseudo, idTournament, listPlayers.length + 1],
    );
    return res.status(200).send("Le joueur a été ajouté");
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};
