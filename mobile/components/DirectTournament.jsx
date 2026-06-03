import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { getFormatLabel } from "../utils/formatLabels";

// Phrase de situation du joueur selon le format (reprend la logique du web)
function statusText(dataPlayer) {
  const { style, class: cls, round } = dataPlayer;

  if (style === "arbre") {
    return cls == 1
      ? "Tu es actuellement en finale du tournoi 🏆"
      : `Tu es actuellement en 1/${cls} de finale du tournoi.`;
  }

  if (style === "cascade") {
    if (round == 4) {
      if (cls == 1) return "Tu es en finale de ton groupe 🏆";
      if (cls == 0.5 && dataPlayer.groupe === "B")
        return "Tu es dans la grande finale : vainqueur du groupe B contre vainqueur du groupe B2.";
      return `Tu es en 1/${cls} de finale de ton groupe.`;
    }
    return `Tu es au match n°${round} de la phase de groupe.`;
  }

  if (style === "classement") {
    if (round == 4) {
      if (cls == 0)
        return "Fin des 3 matchs de poule. En attente que tout le monde finisse pour le tirage de la phase finale.";
      return cls == 1
        ? "Tu es en finale de ton groupe 🏆"
        : `Tu es en 1/${cls} de finale de ton groupe.`;
    }
    return `Tu es au match n°${round} de la phase de poule.`;
  }

  return "";
}

export default function DirectTournament({ dataPlayer }) {
  return (
    <View className="gap-4">
      {/* Carte concours */}
      <View className="bg-primary rounded-2xl p-5 shadow-xl">
        <Text className="text-gold text-xs font-medium mb-1">Concours en cours</Text>
        <Text className="text-white text-xl font-semibold">{dataPlayer.tournamentName}</Text>
        <Text className="text-white/60 text-sm mt-1">
          {getFormatLabel(dataPlayer.style)} · Numéro #{dataPlayer.numero}
        </Text>
      </View>

      {/* Situation du joueur */}
      <View className="bg-white rounded-2xl p-5 shadow-sm border border-border">
        <Text className="font-semibold text-primary mb-2">📍 Ta situation</Text>
        {dataPlayer.groupe && (
          <Text className="text-gray-500 text-sm mb-1">
            Groupe <Text className="font-semibold text-primary">{dataPlayer.groupe}</Text>
          </Text>
        )}
        <Text className="text-gray-600 text-sm leading-5">{statusText(dataPlayer)}</Text>
        {dataPlayer.barrage == 1 && (
          <View className="mt-3 bg-orange-50 rounded-xl p-3">
            <Text className="text-orange-600 text-sm font-medium">Tu joues un match de barrage</Text>
          </View>
        )}
      </View>

      {/* Adversaire */}
      <View className="bg-white rounded-2xl p-5 shadow-sm border border-border">
        <Text className="font-semibold text-primary mb-3">⚔️ Adversaire</Text>
        {dataPlayer.idVersus ? (
          <View className="bg-bg-mid rounded-xl p-4">
            <Text className="text-primary font-semibold text-lg text-center">
              {dataPlayer.pseudoVersus}
            </Text>
            <Text className="text-gray-400 text-sm text-center mt-1">
              Numéro #{dataPlayer.idVersus}
            </Text>
          </View>
        ) : (
          <Text className="text-gray-400 text-sm text-center py-3">
            Pas encore d'adversaire désigné{"\n"}Revenez dans quelques instants
          </Text>
        )}
      </View>

      {/* Bouton voir le concours complet */}
      <TouchableOpacity
        onPress={() => router.push(`/tournament/${dataPlayer.id_tournament}`)}
        className="bg-bg-mid rounded-2xl p-4 border border-border flex-row items-center justify-between"
      >
        <Text className="text-primary font-medium">Voir le tableau complet</Text>
        <Text className="text-primary">→</Text>
      </TouchableOpacity>
      <Text className="text-gray-400 text-xs text-center -mt-2">
        Consultation en lecture seule
      </Text>
    </View>
  );
}
