import { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Share,
  Alert,
} from "react-native";
import { router } from "expo-router";
import axios from "axios";
import * as Clipboard from "expo-clipboard";
import { linkBackend } from "../constants/LinkBackend";
import { UsersContext } from "../app/_layout";
import { getFormatLabel } from "../utils/formatLabels";

const FORMAT_OPTIONS = [
  { value: "arbre", label: "Élimination directe" },
  { value: "cascade", label: "Cascade" },
  { value: "classement", label: "Poules + Finale" },
];

export default function Organisation({ player }) {
  const { setLoad, setError } = useContext(UsersContext);
  const [tournaments, setTournaments] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [style, setStyle] = useState("arbre");
  const [prixEntree, setPrixEntree] = useState("10");

  const recharge = async () => {
    setLoad(true);
    try {
      const res = await axios.get(linkBackend + "organisateurs/" + player.id);
      setTournaments(res.data.res === 1 ? res.data.results : []);
    } catch {
      setError(true);
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => { recharge(); }, []);

  const createTournament = async () => {
    if (name.trim().length < 3) return;
    setLoad(true);
    setShowCreate(false);
    try {
      await axios.post(linkBackend + "organisateurs/" + player.id, {
        name: name.trim(),
        style,
        prix_entree: style === "cascade" ? Number(prixEntree) : 0,
      });
      setName("");
      setStyle("arbre");
      setPrixEntree("10");
    } catch {
      setError(true);
    } finally {
      recharge();
    }
  };

  const deleteTournament = (id, nomConcours) => {
    Alert.alert(
      "Supprimer le concours",
      `Supprimer "${nomConcours}" ? Cette action est irréversible.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            setLoad(true);
            try {
              await axios.delete(linkBackend + "organisateurs/" + id);
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

  const shareTournament = async (t) => {
    try {
      await Clipboard.setStringAsync(String(t.id));
      await Share.share({
        message: `Rejoignez le concours "${t.name}" sur PétanqueManager ! Numéro : ${t.id}`,
        title: `Concours ${t.name}`,
      });
    } catch {}
  };

  const statusColor = (start) => {
    if (start === 0) return "bg-orange-100 text-orange-500";
    if (start === 1) return "bg-green-100 text-green-600";
    return "bg-gray-100 text-gray-500";
  };
  const statusLabel = (start) => {
    if (start === 0) return "Pas commencé";
    if (start === 1) return "En cours";
    return "Terminé";
  };

  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-primary font-semibold text-lg">
          {tournaments.length > 0 ? `${tournaments.length} concours` : "Aucun concours"}
        </Text>
        <TouchableOpacity
          onPress={() => setShowCreate(true)}
          className="bg-primary px-4 py-2.5 rounded-xl flex-row items-center gap-2"
        >
          <Text className="text-white font-medium">+ Créer</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tournaments}
        keyExtractor={(t) => String(t.id)}
        scrollEnabled={false}
        renderItem={({ item: t }) => (
          <View className="bg-white rounded-2xl p-4 shadow-sm border border-border mb-3">
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1 mr-3">
                <Text className="font-semibold text-primary text-base">{t.name}</Text>
                <View className="flex-row gap-2 mt-1 flex-wrap">
                  <View className="bg-primary/10 px-2 py-0.5 rounded-full">
                    <Text className="text-primary text-xs font-medium">{getFormatLabel(t.style)}</Text>
                  </View>
                  <Text className="text-gray-400 text-xs self-center">#{t.id}</Text>
                  <View className={`px-2 py-0.5 rounded-full ${statusColor(t.start)}`}>
                    <Text className="text-xs font-medium">{statusLabel(t.start)}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => router.push(`/tournament/${t.id}`)}
                className="flex-1 bg-primary py-2.5 rounded-xl items-center"
              >
                <Text className="text-white font-medium text-sm">Gérer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => shareTournament(t)}
                className="px-3 py-2.5 rounded-xl border border-gold items-center"
              >
                <Text className="text-gold text-sm">📤</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteTournament(t.id, t.name)}
                className="px-3 py-2.5 rounded-xl border border-red-200 items-center"
              >
                <Text className="text-red-500 text-sm">🗑</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text className="text-gray-400 text-sm text-center py-6">
            Aucun concours pour le moment.{"\n"}Créez-en un !
          </Text>
        }
      />

      {/* Modal création */}
      <Modal visible={showCreate} transparent animationType="slide">
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-xl font-semibold text-primary mb-5">Nouveau concours</Text>

            <TextInput
              className="h-12 px-4 rounded-xl border border-border bg-bg text-primary mb-3"
              placeholder="Nom du concours (min. 3 caractères)"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
            />

            <Text className="text-sm font-medium text-primary mb-2">Format</Text>
            <View className="flex-row gap-2 mb-4 flex-wrap">
              {FORMAT_OPTIONS.map((f) => (
                <TouchableOpacity
                  key={f.value}
                  onPress={() => setStyle(f.value)}
                  className={`px-3 py-2 rounded-xl border ${style === f.value ? "bg-primary border-primary" : "bg-white border-border"}`}
                >
                  <Text className={`text-sm font-medium ${style === f.value ? "text-white" : "text-primary"}`}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {style === "cascade" && (
              <View className="mb-4">
                <Text className="text-sm font-medium text-primary mb-2">Prix d'entrée (€)</Text>
                <TextInput
                  className="h-12 px-4 rounded-xl border border-border bg-bg text-primary"
                  keyboardType="numeric"
                  value={prixEntree}
                  onChangeText={setPrixEntree}
                />
              </View>
            )}

            <View className="flex-row gap-3 mt-2">
              <TouchableOpacity
                onPress={() => { setShowCreate(false); setName(""); }}
                className="flex-1 h-12 rounded-xl border border-border items-center justify-center"
              >
                <Text className="text-gray-500 font-medium">Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={createTournament}
                disabled={name.trim().length < 3}
                className={`flex-1 h-12 rounded-xl items-center justify-center ${name.trim().length >= 3 ? "bg-gold" : "bg-gray-200"}`}
              >
                <Text className={`font-semibold ${name.trim().length >= 3 ? "text-white" : "text-gray-400"}`}>
                  Créer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
