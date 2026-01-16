const { createArbre } = require("../constants/createArbre");
const { query } = require("../constants/query");
const { updatePlayers } = require("../constants/updatePlayers");

exports.goTournamentArbre = async (req, res) => {
  console.log("bonsoir");

  try {
    const idTournament = req.params.id;
    const listPlayers = await query(
      "select * from players where id_tournament = ? and valider = 1",
      [idTournament]
    );
    if (listPlayers.length < 2)
      return res.status(200).send("Il faut au moins 2 joueurs");
    await query("update tournaments set start = ? where id = ?", [
      1,
      idTournament,
    ]);
    await query("delete from players where id_tournament = ? and valider = 0", [
      idTournament,
    ]);

    let { prelim, p2, tirage, number } = await createArbre(
      listPlayers,
      idTournament,
      true
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
        `update matches2 set id_player${lettre} = ?, pseudo_${lettre} = ? where id_tournament = ? and number = ?`,
        [listPlayers[i].numero, listPlayers[i].pseudo, idTournament, number]
      );
      number++;
    }

    await updatePlayers(
      [
        ...listPlayers.map((player) => player.numero),
        ...tirage.map((player) => player.numero),
      ],
      idTournament
    );

    return res.status(200).send("Oui");
  } catch (err) {
    return res.status(500).send(err);
  }
};
