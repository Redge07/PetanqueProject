const { createArbre } = require("../../constants/createArbre");
const { query } = require("../../constants/query");
const { updatePlayers } = require("../../constants/updatePlayers");

exports.goTournamentArbre = async (req, res) => {
  try {
    const idTournament = req.params.id;
    let listPlayers = [];
    let groupe = "";
    const body = Object.keys(req.body || {}).length;
    if (!body) {
      listPlayers = await query(
        "select * from players where id_tournament = ? and valider = 1",
        [idTournament],
      );
      if (listPlayers.length < 2)
        return res.status(200).send("Il faut au moins 2 joueurs");
      await query("update tournaments set start = ? where id = ?", [
        1,
        idTournament,
      ]);
      await query(
        "delete from players where id_tournament = ? and valider = 0",
        [idTournament],
      );
    } else {
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
      if (listPlayers.length == 1) {
        await query(
          "update players set id_versus = 0, class = ? where id_tournament = ? and numero = ?",
          [0.5, idTournament, listPlayers[0].numero],
        );
        await query(
          `update tournaments set vainqueur${groupe} = ? where id = ?`,
          [listPlayers[0].pseudo, idTournament],
        );
        if (groupe == "C")
          await query(
            "delete from players where id_versus = 0 and id_tournament = ?",
            [idTournament],
          );
        return res.status(200).send("Oui");
      }
      if (!listPlayers.length) {
        if (groupe == "C")
          await query(
            "delete from players where id_versus = 0 and id_tournament = ?",
            [idTournament],
          );
        return res.status(200).send("pas de joueur pour ce groupe");
      }
    }

    let { prelim, p2, tirage, number } = await createArbre(
      listPlayers,
      idTournament,
      true,
      body ? 4 : 0,
      body ? groupe : "",
    );

    // Les matches préliminaire ont été crée et rempli de joueur, il faut maintenant ajouter les quelques joueurs qui attendent au tour d'apres
    const numberStart = prelim / 2 + 1;
    number = numberStart;
    let lettre = "A";

    for (let i = 0; i <= listPlayers.length - 1; i++) {
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

    await updatePlayers(
      [
        ...listPlayers.map((player) => player.numero),
        ...tirage.map((player) => player.numero),
      ],
      idTournament,
    );

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
