import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import type { ForgotPasswordScreenProps } from '../navigation/types';

/**
 * ForgotPasswordScreen - Pantalla para solicitar recuperación de contraseña.
 *
 * Permite al usuario ingresar su email para recibir un código
 * de verificación y restablecer su contraseña.
 *
 * Responsabilidades:
 * - Capturar el email del usuario
 * - Validar formato del email ingresado
 * - Enviar solicitud de código de recuperación
 * - Navegar de vuelta a LoginScreen
 *
 * @param navigation - Props de navegación para ForgotPasswordScreen
 */
const ForgotPassword = ({ navigation }: ForgotPasswordScreenProps) => {
  const [email, setEmail] = useState("");

  const handleSendCode = () => {
    // TODO: implementar flujo real de recuperación
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0B1D2E" />
        </Pressable>

        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="chef-hat" size={48} color="white" />
          </View>
        </View>

        <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>

        <Text style={styles.subtitle}>
          Ingresa tu email y te enviaremos un código
        </Text>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color="#6B7F95"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="arley@gmail.com"
              placeholderTextColor="#9CA8B5"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.infoBox}>
            <MaterialCommunityIcons
              name="email-fast-outline"
              size={18}
              color="#00875A"
            />
            <Text style={styles.infoText}>Recibirás un código de 6 dígitos por email</Text>
          </View>
        </View>

        <Pressable style={styles.sendButton} onPress={handleSendCode}>
          <Text style={styles.sendButtonText}>Enviar código</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text style={styles.backToLoginText}>Volver al inicio de sesión</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FDF9",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 40,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#00CA55",
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 28,
    fontWeight: "bold",
    color: "#0B1D2E",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7F95",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  formContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0B1D2E",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#0B1D2E",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6F9F0",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#00875A",
    lineHeight: 20,
  },
  sendButton: {
    backgroundColor: "#00CA55",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#00CA55",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  backToLoginText: {
    fontSize: 14,
    color: "#6B7F95",
    textAlign: "center",
    textDecorationLine: "underline",
  },
});

export default ForgotPassword;
