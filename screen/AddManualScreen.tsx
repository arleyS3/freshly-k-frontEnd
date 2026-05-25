import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import type { AgregarManualScreenProps } from '../navigation/types';
import { useAutenticacion } from '../hooks/useAutenticacion';
import { apiClient } from '../config/apiClient';

/**
 * Tipos de almacenamiento disponibles para un alimento.
 */
type StorageType = "ambiente" | "refrigerado" | "congelado" | null;

/**
 * Opción visual de almacenamiento mostrada en la pantalla.
 */
interface StorageOption {
  id: Exclude<StorageType, null>;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  bgColor: string;
}

/**
 * AgregarManual - Pantalla para agregar un alimento manualmente al inventario.
 *
 * Permite ingresar nombre, fecha de compra, fecha de vencimiento
 * y tipo de almacenamiento. Muestra un modal de confirmación
 * cuando el guardado se completa exitosamente.
 *
 * Responsabilidades:
 * - Capturar datos del alimento ingresados por el usuario
 * - Validar campos obligatorios antes de enviar
 * - Convertir fechas al formato esperado por el backend
 * - Guardar el producto a través de la API
 *
 * @param navigation - Props de navegación para AgregarManualScreen
 */
const AgregarManual = ({ navigation }: AgregarManualScreenProps) => {
  const { usuario } = useAutenticacion();
  const [foodName, setFoodName] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [storageType, setStorageType] = useState<StorageType>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const storageOptions: StorageOption[] = [
    {
      id: "ambiente",
      title: "Ambiente",
      subtitle: "Despensa o alacena",
      icon: "food-apple-outline",
      color: "#FF8C42",
      bgColor: "#FFF4ED",
    },
    {
      id: "refrigerado",
      title: "Refrigerado",
      subtitle: "En la nevera",
      icon: "fridge-outline",
      color: "#5B8DEF",
      bgColor: "#EEF3FC",
    },
    {
      id: "congelado",
      title: "Congelado",
      subtitle: "En el congelador",
      icon: "snowflake",
      color: "#36C5D3",
      bgColor: "#E8F9FB",
    },
  ];

  /**
   * Guarda el producto manual en el inventario del usuario.
   * Valida los campos y llama al endpoint de producto manual.
   */
  const handleSave = async () => {
    // Validación de campos requeridos
    if (!foodName.trim()) {
      Alert.alert("Campo requerido", "Ingresa el nombre del alimento");
      return;
    }
    if (!purchaseDate.trim()) {
      Alert.alert("Campo requerido", "Ingresa la fecha de compra");
      return;
    }
    if (!expirationDate.trim()) {
      Alert.alert("Campo requerido", "Ingresa la fecha de vencimiento del empaque");
      return;
    }
    if (!storageType) {
      Alert.alert("Campo requerido", "Selecciona el tipo de almacenamiento");
      return;
    }
    if (!usuario?.usuario_id) {
      Alert.alert("Error", "No se pudo identificar al usuario");
      return;
    }

    setSaving(true);

    // Convertir fechas de formato DD/MM/YYYY a YYYY-MM-DD para el backend
    const convertirFecha = (fecha: string): string => {
      const partes = fecha.split("/");
      if (partes.length === 3) {
        return `${partes[2]}-${partes[1]}-${partes[0]}`;
      }
      return fecha;
    };

    try {
      await apiClient.post("/api/inventario/agregar-manual", {
        usuario_id: usuario.usuario_id,
        nombre_personalizado: foodName.trim(),
        fecha_compra: convertirFecha(purchaseDate),
        fecha_vencimiento: convertirFecha(expirationDate),
        tipo_almacenamiento: storageType,
        cantidad: 1,
        unidad: "unidad",
      });

      setModalVisible(true);
    } catch (error) {
      console.error("Error al guardar producto manual:", error);
      Alert.alert(
        "Error",
        "No se pudo guardar el producto. Verifica los datos e intenta de nuevo."
      );
    } finally {
      setSaving(false);
    }
  };

  /**
   * Cierra el modal y vuelve a la pantalla anterior.
   */
  const handleContinue = () => {
    setModalVisible(false);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0B1D2E" />
        </Pressable>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Agregar manual</Text>
          <Text style={styles.subtitle}>Completa la información</Text>
        </View>
      </View>

      <View style={styles.descriptionBanner}>
        <MaterialCommunityIcons
          name="information-outline"
          size={20}
          color="#5B8DEF"
        />
        <Text style={styles.descriptionText}>
          Usa esta opción para productos empacados que ya tienen la fecha de{" "}
          <Text style={styles.descriptionHighlight}>vencimiento en el empaque</Text>{" "}
          (yogurt, leche, galletas, jamón, etc.).{"\n"}
          {"\n"}Si el producto no está empacado, usa la búsqueda para agregarlo.
        </Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre del alimento</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="tag-outline"
              size={20}
              color="#6B7F95"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Piña"
              placeholderTextColor="#9CA8B5"
              value={foodName}
              onChangeText={setFoodName}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fecha de compra</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="calendar-blank"
              size={20}
              color="#6B7F95"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="12/02/2026"
              placeholderTextColor="#9CA8B5"
              value={purchaseDate}
              onChangeText={setPurchaseDate}
            />
          </View>
          
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fecha de vencimiento</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="calendar-clock"
              size={20}
              color="#6B7F95"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="15/03/2026"
              placeholderTextColor="#9CA8B5"
              value={expirationDate}
              onChangeText={setExpirationDate}
            />
          </View>
          <Text style={styles.helperText}>
            Esta fecha debes verla en el empaque del producto
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tipo de almacenamiento</Text>
          <View style={styles.storageOptionsContainer}>
            {storageOptions.map((option) => (
              <Pressable
                key={option.id}
                style={[
                  styles.storageCard,
                  storageType === option.id && styles.storageCardSelected,
                ]}
                onPress={() => setStorageType(option.id as StorageType)}
              >
                <View
                  style={[
                    styles.storageIconContainer,
                    { backgroundColor: option.bgColor },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={option.icon as any}
                    size={24}
                    color={option.color}
                  />
                </View>
                <View style={styles.storageTextContainer}>
                  <Text style={styles.storageTitle}>{option.title}</Text>
                  <Text style={styles.storageSubtitle}>{option.subtitle}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Guardando..." : "Guardar alimento"}
          </Text>
        </Pressable>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.successIconContainer}>
              <View style={styles.successIconCircle}>
                <MaterialCommunityIcons
                  name="check"
                  size={40}
                  color="#00CA55"
                />
              </View>
            </View>

            <Text style={styles.modalTitle}>¡Alimento guardado!</Text>
            <Text style={styles.modalMessage}>
              Tu alimento se agregó correctamente a tu inventario.
            </Text>

            <Pressable
              style={styles.modalButton}
              onPress={handleContinue}
            >
              <Text style={styles.modalButtonText}>Continuar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FDF9",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  backButton: {
    marginTop: 4,
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0B1D2E",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7F95",
  },
  descriptionBanner: {
    flexDirection: "row",
    backgroundColor: "#EEF3FC",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 24,
    alignItems: "flex-start",
  },
  descriptionText: {
    flex: 1,
    fontSize: 13,
    color: "#4A5568",
    lineHeight: 20,
    marginLeft: 12,
  },
  descriptionHighlight: {
    fontWeight: "600",
    color: "#2D3748",
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  inputGroup: {
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
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#0B1D2E",
  },
  helperText: {
    fontSize: 12,
    color: "#9CA8B5",
    marginTop: 8,
    marginLeft: 4,
  },
  storageOptionsContainer: {
    gap: 12,
  },
  storageCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: "transparent",
  },
  storageCardSelected: {
    borderColor: "#00CA55",
  },
  storageIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  storageTextContainer: {
    flex: 1,
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0B1D2E",
    marginBottom: 2,
  },
  storageSubtitle: {
    fontSize: 14,
    color: "#6B7F95",
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  saveButton: {
    backgroundColor: "#00CA55",
    borderRadius: 12,
    paddingVertical: 16,
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
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  saveButtonDisabled: {
    backgroundColor: "#A8D5B8",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 360,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E6F9F0",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0B1D2E",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#6B7F95",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 24,
  },
  modalButton: {
    backgroundColor: "#00CA55",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});

export default AgregarManual;
