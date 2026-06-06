import { GitFork, Waves, ListOrdered, Trophy } from "lucide-react";

export const FORMAT_LABELS = {
  arbre: "Élimination directe",
  cascade: "Cascade",
  classement: "Poules + Finale",
};

export const getFormatLabel = (style) => FORMAT_LABELS[style] ?? style;

// Icône représentative de chaque format de concours
export const FORMAT_ICONS = {
  arbre: GitFork,
  cascade: Waves,
  classement: ListOrdered,
};

export const getFormatIcon = (style) => FORMAT_ICONS[style] ?? Trophy;
