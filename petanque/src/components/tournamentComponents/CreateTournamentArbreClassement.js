import React from "react";

const CreateTournamentArbreClassement = ({
  handleGoArbreClassement,
  errorLengthArbre,
}) => {
  return (
    <div>
      <form onSubmit={handleGoArbreClassement}>
        {["A", "B", "C"].map((g) => {
          return (
            <div>
              <span>Taille de l'arbre du groupe {g}</span>
              <select name={g} defaultValue={g === "A" ? "8" : "0"}>
                {g == "A" ? null : <option value="0">Pas de tournoi</option>}
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="4">4</option>
                <option value="8">8</option>
                <option value="16">16</option>
                <option value="32">32</option>
              </select>
              <br />
            </div>
          );
        })}
        <input type="submit" value="Go Tournoi en arbres" />
      </form>
      <p>{errorLengthArbre}</p>
    </div>
  );
};

export default CreateTournamentArbreClassement;
