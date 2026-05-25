import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { IndexScreenProps } from '../navigation/types';

/**
 * IndexScreen - Pantalla de bienvenida y flujo inicial de la aplicación.
 *
 * Presenta la marca Freshly con sus valores principales y ofrece
 * las opciones de registro o inicio de sesión para nuevos y
 * existentes usuarios.
 *
 * Responsabilidades:
 * - Mostrar pantalla de bienvenida con logo y marca
 * - Navegar a RegisterScreen para nuevos usuarios
 * - Navegar a LoginScreen para usuarios existentes
 *
 * @param navigation - Props de navegación para IndexScreen
 */
export default function IndexScreen({ navigation }: IndexScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="chef-hat" size={48} color="white" />
          </View>
          <Text style={styles.title}>Freshly</Text>
          <Text style={styles.subtitle}>
            Gestiona tu comida, reduce desperdicios
          </Text>
        </View>

        <View style={styles.cardContainer}>
          <MaterialCommunityIcons name="leaf" size={56} color="#00CA55" />
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardText}>Ahorra dinero</Text>
            <Text style={styles.cardText}>Come mejor</Text>
            <Text style={styles.cardText}>Cuida el planeta</Text>
          </View>
        </View>

        <View style={styles.bottomContainer}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              navigation.navigate("Register");
            }}
          >
            <Text style={styles.primaryButtonText}>Comenzar</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => {
              navigation.navigate("Login");
            }}
          >
            <Text style={styles.secondaryButtonText}>Ya tengo cuenta</Text>
          </Pressable>

          <Text style={styles.footerText}>
            Sin tarjeta de crédito • Empieza gratis
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#F7FDF9",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 80,
    paddingHorizontal: 24,
    minHeight: "100%",
  },
  headerContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  logoContainer: {
    width: 88,
    height: 88,
    backgroundColor: "#00CA55",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#00CA55",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#0B1D2E",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7F95",
    textAlign: "center",
    lineHeight: 24,
  },
  cardContainer: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTextContainer: {
    flexDirection: "column",
    gap: 6,
  },
  cardText: {
    fontSize: 15,
    color: "#6B7F95",
    lineHeight: 22,
  },
  bottomContainer: {
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: "#00CA55",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#00CA55",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },
  secondaryButton: {
    width: "100%",
    backgroundColor: "white",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryButtonText: {
    color: "#0B1D2E",
    fontSize: 17,
    fontWeight: "600",
  },
  footerText: {
    fontSize: 13,
    color: "#9CA8B5",
    marginTop: 8,
    textAlign: "center",
  },
});
