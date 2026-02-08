const { query } = require("./query");
const { Expo } = require("expo-server-sdk");

const expo = new Expo();

// Fonction pour mettre a jour les données d'un joueur dans la table players, au final c'est juste copié coller par rapport aux infos qu'il y a dans la table matches 2 car c'est vraiment la table de vérité sur laquelle tout se base
exports.updatePlayers = async (list_id, idTournament) => {
  // On récupère tous les matches du tournoi qui sont en cours ou y'a au moins le joueur A de rempli dans le match en question
  const tournament = await query(
    "select * from matches2 where (end = 0 or end = -1) and id_tournament = ?",
    [idTournament],
  );
  // Nouvelle liste qui représentera vraiment les joueurs a maj parce que un joueur un joueur implique le fait le fait de mettre a joueur son adversaire aussi
  let new_list_id = [...list_id];
  list_id.forEach((id) => {
    const match = tournament.find(
      (match) => match.id_playerB == id && match.end == 0,
    );
    // Si il est joueur B ça veut dire qu'il a un joueur A en face de lui et donc faudra mettre a jour ce joueur A
    if (match) new_list_id.push(match.id_playerA);
  });
  // On met a jour tous les jours du tableau
  for (let i = 0; i < new_list_id.length; i++) {
    const id = new_list_id[i];
    // On trouve le match ou le joueur est dans un match en cours
    const match = tournament.find(
      (match) => match.id_playerA == id || match.id_playerB == id,
    );
    // Si on trouve le match
    if (match) {
      // Il faut renseigner son adversaire
      // Si y'a un joueur B dans son match actuel alors faut savoir si le joueur est le joueur B ou A, si c'est le joueur A alors l'adversaire est le joueur B et vice versa
      const id_versus = match.id_playerB
        ? match.id_playerA == id
          ? match.id_playerB
          : match.id_playerA
        : // Si pas de joueur B dans le match alors le joueur est le joueur A et donc il n'a pas d'adversaire
          0;
      await query(
        "update players set id_versus = ?, class = ?, round = ?, groupe = ?, dispo = ?, barrage = ? where numero = ? and id_tournament = ?",
        [
          id_versus,
          match.class,
          match.round,
          match.groupe,
          match.end ? 0 : 1,
          match.barrage,
          id,
          idTournament,
        ],
      );
      const player = await query(
        "select * from players where numero = ? and id_tournament = ?",
        [id, idTournament],
      );
      console.log("user");

      console.log(player);

      // Si le joueur est un vrai utilisateur
      if (player[0].id_user > 0) {
        console.log("bonsoir3");

        const token = await query(
          "select token from push_tokens where user_id = ?",
          [player[0].id_user],
        );
        console.log(token);

        if (token[0].token) {
          console.log("bonsoir");

          if (Expo.isExpoPushToken(token[0].token)) {
            console.log("bonsoir2");

            // Envoyer une notification push pour dire que le match du joueur a commencé
            const messages = [
              {
                to: token[0].token,
                sound: "default",
                title: "L'aventure continue !",
                body: "Votre match a commencé, rendez-vous dans l'application pour voir votre adversaire et le score en direct !",
              },
            ];
            expo.sendPushNotificationsAsync(messages);
          }
        }
        // Si on n'a pas trouvé de match en cours pour le joueur ça veut tout simplement dire qu'il a été éliminé du tournoi et qu'il faut le supprimer
      }
    } else {
      await query(
        "delete from players where id_tournament = ? and numero = ?",
        [idTournament, id],
      );
    }
  }
};
