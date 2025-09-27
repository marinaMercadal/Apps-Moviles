import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

interface ProfileProps {
  initialUser?: string;
}

export default function Profile({ initialUser }: ProfileProps) {
  // user o mail mostrado en el perfil
  const [user, setUser] = useState(initialUser || "");

  // Estado modal + input temporal
  const [visible, setVisible] = useState(false);
  const [draftUser, setDraftUser] = useState("");

  const abrirModal = () => {
    setDraftUser("");
    setVisible(true);
  };

  const guardar = () => {
    const valor = draftUser.trim();
    if (valor.length === 0) return;
    setUser(valor);
    setVisible(false);
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.label}>Usuario actual</Text>
      <Text style={styles.nombre}>{user}</Text>

      <Pressable style={styles.button} onPress={abrirModal}>
        <Text style={styles.btnText}>Cambiar user</Text>
      </Pressable>

      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={() => setVisible(false)}
      >
        <KeyboardAvoidingView style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cambiar user</Text>

            <TextInput
              value={draftUser}
              onChangeText={setDraftUser}
              placeholder="Ingresá tu user o email"
              placeholderTextColor={styles.placeholder.color} // 👈 desde styles
              autoFocus
              style={styles.input}
              returnKeyType="done"
              onSubmitEditing={guardar}
            />

            <View style={styles.row}>
              <Pressable
                style={[styles.button, styles.btnCancelar]}
                onPress={() => setVisible(false)}
              >
                <Text style={[styles.btnText, styles.btnTextCancelar]}>
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.button,
                  draftUser.trim().length === 0 && styles.btnDeshabilitado,
                ]}
                onPress={guardar}
              >
                <Text style={styles.btnText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#1B1935",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: "#F2A8A8",
  },
  nombre: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: "#fff",
  },
  button: {
    backgroundColor: "#d20404",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 140,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
  btnCancelar: {
    backgroundColor: "#2A273F",
  },
  btnTextCancelar: {
    color: "#F2A8A8",
  },
  btnDeshabilitado: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#2A273F",
    borderRadius: 16,
    padding: 20,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#F2A8A8",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#1B1935",
    color: "#fff",
    marginBottom: 16,
  },
  placeholder: {
    color: "#bbb", // 👈 placeholder más clarito
  },
  row: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-end",
  },
});
