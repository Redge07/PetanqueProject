import { useContext, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { getFormatLabel } from "../utils/formatLabels";

export default function DirectTournament({ dataPlayer, recharge }) {
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
    </View>
  );
}
