import type React from "react";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useAutenticacion } from "../hooks/useAutenticacion";
import type { ProductDetailScreenProps } from "../navigation/types";
import { apiClient } from "../config/apiClient";
import { obtenerDetalleProducto } from "../services/productService";
import {
  formatearTiposAlmacenamiento,
  type EtiquetaTipoAlmacenamiento,
} from "../utils/storageTypeFormatter";
import SuccessModal from "../components/SuccessModal";

// Constants para consistencia de spacing y sizes
const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

const TOUCH_TARGET_MIN = 44;

type StorageType = string;

const getTodayDateInputValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * ProductDetailScreen - Pantalla para ver detalle y agregar un producto al inventario.
 *
 * Muestra la información de un producto obtenido de la base de datos,
 * permite seleccionar fecha de compra, cantidad y tipo de almacenamiento,
 * y calcula automáticamente la fecha de vencimiento según el tipo elegido.
 *
 * Responsabilidades:
 * - Cargar detalle del producto desde la API
 * - Permitir seleccionar fecha de compra, cantidad y tipo de almacenamiento
 * - Calcular fecha de vencimiento según tipo de almacenamiento
 * - Agregar el producto al inventario del usuario
 * - Mostrar modal de éxito al completar la operación
 *
 * @param route - Parámetros de ruta (productoId)
 * @param navigation - Props de navegación para ProductDetailScreen
 */
export default function DetalleProducto({
  route,
  navigation,
}: ProductDetailScreenProps) {
  const { productoId } = route.params || {};
  const { tokenSesion, usuario } = useAutenticacion();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<unknown>(null);

  const [nombreProducto, setNombreProducto] = useState("");
  const [fechaCompra, setFechaCompra] = useState(getTodayDateInputValue());
  const [cantidad, setCantidad] = useState("1");
  const [tipoAlmacenamiento, setTipoAlmacenamiento] = useState<StorageType>("");
  const [fechaVenc, setFechaVenc] = useState<string | null>(null);
  const [duracionDias, setDuracionDias] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [storageOptions, setStorageOptions] = useState<
    EtiquetaTipoAlmacenamiento[]
  >([]);
  const [modalExitoVisible, setModalExitoVisible] = useState(false);

  // Memoized fetch function para evitar dependencia excesiva
  const fetchDetalle = useCallback(async () => {
    if (!productoId) return;

    setLoading(true);
    setError(null);
    try {
      const json = await obtenerDetalleProducto(productoId);
      setDetalle(json);
      setNombreProducto(json?.nombre ?? "");

      // Formatear opciones de almacenamiento desde API
      const tipos = Array.isArray(json?.tipos_almacenamiento)
        ? json.tipos_almacenamiento
        : [];
      const formattedOptions = formatearTiposAlmacenamiento(tipos);
      setStorageOptions(formattedOptions);

      if (tipos.length) setTipoAlmacenamiento(tipos[0]);
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : "Error al cargar el producto";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [productoId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (mounted) {
        await fetchDetalle();
      }
    })();
    return () => {
      mounted = false;
    };
  }, [fetchDetalle]);

  // Memoized cálculo de fecha de vencimiento
  const calcularFechaVencimiento = useCallback(() => {
    if (!detalle) return;
    if (!fechaCompra || !tipoAlmacenamiento) {
      setFechaVenc(null);
      setDuracionDias(null);
      return;
    }

    const dur = (detalle as { duraciones?: unknown[] })?.duraciones?.find(
      (d: unknown) => {
        const dTyped = d as {
          tipo_almacenamiento?: string;
          duracion_dias_default?: number;
          duracion_dias_max?: number;
          duracion_dias_min?: number;
        };
        return (
          String(dTyped?.tipo_almacenamiento).toLowerCase() ===
          String(tipoAlmacenamiento).toLowerCase()
        );
      },
    ) as
      | {
          duracion_dias_default?: number;
          duracion_dias_max?: number;
          duracion_dias_min?: number;
        }
      | undefined;

    const dias =
      dur?.duracion_dias_default ??
      dur?.duracion_dias_max ??
      dur?.duracion_dias_min;
    if (!dias) {
      setFechaVenc(null);
      setDuracionDias(null);
      return;
    }
    const base = new Date(fechaCompra);
    if (Number.isNaN(base.getTime())) {
      setFechaVenc(null);
      setDuracionDias(null);
      return;
    }
    base.setDate(base.getDate() + Number(dias));
    setFechaVenc(base.toISOString().slice(0, 10));
    setDuracionDias(Number(dias));
  }, [detalle, fechaCompra, tipoAlmacenamiento]);

  useEffect(() => {
    calcularFechaVencimiento();
  }, [calcularFechaVencimiento]);

  const onAgregar = async () => {
    if (!tokenSesion || !usuario?.usuario_id) {
      setError("Sesión inválida");
      return;
    }
    if (!fechaCompra || !tipoAlmacenamiento) {
      setError("Completa fecha de compra y almacenamiento");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await apiClient.post("/api/inventario/agregar", {
        usuario_id: usuario.usuario_id,
        producto_id: productoId,
        fecha_compra: fechaCompra,
        tipo_almacenamiento: tipoAlmacenamiento,
        cantidad: parseInt(cantidad, 10) || 1,
      });
      setModalExitoVisible(true);
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : "No se pudo agregar al inventario";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const cerrarModalExito = () => {
    setModalExitoVisible(false);
  };

  const continuarDesdeModal = () => {
    navigation.navigate("Home");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Volver"
          accessibilityRole="button"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="arrow-left" size={24} color="#101828" />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Confirmar alimento</Text>
          <Text style={styles.headerSubtitle}>Revisa y guarda</Text>
        </View>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={24}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#00CA55" />
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        ) : error && !detalle ? (
          <View style={styles.centerContainer}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={48}
              color="#EF4444"
            />
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : detalle ? (
          <View style={styles.formContainer}>
            {/* Nombre del producto - Display only */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre del producto</Text>
              <View style={styles.displayContainer}>
                <Text style={styles.displayText}>{nombreProducto || "—"}</Text>
              </View>
            </View>

            {/* Fecha de compra */}
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
                  value={fechaCompra}
                  onChangeText={setFechaCompra}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9AAAB6"
                  style={styles.textInput}
                  keyboardType="default"
                  accessibilityLabel="Fecha de compra"
                />
              </View>
            </View>

            {/* Cantidad */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cantidad</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="package-variant"
                  size={20}
                  color="#6B7F95"
                  style={styles.inputIcon}
                />
                <TextInput
                  value={cantidad}
                  onChangeText={setCantidad}
                  placeholder="1"
                  placeholderTextColor="#9AAAB6"
                  style={styles.textInput}
                  keyboardType="number-pad"
                  accessibilityLabel="Cantidad"
                />
              </View>
            </View>

            {/* Tipo de almacenamiento */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de almacenamiento</Text>
              <View style={styles.storageOptions}>
                {storageOptions.map((option) => (
                  <Pressable
                    key={option.apiValue}
                    onPress={() => setTipoAlmacenamiento(option.apiValue)}
                    style={[
                      styles.storageCard,
                      tipoAlmacenamiento === option.apiValue &&
                        styles.storageCardSelected,
                    ]}
                    accessibilityLabel={`Seleccionar ${option.displayLabel}`}
                    accessibilityRole="radio"
                    accessibilityState={{
                      selected: tipoAlmacenamiento === option.apiValue,
                    }}
                  >
                    {/* Radio Button */}
                    <View style={styles.radioButton}>
                      {tipoAlmacenamiento === option.apiValue && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>

                    {/* Icon Container */}
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: option.bgColor },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={
                          option.icon as React.ComponentProps<
                            typeof MaterialCommunityIcons
                          >["name"]
                        }
                        size={20}
                        color={option.iconColor}
                      />
                    </View>

                    {/* Text */}
                    <View style={styles.storageTextContainer}>
                      <Text style={styles.storageTitle}>
                        {option.displayLabel}
                      </Text>
                      <Text style={styles.storageSubtitle}>
                        {option.subtitle}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Duración estimada */}
            {duracionDias !== null && (
              <View style={styles.durationBox}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color="#016630"
                  style={{ marginRight: SPACING.sm }}
                />
                <Text style={styles.durationText}>
                  Duración estimada:{" "}
                  <Text style={styles.durationBold}>{duracionDias} días</Text>
                </Text>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={20}
                  color="#EF4444"
                  style={{ marginRight: SPACING.sm }}
                />
                <Text style={styles.errorMessage}>{error}</Text>
              </View>
            )}
          </View>
        ) : null}
      </KeyboardAwareScrollView>

      <SuccessModal
        visible={modalExitoVisible}
        iconName="check-circle"
        title="¡Alimento guardado!"
        description="Tu alimento se agregó correctamente a tu inventario."
        buttonText="Continuar"
        onButtonPress={continuarDesdeModal}
        onClose={cerrarModalExito}
      />

      {/* Botón */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            saving && styles.saveButtonDisabled,
            pressed && !saving && styles.saveButtonPressed,
          ]}
          onPress={onAgregar}
          disabled={saving}
          accessibilityLabel={
            saving ? "Guardando alimento" : "Guardar alimento en inventario"
          }
          accessibilityRole="button"
          accessibilityState={{ disabled: saving }}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar en inventario</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.lg,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    minWidth: TOUCH_TARGET_MIN,
    minHeight: TOUCH_TARGET_MIN,
    borderRadius: TOUCH_TARGET_MIN / 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#101828",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6A7282",
    marginTop: 2,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xxl,
    paddingBottom: 120,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xxxl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 15,
    color: "#6B7280",
  },
  formContainer: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: SPACING.xxl,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#364153",
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  displayContainer: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: SPACING.lg,
    height: 56,
    justifyContent: "center",
  },
  displayText: {
    fontSize: 16,
    color: "#101828",
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: SPACING.lg,
    height: 56,
  },
  inputIcon: {
    marginRight: SPACING.md,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#101828",
  },
  storageOptions: {
    gap: SPACING.md,
  },
  storageCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: SPACING.lg,
  },
  storageCardSelected: {
    backgroundColor: "#F0FDF4",
    borderColor: "#00CA55",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.lg,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#00CA55",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  storageTextContainer: {
    flex: 1,
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#101828",
    marginBottom: 2,
  },
  storageSubtitle: {
    fontSize: 14,
    color: "#6A7282",
  },
  durationBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#B9F8CF",
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
  durationText: {
    fontSize: 14,
    color: "#016630",
    flex: 1,
  },
  durationBold: {
    fontWeight: "600",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  errorMessage: {
    fontSize: 14,
    color: "#DC2626",
    flex: 1,
  },
  error: {
    fontSize: 14,
    color: "#EF4444",
    marginTop: SPACING.md,
    textAlign: "center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.lg,
  },
  saveButton: {
    backgroundColor: "#00CA55",
    borderRadius: 16,
    paddingVertical: SPACING.lg,
    justifyContent: "center",
    alignItems: "center",
    minHeight: TOUCH_TARGET_MIN + 4,
    shadowColor: "#00CA55",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonPressed: {
    backgroundColor: "#00B349",
    transform: [{ scale: 0.98 }],
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
