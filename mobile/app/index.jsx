import { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import axios from "axios";
import { linkBackend } from "../constants/LinkBackend";
import { UsersContext } from "./_layout";

export default function LoginScreen() {
  const { setPlayer, setLoad, setError } = useContext(UsersContext);
  const [tab, setTab] = useState("connexion");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [msg, setMsg] = useState("");

  const getLocationAndToken = async (userId) => {
    let latitude = null;
    let longitude = null;
    let pushToken = null;

    // --- Token de notifications push ---
    try {
      // 1. Demander la permission notifications
      const { status: existing } = await Notifications.getPermissionsAsync();
      let finalStatus = existing;
      if (existing !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      // 2. Si accordée, récupérer le token avec le projectId
      if (finalStatus === "granted") {
        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId;
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        pushToken = tokenData.data;
        console.log("Push token récupéré :", pushToken);
      } else {
        console.log("Permission notifications refusée");
      }
    } catch (e) {
      console.log("Erreur récupération token push :", e?.message ?? e);
    }

    // --- Position ---
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        latitude = loc.coords.latitude;
        longitude = loc.coords.longitude;
      }
    } catch {}

    await axios.post(linkBackend + "log/register", {
      token: pushToken,
      id: userId,
      latitude,
      longitude,
    });
  };

  const chargeHome = async (user, token) => {
    await SecureStore.setItemAsync("token", token);
    setPlayer(user);
    router.replace("/home");
  };

  const handleSignIn = async () => {
    if (!email || !password) return;
    setLoad(true);
    try {
      const res = await axios.post(linkBackend + "log/connexion", { email, password });
      setMsg(res.data.message);
      if (res.data.res === 1) {
        await getLocationAndToken(res.data.user.id);
        await chargeHome(res.data.user, res.data.token);
      }
    } catch {
      setError(true);
    } finally {
      setLoad(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !pseudo) return;
    setLoad(true);
    try {
      const res = await axios.post(linkBackend + "log/inscription", { email, pseudo, password });
      setMsg(res.data.message);
    } catch {
      setError(true);
    } finally {
      setLoad(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-primary rounded-3xl items-center justify-center shadow-lg mb-4">
            <Text className="text-4xl">🏆</Text>
          </View>
          <Text className="text-3xl font-light text-primary tracking-wide">
            Pétanque<Text className="font-bold">Manager</Text>
          </Text>
          <Text className="text-gray-500 mt-1 text-sm">Gérez vos concours facilement</Text>
        </View>

        {/* Carte */}
        <View className="bg-white rounded-3xl p-6 shadow-xl">
          {/* Onglets */}
          <View className="flex-row bg-bg-mid rounded-xl p-1 mb-6">
            {["connexion", "inscription"].map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => { setTab(t); setMsg(""); }}
                className={`flex-1 py-2.5 rounded-lg items-center ${tab === t ? "bg-white shadow-sm" : ""}`}
              >
                <Text className={`text-sm font-medium capitalize ${tab === t ? "text-primary" : "text-gray-500"}`}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Champs */}
          <View className="gap-3">
            <TextInput
              className="h-12 px-4 rounded-xl border border-border bg-bg text-primary"
              placeholder="Votre email..."
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {tab === "inscription" && (
              <TextInput
                className="h-12 px-4 rounded-xl border border-border bg-bg text-primary"
                placeholder="Votre pseudo..."
                placeholderTextColor="#9ca3af"
                value={pseudo}
                onChangeText={setPseudo}
                autoCapitalize="none"
              />
            )}

            <TextInput
              className="h-12 px-4 rounded-xl border border-border bg-bg text-primary"
              placeholder="Votre mot de passe..."
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              onPress={tab === "connexion" ? handleSignIn : handleSignUp}
              className={`h-12 rounded-xl items-center justify-center ${tab === "connexion" ? "bg-primary" : "bg-gold"}`}
            >
              <Text className="text-white font-semibold">
                {tab === "connexion" ? "Se connecter" : "Créer mon compte"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Message retour */}
          {!!msg && (
            <View className="mt-4 bg-bg-mid rounded-xl p-3 border border-gold/20">
              <Text className="text-primary text-sm text-center">{msg}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
