import { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { linkBackend } from "../constants/LinkBackend";
import { UsersContext } from "./_layout";
import { getFormatLabel } from "../utils/formatLabels";

export default function ProfileScreen() {
  const { player, setPlayer } = useContext(UsersContext);
  const { setLoad, setError } = useContext(UsersContext);
  const [profile, setProfile] = useState(null);
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");

  useEffect(() => {
    if (!player) return;
    const load = async () => {
      setLoad(true);
      try {
        const res = await axios.get(linkBackend + "log/profile/" + player.id);
        setProfile(res.data);
      } catch {
        setError(true);
      } finally {
        setLoad(false);
      }
    };
    load();
  }, []);

  const handleChangePassword = async () => {
    if (newPwd !== confirmPwd) { setPwdMsg("Les mots de passe ne correspondent pas"); return; }
    if (newPwd.length < 6) { setPwdMsg("Minimum 6 caractères"); return; }
    setLoad(true);
    try {
      const res = await axios.put(linkBackend + "log/password/" + player.id, {
        oldPassword: oldPwd,
        newPassword: newPwd,
      });
      setPwdMsg(res.data.message);
      if (res.data.res === 1) { setOldPwd(""); setNewPwd(""); setConfirmPwd(""); }
    } catch {
      setError(true);
    } finally {
      setLoad(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Supprimer mon compte",
      "Cette action est irréversible. Toutes vos données seront supprimées (RGPD).",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer définitivement",
          style: "destructive",
          onPress: async () => {
            setLoad(true);
            try {
              await axios.delete(linkBackend + "log/account/" + player.id);
              await SecureStore.deleteItemAsync("token");
              setPlayer(null);
              router.replace("/");
            } catch {
              setError(true);
            } finally {
              setLoad(false);
            }
          },
        },
      ]
    );
  };

  const startStatuses = {
    0: { label: "Pas commencé", color: "text-orange-500" },
    1: { label: "En cours", color: "text-green-600" },
    2: { label: "Terminé", color: "text-gray-400" },
  };

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerClassName="pb-10">
      {/* Header */}
      <View className="bg-primary pt-14 pb-6 px-5">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 bg-white/10 rounded-xl items-center justify-center">
            <Text className="text-white text-lg">←</Text>
          </TouchableOpacity>
          <Text className="text-white text-xl font-light">
            Mon <Text className="font-bold">profil</Text>
          </Text>
        </View>
      </View>

      <View className="px-4 pt-5 gap-4">
        {/* Infos compte */}
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-border">
          <Text className="font-semibold text-primary mb-4">Informations du compte</Text>
          <View className="flex-row items-center gap-3 p-3 bg-bg-mid rounded-xl mb-2">
            <Text className="text-lg">👤</Text>
            <View>
              <Text className="text-xs text-gray-400">Pseudo</Text>
              <Text className="font-medium text-primary">{player?.pseudo}</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-3 p-3 bg-bg-mid rounded-xl">
            <Text className="text-lg">✉️</Text>
            <View>
              <Text className="text-xs text-gray-400">Email</Text>
              <Text className="font-medium text-primary">{player?.email}</Text>
            </View>
          </View>
        </View>

        {/* Changer mot de passe */}
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-border">
          <Text className="font-semibold text-primary mb-4">🔒 Changer le mot de passe</Text>
          <View className="gap-3">
            <TextInput
              className="h-11 px-4 rounded-xl border border-border bg-bg text-primary text-sm"
              placeholder="Ancien mot de passe"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={oldPwd}
              onChangeText={setOldPwd}
            />
            <TextInput
              className="h-11 px-4 rounded-xl border border-border bg-bg text-primary text-sm"
              placeholder="Nouveau mot de passe (min. 6 caractères)"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={newPwd}
              onChangeText={setNewPwd}
            />
            <TextInput
              className="h-11 px-4 rounded-xl border border-border bg-bg text-primary text-sm"
              placeholder="Confirmer le nouveau mot de passe"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={confirmPwd}
              onChangeText={setConfirmPwd}
            />
            {!!pwdMsg && (
              <Text className={`text-sm p-3 rounded-xl ${pwdMsg.includes("jour") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                {pwdMsg}
              </Text>
            )}
            <TouchableOpacity onPress={handleChangePassword} className="h-11 bg-primary rounded-xl items-center justify-center">
              <Text className="text-white font-semibold">Mettre à jour</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Concours organisés */}
        {profile?.organized?.length > 0 && (
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-border">
            <Text className="font-semibold text-primary mb-4">🏆 Mes concours organisés</Text>
            {profile.organized.map((t) => (
              <TouchableOpacity
                key={t.id}
                onPress={() => router.push(`/tournament/${t.id}`)}
                className="flex-row items-center justify-between py-3 border-b border-border last:border-0"
              >
                <View className="flex-1 mr-3">
                  <Text className="font-medium text-primary text-sm" numberOfLines={1}>{t.name}</Text>
                  <Text className="text-gray-400 text-xs">{getFormatLabel(t.style)}</Text>
                </View>
                <Text className={`text-xs font-medium ${startStatuses[t.start]?.color}`}>
                  {startStatuses[t.start]?.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Supprimer compte */}
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-red-100">
          <Text className="font-semibold text-primary mb-2">Supprimer mon compte</Text>
          <Text className="text-gray-400 text-sm mb-4">
            Action irréversible. Toutes vos données seront effacées (RGPD).
          </Text>
          <TouchableOpacity onPress={handleDeleteAccount} className="border border-red-200 py-3 rounded-xl items-center">
            <Text className="text-red-500 font-medium">🗑 Supprimer mon compte</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
