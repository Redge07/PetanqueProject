import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { getFormatLabel } from "../utils/formatLabels";

// Libellé du stade du joueur selon le format (repris du web)
const getStade = (dataPlayer) => {
  const { style, class: cls, round } = dataPlayer;
  if (style === "classement") {
    if (round == 4) {
      if (cls == 0) return "Attente des qualifiés";
      if (cls == 1) return "Finale de groupe";
      return `1/${cls} de finale de groupe`;
    }
    return `Tour ${round} des poules`;
  }
  if (style === "cascade") {
    if (round == 4) {
      if (cls == 1) return "Finale de groupe";
      if (cls == 0.5) return "Finale B / B2";
      return `1/${cls} de finale de groupe`;
    }
    return `Round ${round}`;
  }
  if (style === "arbre") {
    if (cls == 1) return "Finale du tournoi";
    return `1/${cls} de finale`;
  }
  return "";
};

export default function DirectTournament({ dataPlayer }) {
  const stade = getStade(dataPlayer);
  const hasOpponent = !!dataPlayer.idVersus;

  return (
    <View className="gap-4">
      {/* 1. Carte "Votre match" — info principale */}
      <View className="bg-white rounded-2xl p-5 shadow-sm border border-border">
        <View className="flex-row items-center justify-between mb-5">
          <View className="flex-row items-center gap-2">
            <Text className="text-base">⚔️</Text>
            <Text className="text-sm font-semibold text-primary">Votre match</Text>
          </View>
          <View className="flex-row gap-2">
            {dataPlayer.groupe ? (
              <View className="bg-primary/10 px-2 py-1 rounded-lg">
                <Text className="text-primary text-xs font-medium">
                  Groupe {dataPlayer.groupe}
                </Text>
              </View>
            ) : null}
            {stade ? (
              <View className="bg-gold/10 px-2 py-1 rounded-lg">
                <Text className="text-gold text-xs font-medium">{stade}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {hasOpponent ? (
          <>
            <View className="flex-row items-center gap-3">
              {/* Vous */}
              <View className="flex-1 items-center gap-2">
                <View className="w-14 h-14 rounded-2xl bg-primary items-center justify-center shadow">
                  <Text className="text-white text-xl font-bold">
                    {dataPlayer.numero}
                  </Text>
                </View>
                <Text className="font-semibold text-primary text-sm">Vous</Text>
              </View>

              {/* VS */}
              <View className="bg-primary px-3 py-1.5 rounded-full">
                <Text className="text-white text-xs font-bold">VS</Text>
              </View>

              {/* Adversaire */}
              <View className="flex-1 items-center gap-2">
                <View className="w-14 h-14 rounded-2xl bg-gold items-center justify-center shadow">
                  <Text className="text-white text-xl font-bold">
                    {dataPlayer.idVersus}
                  </Text>
                </View>
                <Text
                  className="font-semibold text-primary text-sm text-center"
                  numberOfLines={1}
                >
                  {dataPlayer.pseudoVersus}
                </Text>
              </View>
            </View>

            {dataPlayer.barrage == 1 && (
              <View className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-3 items-center">
                <Text className="text-sm font-semibold text-orange-600">
                  Match de barrage
                </Text>
              </View>
            )}
          </>
        ) : (
          <View className="items-center gap-3 py-4">
            <View className="w-14 h-14 rounded-2xl bg-bg-mid border-2 border-dashed border-border items-center justify-center">
              <Text className="text-xl">⏱</Text>
            </View>
            <Text className="text-gray-500 text-sm">En attente d'un adversaire</Text>
          </View>
        )}
      </View>

      {/* 2. Contexte compact */}
      <View className="bg-primary rounded-2xl px-5 py-4 shadow">
        <Text className="text-white font-semibold" numberOfLines={1}>
          {dataPlayer.tournamentName}
        </Text>
        <Text className="text-white/70 text-sm mt-0.5">
          {getFormatLabel(dataPlayer.style)} · Numéro {dataPlayer.numero}
        </Text>
      </View>

      {/* 3. Détails du tournoi (vue complète en lecture seule) */}
      <TouchableOpacity
        onPress={() => router.push(`/tournament/${dataPlayer.id_tournament}`)}
        className="bg-bg-mid rounded-2xl p-4 border border-border flex-row items-center justify-between"
      >
        <Text className="text-primary font-medium">Détails du tournoi</Text>
        <Text className="text-primary">→</Text>
      </TouchableOpacity>
      <Text className="text-gray-400 text-xs text-center -mt-2">
        Consultation en lecture seule
      </Text>
    </View>
  );
}
