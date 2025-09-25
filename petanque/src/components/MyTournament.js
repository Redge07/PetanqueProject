import axios from "axios";
import React, { useState, useEffect } from "react";

const MyTournament = ({ player, idT }) => {
  // Savoir les infos du joueur pour son tournoi
  const [dataPlayer, setDataPlayer] = useState({});
  // Savoir si le tournoi a commencé
  const [start, setStart] = useState(false);
  const getVersus = () => {
    axios
      .get("http://localhost:5000/get_versus_player/" + player.id)
      .then((res) => {
        setDataPlayer(res.data);
      });
  };
  useEffect(() => {
    axios
      .get("http://localhost:5000/verif_start_tournament/" + idT)
      .then((res) => {
        if (res.data == 1) {
          setStart(true);
          getVersus();
        }
      });
  }, []);
  return (
    <div>
      <h2>Mon tournoi</h2>
      {start ? (
        dataPlayer ? (
          <div>
            <p>Salut {dataPlayer?.pseudo}</p>
            <p>
              Tu es en 1/{dataPlayer?.tour} de finale contre{" "}
              {dataPlayer?.versus}
            </p>
          </div>
        ) : (
          <p>Chargement…</p>
        )
      ) : (
        <p>Pas commencé encore</p>
      )}
    </div>
  );
};

export default MyTournament;
