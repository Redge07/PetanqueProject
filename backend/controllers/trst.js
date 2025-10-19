if (adversaire) {
  connection.query(
    "update players set id_versus = ?, class = ?, num_match = ? where numero = ? and id_tournament = ?",
    [adversaire.numero, tour / 2, adversaire.num_match, win, req.params.id],
    () => {
      connection.query(
        "update players set id_versus = ? where numero = ? and id_tournament = ?",
        [win, adversaire.numero, req.params.id],
        () => handleLooser()
      );
    }
  );
} else {
  connection.query(
    "update players set id_versus = 0, class = ?, num_match = ? where numero = ? and id_tournament = ?",
    [tour / 2, num_match, win, req.params.id],
    () => handleLooser()
  );
}


if (adversaire) {
  connection.query(
    "update players set id_versus = ?, class = ?, round = 4, num_match = ? where numero = ? and id_tournament = ?",
    [
      adversaire.numero,
      infosArbre[2] / 2,
      adversaire.num_match,
      win,
      req.params.id,
    ],
    () => {
      connection.query(
        "update players set id_versus = ? where numero = ? and id_tournament = ?",
        [win, adversaire.numero, req.params.id],
        () => handleLooser()
      );
    }
  );
} else {
  connection.query(
    "update players set id_versus = 0, class = ?, round = 4, num_match = ? where numero = ? and id_tournament = ?",
    [nb_matchs, num_match, win, req.params.id],
    () => handleLooser()
  );
}


if (adversaire) {
  connection.query(
    "update players set id_versus = ?, class = ?, round = 4, num_match = ? where numero = ? and id_tournament = ?",
    [
      adversaire.numero,
      infosArbre[2] / 2,
      adversaire.num_match,
      win,
      req.params.id,
    ],
    () => {
      connection.query(
        "update players set id_versus = ? where numero = ? and id_tournament = ?",
        [win, adversaire.numero, req.params.id],
        () => handleLooser()
      );
    }
  );
} else {
  connection.query(
    "update players set id_versus = 0, class = ?, round = 4, num_match = ? where numero = ? and id_tournament = ?",
    [infosArbre[2] / 2, num_match, win, req.params.id],
    () => handleLooser()
  );
}


if (adversaire) {
  connection.query(
    "update players set id_versus = ?, class = ?, round = 4, num_match = ? where numero = ? and id_tournament = ?",
    [
      adversaire.numero,
      infosArbre[2] / 2,
      adversaire.num_match,
      win,
      req.params.id,
    ],
    () => {
      connection.query(
        "update players set id_versus = ? where numero = ? and id_tournament = ?",
        [win, adversaire.numero, req.params.id],
        () => handleLooser()
      );
    }
  );
} else {
  connection.query(
    "update players set id_versus = 0, class = ?, round = 4, num_match = ? where numero = ? and id_tournament = ?",
    [infosArbre[2] / 2, num_match, win, req.params.id],
    () => handleLooser()
  );
}
