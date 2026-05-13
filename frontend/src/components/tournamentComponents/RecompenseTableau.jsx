import React, { useEffect } from "react";

const RecompenseTableau = ({ matches }) => {
  useEffect(() => {
    console.log(matches);
    console.log([...new Set(matches.map((m) => m.class))]);
    console.log([...new Set(matches.map((m) => m.groupe))]);
  }, [matches]);
  return (
    <div>
      <div className="flex gap-2">
        <span>X</span>
        {[...new Set(matches.map((m) => m.class))].map((c) => (
          <span key={c}>{c}</span>
        ))}
      </div>
    </div>
  );
};

export default RecompenseTableau;
