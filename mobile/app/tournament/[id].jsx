import { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import axios from "axios";
import { linkBackend } from "../../constants/LinkBackend";
import { UsersContext } from "../_layout";
import { getFormatLabel } from "../../utils/formatLabels";
import createPaires from "../../utils/createPaires";

export default function TournamentScreen() {
  const { id } = useLocalSearchParams();
  const { setLoad, setError } = useContext(UsersContext);
  const [data, setData] = useState(null);
  const [paires, setPaires] = useState({});
  const [positions, setPositions] = useState([]);
  const [tab, setTab] = useState("matchs");
  const [classement, setClassement] = useState([]);
  const [responseWin, setResponseWin] = useState("");

  const recharge = async () => {
    setLoad(true);
    try {
      const res = await axios.get(linkBackend + "tournaments/" + id);
      const filtered = res.data.matches
        ? res.data.matches.filter((m) => m.id_playerA && (!m.end || m.end === -1))
        : [];
      setData({ ...res.data, matches: filtered });
      setPaires(createPaires(filtered));

      if (res.data.style === "classement") {
        const cl = await axios.get(linkBackend + "tournaments/classement/" + id);
        setClassement(cl.data.players ?? []);
      }
    } catch {
      setError(true);
      router.back();
    } finally {
      setLoad(false);
    }
  };

  const loadPositions = async () => {
    try {
      const res = await axios.get(linkBackend + "log/positions/" + id);
      setPositions(res.data.filter((p) => p.latitude && p.longitude));
    } catch {}
  };

  useEffect(() => {
    recharge();
    loadPositions();
  }, []);

  const declareWinner = async (win, lose, versus) => {
    setLoad(true);
    try {
      const pseudoWin = versus.id_playerA === win ? versus.pseudo_A : versus.pseudo_B;
      const res = await axios.put(linkBackend + "winner/arbre/" + id, {
        win, lose, tour: versus.class, pseudoWin,
      });
      setResponseWin(typeof res.data === "string" ? res.data : res.data.message ?? "");
      setTimeout(recharge, 800);
    } catch {
      setError(true);
    } finally {
      setLoad(false);
    }
  };

  const declareWinnerCascade = async (win, lose, versus) => {
    setLoad(true);
    try {
      const pseudoWin = versus.id_playerA === win ? versus.pseudo_A : versus.pseudo_B;
      const pseudoLose = versus.id_playerA === lose ? versus.pseudo_A : versus.pseudo_B;
      await axios.put(linkBackend + "winner/cascade/" + id, {
        win, lose, round: versus.round, groupe: versus.groupe,
        barrage: versus.barrage, tour: versus.class, pseudoWin, pseudoLose,
      });
      setTimeout(recharge, 800);
    } catch {
      setError(true);
    } finally {
      setLoad(false);
    }
  };

  const handleWinner = (win, lose, versus) => {
    const pseudoWin = versus.id_playerA === win ? versus.pseudo_A : versus.pseudo_B;
    Alert.alert(
      "Déclarer le vainqueur",
      `${pseudoWin} remporte ce match ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          onPress: () => data.style === "cascade"
            ? declareWinnerCascade(win, lose, versus)
            : declareWinner(win, lose, versus),
        },
      ]
    );
  };

  if (!data) {
    return (
      <View className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator size="large" color="#1e3a5f" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg">
      {/* Header */}
      <View className="bg-primary pt-14 pb-4 px-5">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 bg-white/10 rounded-xl items-center justify-center">
            <Text className="text-white text-lg">←</Text>
          </TouchableOpacity>
          <View className="flex-1 mx-3">
            <Text className="text-white font-semibold" numberOfLines={1}>{data.name ?? `Concours #${id}`}</Text>
            <Text className="text-white/60 text-xs">{getFormatLabel(data.style)}</Text>
          </View>
          <TouchableOpacity onPress={recharge} className="w-9 h-9 bg-white/10 rounded-xl items-center justify-center">
            <Text className="text-white">↻</Text>
          </TouchableOpacity>
        </View>

        {/* Onglets */}
        {data.res === 1 && (
          <View className="flex-row gap-2 mt-4">
            {["matchs", data.style === "classement" ? "classement" : null, "map"].filter(Boolean).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setTab(t)}
                className={`px-4 py-1.5 rounded-full ${tab === t ? "bg-white" : "bg-white/10"}`}
              >
                <Text className={`text-xs font-medium capitalize ${tab === t ? "text-primary" : "text-white"}`}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <ScrollView className="flex-1 px-4 pt-4">

        {/* Pas commencé */}
        {data.res === 0 && (
          <NoStartTournament
            listPlayers={data}
            idTournament={id}
            recharge={recharge}
          />
        )}

        {/* Terminé */}
        {data.res === 2 && (
          <View className="bg-primary rounded-3xl p-8 items-center shadow-xl mt-4">
            <Text className="text-5xl mb-4">🏆</Text>
            <Text className="text-gold text-sm font-medium mb-1">Vainqueur</Text>
            <Text className="text-white text-2xl font-bold">{data.vainqueur}</Text>
          </View>
        )}

        {/* En cours — Matchs */}
        {data.res === 1 && tab === "matchs" && (
          <MatchsTab data={data} paires={paires} handleWinner={handleWinner} responseWin={responseWin} />
        )}

        {/* En cours — Classement */}
        {data.res === 1 && tab === "classement" && (
          <ClassementTab classement={classement} />
        )}

        {/* En cours — Map */}
        {data.res === 1 && tab === "map" && (
          <MapTab positions={positions} />
        )}

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}

// ---- Sous-composants ----

function NoStartTournament({ listPlayers, idTournament, recharge }) {
  const { setLoad, setError } = useContext(UsersContext);
  const [pseudoInput, setPseudoInput] = useState("");
  const [nbJoueurs, setNbJoueurs] = useState("");

  const attente = listPlayers.results?.filter((p) => p.valider === 0) ?? [];
  const valides = listPlayers.results?.filter((p) => p.valider === 1) ?? [];

  const acceptPlayer = (idUser, nom) => {
    Alert.alert("Accepter", `Accepter ${nom} ?`, [
      { text: "Annuler", style: "cancel" },
      { text: "Accepter", onPress: async () => {
        setLoad(true);
        try { await axios.put(linkBackend + "tournaments/" + idTournament, { id_user: idUser }); }
        catch { setError(true); }
        finally { recharge(); setLoad(false); }
      }},
    ]);
  };

  const deletePlayer = (idUser, nom) => {
    Alert.alert("Supprimer", `Retirer ${nom} ?`, [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: async () => {
        setLoad(true);
        try { await axios.delete(linkBackend + "tournaments/players_attente/" + idUser); }
        catch { setError(true); }
        finally { recharge(); setLoad(false); }
      }},
    ]);
  };

  const addPlayerManual = async () => {
    if (!pseudoInput.trim()) return;
    setLoad(true);
    try {
      await axios.post(linkBackend + "tournaments/" + idTournament, { pseudo: pseudoInput.trim() });
      setPseudoInput("");
    } catch { setError(true); }
    finally { recharge(); setLoad(false); }
  };

  const createPlayers = async () => {
    const n = Number(nbJoueurs);
    if (!n || n < 1) return;
    setLoad(true);
    try {
      await axios.post(linkBackend + "tournaments/create_players/" + idTournament, { nbPlayers: n });
      setNbJoueurs("");
    } catch { setError(true); }
    finally { recharge(); setLoad(false); }
  };

  const goTournament = () => {
    Alert.alert("Lancer le concours", "Confirmer le lancement ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Lancer 🚀", onPress: async () => {
        setLoad(true);
        try { await axios.put(linkBackend + `gotournaments/${listPlayers.style}/` + idTournament); }
        catch { setError(true); }
        finally { recharge(); setLoad(false); }
      }},
    ]);
  };

  return (
    <View className="gap-4">
      {/* En attente */}
      <View className="bg-white rounded-2xl p-4 shadow-sm border border-border">
        <Text className="font-semibold text-primary mb-3">⏳ En attente ({attente.length})</Text>
        {attente.length === 0
          ? <Text className="text-gray-400 text-sm">Aucun joueur en attente</Text>
          : attente.map((j) => (
            <View key={j.id_user} className="flex-row items-center justify-between py-2 border-b border-border last:border-0">
              <Text className="text-primary font-medium">{j.pseudo}</Text>
              <View className="flex-row gap-2">
                <TouchableOpacity onPress={() => deletePlayer(j.id_user, j.pseudo)} className="px-3 py-1.5 rounded-lg border border-red-200">
                  <Text className="text-red-500 text-xs">Refuser</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => acceptPlayer(j.id_user, j.pseudo)} className="px-3 py-1.5 rounded-lg border border-green-200">
                  <Text className="text-green-600 text-xs">Accepter</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        }
      </View>

      {/* Acceptés */}
      <View className="bg-white rounded-2xl p-4 shadow-sm border border-border">
        <Text className="font-semibold text-primary mb-3">✅ Acceptés ({valides.length})</Text>
        {valides.length === 0
          ? <Text className="text-gray-400 text-sm">Aucun joueur accepté</Text>
          : valides.map((j) => (
            <View key={j.numero} className="flex-row items-center justify-between py-2 border-b border-border last:border-0">
              <Text className="text-primary font-medium">{j.pseudo} <Text className="text-gray-400 text-sm">#{j.numero}</Text></Text>
            </View>
          ))
        }
      </View>

      {/* Ajouter manuellement */}
      <View className="bg-white rounded-2xl p-4 shadow-sm border border-border">
        <Text className="font-semibold text-primary mb-3">➕ Ajouter manuellement</Text>
        <View className="flex-row gap-2">
          <TextInput
            className="flex-1 h-11 px-3 rounded-xl border border-border bg-bg text-primary text-sm"
            placeholder="Nom de l'équipe..."
            placeholderTextColor="#9ca3af"
            value={pseudoInput}
            onChangeText={setPseudoInput}
          />
          <TouchableOpacity onPress={addPlayerManual} className="h-11 px-4 bg-primary rounded-xl items-center justify-center">
            <Text className="text-white font-medium text-sm">OK</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Créer automatiquement */}
      <View className="bg-white rounded-2xl p-4 shadow-sm border border-border">
        <Text className="font-semibold text-primary mb-3">🤖 Créer automatiquement</Text>
        <View className="flex-row gap-2">
          <TextInput
            className="flex-1 h-11 px-3 rounded-xl border border-border bg-bg text-primary text-sm"
            placeholder="Nombre d'équipes"
            placeholderTextColor="#9ca3af"
            value={nbJoueurs}
            onChangeText={setNbJoueurs}
            keyboardType="numeric"
          />
          <TouchableOpacity onPress={createPlayers} className="h-11 px-4 bg-primary rounded-xl items-center justify-center">
            <Text className="text-white font-medium text-sm">Créer</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lancer */}
      <TouchableOpacity onPress={goTournament} className="bg-gold py-4 rounded-2xl items-center shadow-lg">
        <Text className="text-white font-bold text-lg">🚀 Lancer le concours</Text>
      </TouchableOpacity>
    </View>
  );
}

function MatchsTab({ data, paires, handleWinner, responseWin }) {
  return (
    <View className="gap-4">
      {!!responseWin && (
        <View className="bg-primary/10 rounded-xl p-3">
          <Text className="text-primary text-sm text-center">{responseWin}</Text>
        </View>
      )}
      {/* Vainqueurs de groupes */}
      {data.vainqueurs && Object.entries(data.vainqueurs)
        .filter(([, v]) => v)
        .map(([k, v]) => (
          <View key={k} className="bg-primary rounded-2xl p-4 flex-row items-center gap-3">
            <Text className="text-2xl">🏆</Text>
            <View>
              <Text className="text-gold text-xs font-medium">Groupe {k.replace("vainqueur", "")}</Text>
              <Text className="text-white font-semibold">{v}</Text>
            </View>
          </View>
        ))
      }
      {/* Matchs */}
      {paires.rounds && [...paires.rounds].sort((a, b) => b - a).map((r) => {
        const matchs = data.matches.filter((m) => m.round === r);
        if (!matchs.length) return null;
        return (
          <View key={r} className="bg-white rounded-2xl p-4 shadow-sm border border-border">
            <Text className="font-semibold text-primary mb-3">
              {r === 4 ? "Phase finale" : data.style === "classement" ? `Poules — Tour ${r}` : `Round ${r}`}
            </Text>
            {matchs.map((m, i) => (
              <MatchCard key={i} match={m} handleWinner={handleWinner} />
            ))}
          </View>
        );
      })}
    </View>
  );
}

function MatchCard({ match: m, handleWinner }) {
  return (
    <View className="bg-bg-mid rounded-xl p-3 mb-2">
      <View className="flex-row items-center gap-2 mb-2">
        {m.groupe && <Text className="text-xs text-gray-400">Groupe {m.groupe}</Text>}
        {m.barrage === 1 && <View className="bg-orange-100 px-2 py-0.5 rounded-full"><Text className="text-orange-500 text-xs">Barrage</Text></View>}
      </View>
      <View className="flex-row items-center gap-2">
        <View className="flex-1 bg-white rounded-xl p-2 items-center">
          <Text className="font-semibold text-primary text-sm" numberOfLines={1}>{m.pseudo_A}</Text>
          {m.id_winner > 0 && <Text className="text-xs text-gray-400">{m.score_A}</Text>}
        </View>
        <Text className="text-gray-400 font-bold text-xs">VS</Text>
        <View className="flex-1 bg-white rounded-xl p-2 items-center">
          <Text className="font-semibold text-primary text-sm" numberOfLines={1}>{m.pseudo_B ?? "?"}</Text>
          {m.id_winner > 0 && <Text className="text-xs text-gray-400">{m.score_B}</Text>}
        </View>
      </View>
      {m.id_playerB > 0 && !m.id_winner && (
        <View className="flex-row gap-2 mt-2">
          <TouchableOpacity
            onPress={() => handleWinner(m.id_playerA, m.id_playerB, m)}
            className="flex-1 bg-primary py-2 rounded-xl items-center"
          >
            <Text className="text-white text-xs font-medium">🏆 {m.pseudo_A}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleWinner(m.id_playerB, m.id_playerA, m)}
            className="flex-1 bg-primary py-2 rounded-xl items-center"
          >
            <Text className="text-white text-xs font-medium">🏆 {m.pseudo_B}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function ClassementTab({ classement }) {
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <View className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
      <View className="flex-row bg-primary px-4 py-3">
        {["#", "Équipe", "Pts", "Diff", "V"].map((h) => (
          <Text key={h} className="text-white/70 text-xs font-medium flex-1 text-center">{h}</Text>
        ))}
      </View>
      {classement.map((p, i) => (
        <View key={p.numero} className={`flex-row px-4 py-3 border-b border-border ${i < 3 ? "bg-gold/5" : ""}`}>
          <Text className="flex-1 text-center text-sm font-bold text-primary">{i < 3 ? medals[i] : i + 1}</Text>
          <Text className="flex-1 text-center text-sm text-primary font-medium" numberOfLines={1}>{p.pseudo}</Text>
          <Text className="flex-1 text-center text-sm font-bold text-gold">{p.points}</Text>
          <Text className={`flex-1 text-center text-sm font-medium ${p.diff >= 0 ? "text-green-600" : "text-red-500"}`}>
            {p.diff >= 0 ? `+${p.diff}` : p.diff}
          </Text>
          <Text className="flex-1 text-center text-sm text-primary">{p.nb_win}</Text>
        </View>
      ))}
    </View>
  );
}

function MapTab({ positions }) {
  if (!positions.length) {
    return (
      <View className="bg-white rounded-2xl p-6 items-center border border-border">
        <Text className="text-gray-400 text-sm">Aucune position disponible</Text>
      </View>
    );
  }
  const center = { latitude: Number(positions[0].latitude), longitude: Number(positions[0].longitude) };
  return (
    <View className="rounded-2xl overflow-hidden shadow-sm border border-border">
      <View className="bg-white px-4 py-3 border-b border-border flex-row justify-between">
        <Text className="font-semibold text-primary text-sm">Positions des joueurs</Text>
        <Text className="text-gray-400 text-xs self-center">{positions.length} joueur{positions.length > 1 ? "s" : ""}</Text>
      </View>
      <MapView
        style={{ height: 320 }}
        initialRegion={{ ...center, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
      >
        {positions.map((p, i) => (
          <Marker
            key={i}
            coordinate={{ latitude: Number(p.latitude), longitude: Number(p.longitude) }}
            title={p.pseudo}
            description={`N°${p.numero}`}
          />
        ))}
      </MapView>
    </View>
  );
}
