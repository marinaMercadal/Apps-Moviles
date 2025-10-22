import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  ImageBackground,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { Images } from "../../assets/images";
import { useAuth } from "../../context/AuthContext";

type Mode = "login" | "register";

export default function LoginScreen() {
  const translateY = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const { login, register } = useAuth(); // register(email, password, username, name)

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState(""); // register
  const [name, setName] = useState("");         // register (opcional)
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");   // register
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (mode === "login") {
      if (!email || !password) return Alert.alert("Error", "Por favor ingresa email y contraseña");
      setIsLoading(true);
      try {
        await login(email, password);
        router.replace("/(tabs)");
      } catch (error: any) {
        Alert.alert("Error", error.message || "Error al iniciar sesión");
      } finally {
        setIsLoading(false);
      }
    } else {
      // register
      if (!email || !username || !password) {
        return Alert.alert("Error", "Email, usuario y contraseña son obligatorios.");
      }
      if (password.length < 6) {
        return Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres.");
      }
      if (password !== confirm) {
        return Alert.alert("Error", "Las contraseñas no coinciden.");
      }
      setIsLoading(true);
      try {
        await register(email, password, username, name);
        router.replace("/(tabs)");
      } catch (error: any) {
        Alert.alert("Error", error.message || "Error al registrarse");
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      Animated.timing(translateY, {
        toValue: -200,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [translateY]);

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: "#1B1935" }}
      bounces
    >
      <View style={styles.container}>
        <ImageBackground source={Images.fondoLogin} style={styles.headerImage} resizeMode="cover">
          <View style={styles.overlay} />
        </ImageBackground>

        <Animated.View style={[styles.loginBox, { transform: [{ translateY }] }]}>
          {/* Toggle Login / Register */}
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, mode === "login" && styles.toggleActive]}
              onPress={() => setMode("login")}
            >
              <Ionicons name="log-in-outline" size={16} color={mode === "login" ? "#1B1935" : "#ccc"} />
              <Text style={[styles.toggleText, mode === "login" && styles.toggleTextActive]}>Iniciar sesión</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, mode === "register" && styles.toggleActive]}
              onPress={() => setMode("register")}
            >
              <Ionicons name="person-add-outline" size={16} color={mode === "register" ? "#1B1935" : "#ccc"} />
              <Text style={[styles.toggleText, mode === "register" && styles.toggleTextActive]}>Registrarme</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{mode === "login" ? "Login" : "Crear cuenta"}</Text>
          <Text style={styles.subtitle}>
            {mode === "login" ? "Ingresa sesión para continuar" : "Completá tus datos para registrarte"}
          </Text>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#8c8c8c" style={styles.icon} />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#8c8c8c"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Campos extra (register) */}
          {mode === "register" && (
            <>
              <View style={styles.inputContainer}>
                <Ionicons name="at-outline" size={20} color="#8c8c8c" style={styles.icon} />
                <TextInput
                  placeholder="Usuario"
                  placeholderTextColor="#8c8c8c"
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#8c8c8c" style={styles.icon} />
                <TextInput
                  placeholder="Nombre (opcional)"
                  placeholderTextColor="#8c8c8c"
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </>
          )}

          {/* Password */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#8c8c8c" style={styles.icon} />
            <TextInput
              placeholder="Contraseña"
              placeholderTextColor="#8c8c8c"
              secureTextEntry
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Confirmación (register) */}
          {mode === "register" && (
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color="#8c8c8c" style={styles.icon} />
              <TextInput
                placeholder="Confirmar contraseña"
                placeholderTextColor="#8c8c8c"
                secureTextEntry
                style={styles.input}
                value={confirm}
                onChangeText={setConfirm}
              />
            </View>
          )}

          {mode === "login" && <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>}

          <TouchableOpacity style={styles.loginButton} onPress={handleSubmit} disabled={isLoading}>
            <Text style={styles.loginText}>
              {isLoading ? (mode === "login" ? "Iniciando..." : "Creando...") : mode === "login" ? "Login" : "Registrarme"}
            </Text>
            
          </TouchableOpacity>

          {mode === "login" ? (
            <Text style={styles.register}>
              ¿No tienes cuenta?{" "}
              <Text style={{ color: "#F2A8A8" }} onPress={() => setMode("register")}>
                Registrate acá.
              </Text>
            </Text>
          ) : (
            <Text style={styles.register}>
              ¿Ya tienes cuenta?{" "}
              <Text style={{ color: "#F2A8A8" }} onPress={() => setMode("login")}>
                Iniciá sesión acá.
              </Text>
            </Text>
          )}
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1B1935" },
  headerImage: { width: "100%", height: 250 },
  overlay: { flex: 1, backgroundColor: "rgba(27,25,53,0.6)" },
  loginBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    marginTop: 20,
    marginBottom: 10,
    width: "90%",
    alignSelf: "center",
    backgroundColor: "rgba(43, 40, 69, 0.6)",
    borderRadius: 20,
    paddingVertical: 15,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  toggleRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  toggleActive: { backgroundColor: "#F2A8A8", borderColor: "#F2A8A8" },
  toggleText: { color: "#ccc", fontWeight: "600" },
  toggleTextActive: { color: "#1B1935" },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 5 },
  subtitle: { fontSize: 14, color: "#aaa", marginBottom: 25 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2d2a45",
    borderRadius: 25,
    paddingHorizontal: 15,
    marginTop: 15,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, color: "#fff", paddingVertical: 12 },
  forgot: { alignSelf: "flex-end", marginTop: 8, marginRight: 10, color: "#8c8c8c", fontSize: 12 },
  loginButton: { marginTop: 25, backgroundColor: "#F2A8A8", paddingVertical: 12, paddingHorizontal: 80, borderRadius: 25 },
  loginText: { color: "#1B1935", fontSize: 16, fontWeight: "bold", textAlign: "center" },
  register: { marginTop: 20, color: "#8c8c8c", fontSize: 12, textAlign: "center" },
});
