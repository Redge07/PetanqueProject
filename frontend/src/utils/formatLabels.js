export const FORMAT_LABELS = {
  arbre: "Élimination directe",
  cascade: "Cascade",
  classement: "Poules + Finale",
};

export const getFormatLabel = (style) => FORMAT_LABELS[style] ?? style;
