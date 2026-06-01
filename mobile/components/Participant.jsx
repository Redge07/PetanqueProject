import { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import axios from "axios";
import { linkBackend } from "../constants/LinkBackend";
import { UsersContext } from "../app/_layout";
import { getFormatLabel } from "../utils/formatLabels";
import SearchTournament from "./SearchTournament";
import DirectTournament from "./DirectTournament";

export default function Participant({ player }) {
  const { setLoad, setError } = useContext(UsersContext);
  const [dataPlayer, setDataPlayer] = useState({ res: 0 });

  const recharge = async () => {
    setLoad(true);
    try {
      const res = await axios.get(linkBackend + "players/" + player.id);
      setDataPlayer(res.data);
    } catch {
      setError(true);
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => { recharge(); }, []);

  const handleDelete = () => {
    Alert.alert(
      "Se retirer",
      "Voulez-vous vous retirer de ce concours ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Se retirer",
          style: "destructive",
          onPress: async () => {
            setLoad(true);
            try {
              await axios.delete(linkBackend + "players/" + player.id);
            } catch {
              setError(true);
            } finally {
              recharge();
            }
          },
        },
      ]
    );
  };

  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-primary font-semibold text-lg">Participant</Text>
        <TouchableOpacity onPress={recharge} className="px-3 py-2 rounded-xl border border-border">
          <Text className="text-gray-500 text-sm">↻ Actualiser</Text>
        </TouchableOpacity>
      </View>

      {/* Pas inscrit */}
      {dataPlayer.res === 0 && (
        <SearchTournament player={player} recharge={recharge} />
      )}

      {/* En attente */}
      {dataPlayer.res === 1 && (
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-border">
          <View className="flex-row items-center gap-3 mb-3">
            <View className="w-10 h-10 bg-gold/10 rounded-xl items-center justify-center">
              <Text className="text-xl">⏳</Text>
            </View>
            <Text className="font-semibold text-primary">En attente</Text>
          </View>
          <Text className="text-gray-500 text-sm mb-4">
            Vous êtes en liste d'attente pour le concours{" "}
            <Text className="font-semibold text-primary">{dataPlayer.tournamentName}</Text>
            {" "}({getFormatLabel(dataPlayer.style)})
          </Text>
          <TouchableOpacity onPress={handleDelete} className="border border-red-200 py-2.5 rounded-xl items-center">
            <Text className="text-red-500 font-medium text-sm">Se retirer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Accepté, en attente de démarrage */}
      {dataPlayer.res === 2 && (
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-border">
          <View className="flex-row items-center gap-3 mb-3">
            <View className="w-10 h-10 bg-green-100 rounded-xl items-center justify-center">
              <Text className="text-xl">✅</Text>
            </View>
            <Text className="font-semibold text-primary">Demande acceptée</Text>
          </View>
          <Text className="text-gray-500 text-sm">
            Vous participez au concours{" "}
            <Text className="font-semibold text-primary">{dataPlayer.tournamentName}</Text>.
            {"\n"}Numéro : <Text className="font-semibold text-primary">#{dataPlayer.numero}</Text>
            {"\n"}Le concours va bientôt commencer.
          </Text>
        </View>
      )}

      {/* Tournoi en cours */}
      {dataPlayer.res === 3 && (
        <DirectTournament dataPlayer={dataPlayer} recharge={recharge} />
      )}

      {/* Vainqueur */}
      {dataPlayer.res === 4 && (
        <View className="bg-primary rounded-2xl p-8 shadow-xl items-center">
          <Text className="text-5xl mb-4">🏆</Text>
          <Text className="text-white text-xl font-semibold text-center mb-6">
            {dataPlayer.msg ?? "Félicitations, vous avez gagné !"}
          </Text>
          <TouchableOpacity onPress={handleDelete} className="border border-white/30 px-6 py-3 rounded-xl">
            <Text className="text-white font-medium">Quitter le concours</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
