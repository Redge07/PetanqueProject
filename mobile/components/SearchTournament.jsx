import { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import axios from "axios";
import { linkBackend } from "../constants/LinkBackend";
import { UsersContext } from "../app/_layout";
import { getFormatLabel } from "../utils/formatLabels";

export default function SearchTournament({ player, recharge }) {
  const { setLoad, setError } = useContext(UsersContext);
  const [tab, setTab] = useState("list");
  const [availableList, setAvailableList] = useState([]);
  const [nameQuery, setNameQuery] = useState("");
  const [nameResults, setNameResults] = useState([]);
  const [idQuery, setIdQuery] = useState("");
  const [idResult, setIdResult] = useState({ res: -1 });
  const [selected, setSelected] = useState(null);
  const [pseudo, setPseudo] = useState("");
  const [msg, setMsg] = useState("");
  const [scanning, setScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    const loadAvailable = async () => {
      try {
        const res = await axios.get(linkBackend + "players/available");
        setAvailableList(res.data);
      } catch {}
    };
    loadAvailable();
  }, []);

  useEffect(() => {
    if (!nameQuery.trim() || nameQuery.length < 2) { setNameResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await axios.get(linkBackend + "players/search-name/" + encodeURIComponent(nameQuery));
        setNameResults(res.data);
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [nameQuery]);

  const searchById = async (id) => {
    if (!id) return;
    setLoad(true);
    try {
      const res = await axios.get(linkBackend + "players/search/" + id);
      setIdResult(res.data);
      if (res.data.res === 1) setSelected(res.data);
    } catch {
      setError(true);
    } finally {
      setLoad(false);
    }
  };

  const handleQRScan = async ({ data }) => {
    setScanning(false);
    const id = data.split("?id=").pop();
    if (id) {
      setTab("id");
      setIdQuery(id);
      await searchById(id);
    }
  };

  const handleInscrire = async (tournament) => {
    if (!pseudo.trim()) return;
    setLoad(true);
    try {
      const res = await axios.post(linkBackend + "players/", {
        idUser: player.id,
        idTournament: tournament.id,
        pseudo: pseudo.trim(),
      });
      setMsg(res.data.res);
      setTimeout(() => recharge(), 1200);
    } catch {
      setError(true);
    } finally {
      setLoad(false);
    }
  };

  const InscriptionForm = ({ tournament }) => (
    <View className="mt-3 p-4 bg-bg-mid rounded-xl border border-gold/20">
      <Text className="font-semibold text-primary mb-1">{tournament.name}</Text>
      <Text className="text-gray-500 text-xs mb-3">{getFormatLabel(tournament.style)}</Text>
      <TextInput
        className="h-11 px-4 rounded-xl border border-border bg-white text-primary mb-2"
        placeholder="Nom de l'équipe (ex: Dupont / Martin)"
        placeholderTextColor="#9ca3af"
        value={pseudo}
        onChangeText={setPseudo}
      />
      <TouchableOpacity
        onPress={() => handleInscrire(tournament)}
        disabled={!pseudo.trim()}
        className={`h-11 rounded-xl items-center justify-center ${pseudo.trim() ? "bg-gold" : "bg-gray-200"}`}
      >
        <Text className={`font-semibold ${pseudo.trim() ? "text-white" : "text-gray-400"}`}>
          S'inscrire
        </Text>
      </TouchableOpacity>
      {!!msg && <Text className="text-primary text-sm mt-2 text-center">{msg}</Text>}
    </View>
  );

  const TournamentRow = ({ t }) => (
    <View className="mb-2">
      <TouchableOpacity
        onPress={() => setSelected(selected?.id === t.id ? null : t)}
        className={`flex-row items-center justify-between p-3 rounded-xl border ${selected?.id === t.id ? "border-gold bg-gold/5" : "border-border bg-bg-mid"}`}
      >
        <View>
          <Text className="font-medium text-primary text-sm">{t.name}</Text>
          <Text className="text-gray-400 text-xs">{getFormatLabel(t.style)} · #{t.id}</Text>
        </View>
        <Text className="text-gold text-xs font-medium">
          {selected?.id === t.id ? "Fermer" : "Rejoindre"}
        </Text>
      </TouchableOpacity>
      {selected?.id === t.id && <InscriptionForm tournament={t} />}
    </View>
  );

  return (
    <View className="bg-white rounded-2xl p-5 shadow-sm border border-border">
      <Text className="text-gray-500 text-sm mb-4">Vous ne participez à aucun concours</Text>

      {/* Onglets */}
      <View className="flex-row bg-bg-mid rounded-xl p-1 mb-4">
        {[
          { id: "list", label: "🗓 Disponibles" },
          { id: "name", label: "🔍 Recherche" },
          { id: "id", label: "# Numéro" },
        ].map((t) => (
          <TouchableOpacity
            key={t.id}
            onPress={() => { setTab(t.id); setSelected(null); setMsg(""); }}
            className={`flex-1 py-2 rounded-lg items-center ${tab === t.id ? "bg-white shadow-sm" : ""}`}
          >
            <Text className={`text-xs font-medium ${tab === t.id ? "text-primary" : "text-gray-500"}`}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* QR Scanner */}
      <TouchableOpacity
        onPress={async () => {
          if (!permission?.granted) await requestPermission();
          setScanning(true);
        }}
        className="flex-row items-center justify-center gap-2 py-2.5 rounded-xl border border-primary mb-4"
      >
        <Text className="text-primary font-medium text-sm">📷 Scanner un QR code</Text>
      </TouchableOpacity>

      {/* Onglet liste */}
      {tab === "list" && (
        availableList.length === 0
          ? <Text className="text-gray-400 text-sm text-center py-4">Aucun concours disponible</Text>
          : availableList.map((t) => <TournamentRow key={t.id} t={t} />)
      )}

      {/* Onglet nom */}
      {tab === "name" && (
        <View>
          <TextInput
            className="h-12 px-4 rounded-xl border border-border bg-bg text-primary mb-3"
            placeholder="Nom du concours..."
            placeholderTextColor="#9ca3af"
            value={nameQuery}
            onChangeText={(v) => { setNameQuery(v); setSelected(null); }}
          />
          {nameQuery.length >= 2 && nameResults.length === 0 && (
            <Text className="text-gray-400 text-sm text-center">Aucun résultat</Text>
          )}
          {nameResults.map((t) => <TournamentRow key={t.id} t={t} />)}
        </View>
      )}

      {/* Onglet ID */}
      {tab === "id" && (
        <View>
          <View className="flex-row gap-2 mb-3">
            <TextInput
              className="flex-1 h-12 px-4 rounded-xl border border-border bg-bg text-primary"
              placeholder="Numéro du concours..."
              placeholderTextColor="#9ca3af"
              value={idQuery}
              onChangeText={setIdQuery}
              keyboardType="numeric"
            />
            <TouchableOpacity
              onPress={() => searchById(idQuery)}
              className="h-12 px-4 bg-primary rounded-xl items-center justify-center"
            >
              <Text className="text-white font-medium">OK</Text>
            </TouchableOpacity>
          </View>
          {idResult.res === 0 && (
            <Text className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">
              Aucun concours avec ce numéro
            </Text>
          )}
          {idResult.res === 1 && selected && <InscriptionForm tournament={selected} />}
          {idResult.res === 2 && (
            <Text className="text-gray-500 text-sm bg-bg-mid p-3 rounded-xl">
              Le concours {idResult.name} a déjà commencé
            </Text>
          )}
        </View>
      )}

      {/* Modal QR Scanner */}
      <Modal visible={scanning} animationType="slide">
        <View className="flex-1 bg-black">
          <CameraView
            className="flex-1"
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={handleQRScan}
          />
          <View className="absolute bottom-10 left-0 right-0 items-center">
            <TouchableOpacity
              onPress={() => setScanning(false)}
              className="bg-white px-8 py-4 rounded-2xl"
            >
              <Text className="text-primary font-semibold">Annuler</Text>
            </TouchableOpacity>
          </View>
          <View className="absolute top-0 left-0 right-0 items-center pt-16">
            <Text className="text-white font-semibold text-lg">Scanner le QR code du concours</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}
