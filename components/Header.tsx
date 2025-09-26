import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

export default function Header() {
  return (
    <View style={styles.header}>
      
      <TouchableOpacity activeOpacity={0.7} onPress={() => console.log("Abrir menú")}>
        <View style={styles.hamburger}>
          <View style={[styles.line, { width: 24 }]} />
          <View style={[styles.line, { width: 18 }]} />
          <View style={[styles.line, { width: 12 }]} />
        </View>
      </TouchableOpacity>

      <View style={{ flex: 1 }} />

   
      <TouchableOpacity activeOpacity={0.7} onPress={() => console.log("Ir al perfil")}>
        <Image
          source={require("../assets/images/profile-placeholder.png")}
          style={styles.profileImage}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60, 
    
    marginBottom: 20,
    shadowRadius: 4,
    elevation: 3,
  },
  hamburger: {
    justifyContent: "space-between",
    height: 20,
  },
  line: {
    height: 2,
    backgroundColor: "#B0B0B0",
    borderRadius: 1,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#555",
  },
});
