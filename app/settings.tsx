import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_ORIGIN, API_URL } from "../config";
import { useAuth } from "../context/AuthContext";

type AvatarItem = { id: number; url: string; label?: string };

function AnimatedModal({
  visible,
  progress,
  scaleAnim,
  opacityAnim,
  onClose,
  children,
}: {
  visible: boolean;
  progress: number;
  scaleAnim: Animated.Value;
  opacityAnim: Animated.Value;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.animatedModal, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.modalBorder} />
          <View style={styles.modalContent}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default function SettingsScreen() {
  const { user, token, setUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [savingName, setSavingName] = useState(false);

  const [avatars, setAvatars] = useState<AvatarItem[]>([]);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState<number | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);

  // ✅ Animación modal de éxito
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalProgress, setModalProgress] = useState(0);
  const modalScaleAnim = useRef(new Animated.Value(0)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setName(user?.name || "");
  }, [user]);

  useEffect(() => {
    fetch(`${API_URL}/avatars`)
      .then((r) => r.json())
      .then((j) => setAvatars(j.items || []))
      .catch(() => setAvatars([]));
  }, []);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Ajustes</Text>
        <Text style={styles.text}>Iniciá sesión para editar tu perfil.</Text>
      </View>
    );
  }

  const full = (url?: string | null) =>
    url ? (url.startsWith("http") ? url : `${API_ORIGIN}${url}`) : undefined;

  const currentAvatarUri = full(user.profileImage?.url);

  const showSuccessModal = (message: string) => {
    setModalMessage(message);
    setModalProgress(0);
    setModalVisible(true);

    const progressInterval = setInterval(() => {
      setModalProgress((prev) => {
        if (prev >= 85) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 12;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(progressInterval);
      setModalProgress(100);
      setTimeout(() => setModalVisible(false), 800);
    }, 1000);
  };

  useEffect(() => {
    if (modalVisible) {
      Animated.parallel([
        Animated.timing(modalScaleAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
        Animated.timing(modalOpacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalScaleAnim, { toValue: 0, duration: 300, easing: Easing.in(Easing.back(1.5)), useNativeDriver: true }),
        Animated.timing(modalOpacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [modalVisible]);

  const saveName = async () => {
    try {
      setSavingName(true);
      const res = await fetch(`${API_URL}/auth/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message || "No se pudo actualizar el nombre");

      await AsyncStorage.setItem("user", JSON.stringify(j.user));
      setUser(j.user);
      showSuccessModal("Nombre actualizado ✅");
    } catch (e: any) {
      showSuccessModal("Error al actualizar el nombre ❌");
    } finally {
      setSavingName(false);
    }
  };

  const openAvatarPicker = () => {
    const currentId = user.profileImageId ?? null;
    setSelectedAvatarId(currentId);
    setAvatarPickerOpen(true);
  };

  const saveAvatar = async () => {
    if (!selectedAvatarId) {
      showSuccessModal("Elegí un avatar ❌");
      return;
    }
    try {
      setSavingAvatar(true);
      const res = await fetch(`${API_URL}/auth/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ profileImageId: selectedAvatarId }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message || "No se pudo actualizar el avatar");

      await AsyncStorage.setItem("user", JSON.stringify(j.user));
      setUser(j.user);
      setAvatarPickerOpen(false);
      showSuccessModal("Avatar actualizado ✅");
    } catch (e: any) {
      showSuccessModal("Error al actualizar el avatar ❌");
    } finally {
      setSavingAvatar(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Ajustes</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Perfil</Text>
        <View style={styles.row}>
          <Image
            source={currentAvatarUri ? { uri: currentAvatarUri } : require("../assets/images/profile-placeholder.png")}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.btn} onPress={openAvatarPicker}>
            <Text style={styles.btnText}>Cambiar foto</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.label}>Nombre</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Tu nombre" placeholderTextColor="#999" style={styles.input} />
        <TouchableOpacity style={styles.btn} onPress={saveName} disabled={savingName}>
          <Text style={styles.btnText}>{savingName ? "Guardando..." : "Guardar nombre"}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={avatarPickerOpen} animationType="slide" transparent onRequestClose={() => setAvatarPickerOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBody}>
            <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Elegí tu avatar</Text>
            <ScrollView contentContainerStyle={styles.grid}>
              {avatars.map((a) => {
                const isSelected = selectedAvatarId === a.id;
                return (
                  <TouchableOpacity key={a.id} onPress={() => setSelectedAvatarId(a.id)} style={styles.gridItem}>
                    <Image
                      source={{ uri: full(a.url)! }}
                      style={[styles.gridAvatar, { borderColor: isSelected ? "#F2A8A8" : "#444", borderWidth: isSelected ? 3 : 1 }]}
                    />
                    {!!a.label && <Text style={styles.gridLabel} numberOfLines={1}>{a.label}</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 6 }}>
              <TouchableOpacity style={[styles.btn, { flex: 1, backgroundColor: "#3b3355" }]} onPress={() => setAvatarPickerOpen(false)}>
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={saveAvatar} disabled={savingAvatar}>
                <Text style={styles.btnText}>{savingAvatar ? "Guardando..." : "Guardar"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <AnimatedModal visible={modalVisible} progress={modalProgress} scaleAnim={modalScaleAnim} opacityAnim={modalOpacityAnim} onClose={() => setModalVisible(false)}>
        <Text style={{ color: "#F2A8A8", fontSize: 18, fontWeight: "bold", textAlign: "center" }}>{modalMessage}</Text>
      </AnimatedModal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#1B1935", padding: 16 },
  title: { color: "#F2A8A8", fontSize: 22, fontWeight: "bold", marginBottom: 14 },
  card: { backgroundColor: "#2A273F", padding: 14, borderRadius: 10, marginBottom: 16 },
  sectionTitle: { color: "#fff", fontWeight: "bold", marginBottom: 10, fontSize: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#3a3850" },
  label: { color: "#ddd", marginTop: 8, marginBottom: 6, fontSize: 12 },
  input: { backgroundColor: "#3a3850", color: "#fff", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  btn: { backgroundColor: "#F2A8A8", borderRadius: 8, paddingVertical: 10, alignItems: "center", marginTop: 12 },
  btnText: { color: "#1B1935", fontWeight: "700" },
  text: { color: "#ddd" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 },
  modalBody: { backgroundColor: "#1B1935", borderRadius: 12, padding: 16, maxHeight: "80%" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridItem: { width: "30%", alignItems: "center" },
  gridAvatar: { width: 80, height: 80, borderRadius: 40 },
  gridLabel: { color: "#ccc", fontSize: 12, marginTop: 4, textAlign: "center", maxWidth: 80 },
  animatedModal: { backgroundColor: "#1B1935", borderRadius: 12, padding: 16, alignItems: "center" },
  modalBorder: { height: 3, width: "100%", backgroundColor: "#F2A8A8", marginBottom: 12 },
  modalContent: { paddingHorizontal: 8, paddingVertical: 12 },
});