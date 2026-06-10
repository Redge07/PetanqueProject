import "../global.css";
import { createContext, useContext, useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SecureStore from "expo-secure-store";
import * as Notifications from "expo-notifications";
import axios from "axios";
import { linkBackend } from "../constants/LinkBackend";
import { ActivityIndicator, View, Text, TouchableOpacity, Modal } from "react-native";

// Affiche les notifications même quand l'app est au premier plan
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Attache automatiquement le JWT (stocké dans SecureStore) à toutes les requêtes axios
axios.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const UsersContext = createContext();

export const useUsers = () => useContext(UsersContext);

export default function RootLayout() {
  const [player, setPlayer] = useState(null);
  const [load, setLoad] = useState(false);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const verifToken = async () => {
      setLoad(true);
      try {
        const token = await SecureStore.getItemAsync("token");
        if (!token) return;
        const res = await axios.post(linkBackend + "log/verifToken", { token });
        setPlayer(res.data.user);
      } catch {
        await SecureStore.deleteItemAsync("token");
      } finally {
        setLoad(false);
        setReady(true);
      }
    };
    verifToken();
  }, []);

  if (!ready && !error) {
    return (
      <View className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator size="large" color="#1e3a5f" />
      </View>
    );
  }

  return (
    <UsersContext.Provider value={{ player, setPlayer, setLoad, setError }}>
      <StatusBar style="light" />

      {/* Spinner global */}
      {load && (
        <View className="absolute inset-0 bg-black/30 items-center justify-center z-50">
          <View className="bg-white rounded-2xl p-6 shadow-xl">
            <ActivityIndicator size="large" color="#1e3a5f" />
          </View>
        </View>
      )}

      {/* Modal erreur global */}
      <Modal visible={error} transparent animationType="fade">
        <View className="flex-1 bg-black/40 items-center justify-center p-6">
          <View className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl items-center">
            <Text className="text-4xl mb-4">⚠️</Text>
            <Text className="text-lg font-semibold text-primary mb-2 text-center">
              Une erreur est survenue
            </Text>
            <Text className="text-gray-500 text-sm mb-6 text-center">
              Veuillez réessayer ou recharger l'application
            </Text>
            <TouchableOpacity
              onPress={() => setError(false)}
              className="w-full bg-primary py-3 rounded-xl items-center"
            >
              <Text className="text-white font-semibold">Réessayer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="home" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="tournament/[id]" />
      </Stack>
    </UsersContext.Provider>
  );
}
