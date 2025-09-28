import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  ImageBackground,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RegisterScreen() {
  const translateY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isReady, setIsReady] = useState(false); // 👈 controla carga
  const router = useRouter();

  useEffect(() => {
    if (isReady) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [isReady]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      Animated.timing(translateY, {
        toValue: -220,
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
      bounces={true}
    >
      {!isReady ? (
        // Loader mientras carga la imagen
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#F2A8A8" />
        </View>
      ) : null}

      <Animated.View
        style={[
          styles.container,
          { opacity: isReady ? fadeAnim : 0 },
        ]}
      >
        {/* Imagen */}
        <ImageBackground
          source={require("../../assets/images/imagen-fondo-login.jpg")}
          style={styles.headerImage}
          resizeMode="cover"
          onLoadEnd={() => setIsReady(true)} // 👈 marca como lista
        >
          <View style={styles.overlay} />
        </ImageBackground>

        {/* Caja de registro */}
        <Animated.View style={[styles.registerBox, { transform: [{ translateY }] }]}>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>
            Regístrate para comenzar a usar la app
          </Text>

          {/* Inputs */}
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#8c8c8c" style={styles.icon} />
            <TextInput placeholder="Username" placeholderTextColor="#8c8c8c" style={styles.input} />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#8c8c8c" style={styles.icon} />
            <TextInput placeholder="Email" placeholderTextColor="#8c8c8c" keyboardType="email-address" style={styles.input} />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#8c8c8c" style={styles.icon} />
            <TextInput placeholder="Contraseña" placeholderTextColor="#8c8c8c" secureTextEntry style={styles.input} />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#8c8c8c" style={styles.icon} />
            <TextInput placeholder="Confirmar Contraseña" placeholderTextColor="#8c8c8c" secureTextEntry style={styles.input} />
          </View>

          {/* Botón */}
          <TouchableOpacity style={styles.registerButton}>
            <Text style={styles.registerText}>Registrarse</Text>
          </TouchableOpacity>

          {/* Volver */}
          <Text style={styles.login}>
            ¿Ya tienes una cuenta?{" "}
            <Text style={{ color: "#F2A8A8" }} onPress={() => router.push("/login")}>
              Inicia sesión
            </Text>
          </Text>
        </Animated.View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1B1935" },
  headerImage: { width: "100%", height: 250 },
  overlay: { flex: 1, backgroundColor: "rgba(27,25,53,0.6)" },
  registerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    marginTop: 20,
    marginBottom: 50,
    width: "90%",
    alignSelf: "center",
    backgroundColor: "rgba(43, 40, 69, 0.6)",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 5 },
  subtitle: { fontSize: 14, color: "#aaa", marginBottom: 25, textAlign: "center" },
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
  registerButton: {
    marginTop: 25,
    backgroundColor: "#F2A8A8",
    paddingVertical: 12,
    paddingHorizontal: 80,
    borderRadius: 25,
  },
  registerText: { color: "#1B1935", fontSize: 16, fontWeight: "bold", textAlign: "center" },
  login: { marginTop: 20, color: "#8c8c8c", fontSize: 12 },
  loader: { 
     position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#1B1935",
    justifyContent: "center", // 👈 centra vertical
    alignItems: "center",     // 👈 centra horizontal
    zIndex: 10,               
  },
});
