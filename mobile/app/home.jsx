import { useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { UsersContext } from "./_layout";
import Organisation from "../components/Organisation";
import Participant from "../components/Participant";

export default function HomeScreen() {
  const { player, setPlayer } = useContext(UsersContext);
  const [choice, setChoice] = useState(null); // null | "orga" | "participant"

  const handleDisconnect = async () => {
    await SecureStore.deleteItemAsync("token");
    setPlayer(null);
    router.replace("/");
  };

  if (!player) {
    router.replace("/");
    return null;
  }

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerClassName="pb-8">
      {/* Header */}
      <View className="bg-primary pt-14 pb-6 px-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 bg-gold/20 rounded-xl items-center justify-center">
              <Text className="text-xl">🏆</Text>
            </View>
            <Text className="text-white text-xl font-light">
              Pétanque<Text className="font-bold">Manager</Text>
            </Text>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => router.push("/profile")}
              className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center"
            >
              <Text className="text-white text-lg">👤</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDisconnect}
              className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center"
            >
              <Text className="text-white text-lg">🚪</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bienvenue */}
        <View className="mt-6">
          <Text className="text-gold text-xs font-medium mb-1">Bienvenue</Text>
          <Text className="text-white text-2xl font-light">
            Bonjour, <Text className="font-bold">{player.pseudo}</Text>
          </Text>
          <Text className="text-white/60 text-sm mt-1">
            Prêt à organiser ou participer à un concours ?
          </Text>
        </View>
      </View>

      <View className="px-4 pt-6">
        {/* Choix initial */}
        {!choice && (
          <View className="gap-4">
            <TouchableOpacity
              onPress={() => setChoice("orga")}
              className="bg-white rounded-3xl p-6 shadow-sm border border-border active:opacity-90"
            >
              <View className="w-14 h-14 bg-gold/10 rounded-2xl items-center justify-center mb-4">
                <Text className="text-3xl">👑</Text>
              </View>
              <Text className="text-xl font-semibold text-primary mb-1">Organisateur</Text>
              <Text className="text-gray-500 text-sm">Créez et gérez vos concours de pétanque</Text>
              <Text className="text-gold font-medium mt-3 text-sm">Accéder →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setChoice("participant")}
              className="bg-white rounded-3xl p-6 shadow-sm border border-border active:opacity-90"
            >
              <View className="w-14 h-14 bg-primary/10 rounded-2xl items-center justify-center mb-4">
                <Text className="text-3xl">🎯</Text>
              </View>
              <Text className="text-xl font-semibold text-primary mb-1">Participant</Text>
              <Text className="text-gray-500 text-sm">Rejoignez un concours et suivez vos matchs</Text>
              <Text className="text-primary font-medium mt-3 text-sm">Accéder →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Mode choisi */}
        {choice && (
          <>
            <TouchableOpacity
              onPress={() => setChoice(null)}
              className="flex-row items-center gap-2 mb-4"
            >
              <Text className="text-gray-500">←</Text>
              <Text className="text-gray-500">Retour au choix</Text>
            </TouchableOpacity>

            {choice === "orga" ? (
              <Organisation player={player} />
            ) : (
              <Participant player={player} />
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}
