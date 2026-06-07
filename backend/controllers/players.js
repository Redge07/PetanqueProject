const { query } = require("../constants/query");
const status = {
  player: {
    notPlay: 0,
    Waiting: 1,
    WaitingStart: 2,
    playing: 3,
    Winner: 4,
  },
  tournament: {
    noExist: 0,
    noStart: 1,
    End: 2,
  },
};

// API pour récupérer la situation d'un utilisateur sur sa situation de joueur
exports.charge = async (req, res) => {
  try {
    const idPlayer = req.params.id;
    const playerTab = await query("select * from players where id_user = ?", [
      idPlayer,
    ]);
    // Si le tableau est vide ça veut dire que l'utilisateur ne participe à aucun tournoi
    if (playerTab.length == 0)
      return res.status(200).json({ res: status.player.notPlay });
    // Sinon il participie bien à un tournoi
    const player = playerTab[0];
    // On en profite pour récupérer le tournoi auquel il participe
    const tournament = (
      await query("select style, name, start from tournaments where id = ?", [
        player.id_tournament,
      ])
    )[0];

    // Variable binaire pour savoir si les caractéristique du joueur sont celles d'un vainqueur de tournoi
    const isWinner =
      (player.class == 0.5 &&
        (tournament.style != "cascade" ||
          (player.groupe != "B" && player.groupe != "B2"))) ||
      player.class == 0.25;
    // Si c'est bien un vainqueur alors on envoie la réponse pour dire qu'il est le vainqueur
    if (isWinner) {
      return res.status(200).json({
        res: status.player.Winner,
        msg: "Félicitations vous etes le grand vainqueur",
      });
    }
    // Si le joueur a fait ça demande mais n'a pas encore été accepté
    if (player.valider == 0) {
      return res.status(200).json({
        res: status.player.Waiting,
        tournamentName: tournament.name,
        style: tournament.style,
      });
    }
    // Si le joueur a été accepté mais le tournoi n'as pas encore commencé
    if (tournament.start == 0) {
      return res.status(200).json({
        res: status.player.WaitingStart,
        numero: player.numero,
        tournamentName: tournament.name,
        style: tournament.style,
      });
    }
    // Le joueur est dans un tournoi en cours et on voit si il a un adversaire actuellement
    const adversaireTab = await query(
      "select * from players where numero = ? and id_tournament = ?",
      [player.id_versus, player.id_tournament],
    );
    const adversaire = adversaireTab.length == 0 ? null : adversaireTab[0];
    return res.status(200).json({
      res: status.player.playing,
      ...player,
      tournamentName: tournament.name,
      style: tournament.style,
      idVersus: adversaire ? adversaire.numero : null,
      pseudoVersus: adversaire ? adversaire.pseudo : null,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ res: -1 });
  }
};

// API quand un joueur souhaite rechercher un tournoi dans le but de s'inscrire
exports.search = async (req, res) => {
  try {
    const idTournament = req.params.id;
    const tournamentTab = await query(
      "select * from tournaments where id = ?",
      [idTournament],
    );
    // Si le tableau est vide alors aucun tournoi ne correspond à l'id envoyé
    if (tournamentTab.length == 0)
      return res.status(200).json({ res: status.tournament.noExist });
    const tournament = tournamentTab[0];
    // Le tournoi existe et n'a pas commencé
    if (tournament.start == 0) {
      return res.status(200).json({
        res: status.tournament.noStart,
        id: tournament.id,
        name: tournament.name,
        style: tournament.style,
      });
      // Le tournoi à malheureusement déjà commencé
    } else {
      return res
        .status(200)
        .json({ res: status.tournament.End, name: tournament.name });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ res: -1 });
  }
};

// API qui inscrit la demande d'un joueur a un tournoi
exports.add_player = async (req, res) => {
  try {
    const { idUser, idTournament, pseudo } = req.body;
    await query(
      "insert into players (pseudo, id_versus, class, id_tournament, id_user, valider) values (?, 0, 0, ?, ?, 0)",
      [pseudo, idTournament, idUser],
    );
    return res.status(200).json({
      res: "Vous avez été ajouté au tournoi numéro " + idTournament,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      res: -1,
    });
  }
};

// API pour rechercher des concours par nom (texte libre)
exports.searchByName = async (req, res) => {
  try {
    const name = req.params.name;
    const tournaments = await query(
      `SELECT t.id, t.name, t.style,
        (SELECT COUNT(*) FROM players p WHERE p.id_tournament = t.id AND p.valider = 1) AS nb_joueurs
       FROM tournaments t
       WHERE t.name LIKE ? AND t.start = 0
       ORDER BY t.id DESC LIMIT 15`,
      [`%${name}%`],
    );
    return res.status(200).json(tournaments);
  } catch (err) {
    return res.status(500).json({ res: -1 });
  }
};

// API pour lister tous les concours disponibles (non commencés)
exports.listAvailable = async (req, res) => {
  try {
    const tournaments = await query(
      `SELECT t.id, t.name, t.style,
        (SELECT COUNT(*) FROM players p WHERE p.id_tournament = t.id AND p.valider = 1) AS nb_joueurs
       FROM tournaments t
       WHERE t.start = 0
       ORDER BY t.id DESC LIMIT 20`,
    );
    return res.status(200).json(tournaments);
  } catch (err) {
    return res.status(500).json({ res: -1 });
  }
};

// API qui désinscrit un joueur d'un tournoi
exports.delete_player = async (req, res) => {
  try {
    await query("delete from players where id_user = ?", [req.params.id]);
    return res
      .status(200)
      .json({ res: "Vous vous etes désinscrit du tournoi" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ res: -1 });
  }
};
