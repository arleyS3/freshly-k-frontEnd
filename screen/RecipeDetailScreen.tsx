import type React from "react";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import RenderHtml from "react-native-render-html";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import type { RecipeDetailScreenProps } from "../navigation/types";
import type { RecetaDetalle } from "../models";
import { obtenerDetalleReceta } from "../services/recipeService";

/**
 * RecipeDetailScreen - Pantalla con el detalle completo de una receta.
 *
 * Muestra imagen, título, tiempo de preparación, porciones,
 * lista de ingredientes con cantidades e instrucciones paso a paso.
 * Soporta modo oscuro.
 *
 * Responsabilidades:
 * - Cargar detalle de la receta desde la API
 * - Mostrar imagen, título, tiempo y porciones
 * - Listar ingredientes con cantidades y unidades
 * - Mostrar instrucciones de preparación
 * - Soportar modo oscuro con colores semánticos
 *
 * @param route - Parámetros de ruta (recetaId)
 * @param navigation - Props de navegación para RecipeDetailScreen
 */
export default function DetalleReceta({
  route,
  navigation,
}: RecipeDetailScreenProps) {
  const { recetaId } = route.params;
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme ?? "light");

  const styles = createStyles(colors);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<RecetaDetalle | null>(null);

  const fetchDetalle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerDetalleReceta(recetaId);
      setDetalle(data);
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : "Error al cargar la receta";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [recetaId]);

  function wrapInHtml(html: string): string {
    if (html.trim().startsWith("<")) return html;
    return `<p>${html}</p>`;
  }

  useEffect(() => {
    fetchDetalle();
  }, [fetchDetalle]);

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
        <Text style={styles.headerTitle}>Detalle de receta</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00CA55" />
          <Text style={styles.loadingText}>Cargando receta...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Feather name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={fetchDetalle}
            accessibilityLabel="Reintentar cargar receta"
            accessibilityRole="button"
          >
            <Feather name="refresh-cw" size={18} color="white" />
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : detalle ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Recipe Image */}
          {detalle.imagenUrl ? (
            <Image
              source={{ uri: detalle.imagenUrl }}
              style={styles.recipeImage}
              resizeMode="cover"
              accessibilityLabel={`Imagen de ${detalle.titulo}`}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Feather name="image" size={48} color="#9CA3AF" />
            </View>
          )}

          {/* Title */}
          <Text style={styles.recipeTitle}>{detalle.titulo}</Text>

          {/* Info Row: Time + Servings */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Feather name="clock" size={18} color="#00CA55" />
              <Text style={styles.infoText}>
                {detalle.tiempoMinutos} min
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Feather name="users" size={18} color="#00CA55" />
              <Text style={styles.infoText}>
                {detalle.porciones} porciones
              </Text>
            </View>
          </View>

          {/* Ingredients Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredientes</Text>
            <View style={styles.ingredientsContainer}>
              {(detalle.ingredientes ?? []).map((ing, index) => (
                <View key={`${ing.id}-${index}`} style={styles.ingredientRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.ingredientName}>{ing.nombre}</Text>
                  <Text style={styles.ingredientAmount}>
                    {ing.cantidad} {ing.unidad}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Instructions Section */}
          {detalle.instrucciones ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Instrucciones</Text>
              <View style={styles.instructionsContainer}>
                <RenderHtml
                  contentWidth={width}
                  source={{ html: wrapInHtml(detalle.instrucciones) }}
                  baseStyle={{
                    color: colors.textPrimary,
                    fontSize: 15,
                    lineHeight: 24,
                  }}
                  tagsStyles={{
                    ol: { paddingLeft: 20, marginBottom: 8 },
                    ul: { paddingLeft: 20, marginBottom: 8 },
                    li: { marginBottom: 4, color: colors.textPrimary },
                    p: { marginBottom: 8 },
                  }}
                />
              </View>
            </View>
          ) : null}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

type ColorScheme = "light" | "dark";

interface Colors {
  background: string;
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  placeholderBg: string;
}

function getColors(scheme: ColorScheme): Colors {
  if (scheme === "dark") {
    return {
      background: "#111827",
      surface: "#1F2937",
      border: "#374151",
      textPrimary: "#F3F4F6",
      textSecondary: "#D1D5DB",
      textTertiary: "#9CA3AF",
      placeholderBg: "#374151",
    };
  }
  return {
    background: "#F9FAFB",
    surface: "#FFFFFF",
    border: "#E5E7EB",
    textPrimary: "#101828",
    textSecondary: "#6A7282",
    textTertiary: "#6B7280",
    placeholderBg: "#E5E7EB",
  };
}

function createStyles(c: Colors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingVertical: 16,
      backgroundColor: c.surface,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    backButton: {
      minWidth: 44,
      minHeight: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: c.textPrimary,
    },
    centerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 48,
      paddingHorizontal: 24,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 15,
      color: c.textTertiary,
    },
    errorText: {
      fontSize: 15,
      color: "#EF4444",
      marginTop: 12,
      marginBottom: 20,
      textAlign: "center",
    },
    retryButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#00CA55",
      borderRadius: 12,
      paddingHorizontal: 20,
      paddingVertical: 12,
      gap: 8,
    },
    retryText: {
      color: "white",
      fontWeight: "600",
      fontSize: 14,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 40,
    },
    recipeImage: {
      width: "100%",
      height: 220,
    },
    imagePlaceholder: {
      width: "100%",
      height: 220,
      backgroundColor: c.placeholderBg,
      justifyContent: "center",
      alignItems: "center",
    },
    recipeTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: c.textPrimary,
      paddingHorizontal: 24,
      marginTop: 20,
      marginBottom: 12,
    },
    infoRow: {
      flexDirection: "row",
      paddingHorizontal: 24,
      marginBottom: 24,
      gap: 24,
    },
    infoItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    infoText: {
      fontSize: 14,
      color: c.textSecondary,
      fontWeight: "500",
    },
    section: {
      paddingHorizontal: 24,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: c.textPrimary,
      marginBottom: 12,
    },
    ingredientsContainer: {
      backgroundColor: c.surface,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: c.border,
      padding: 16,
    },
    ingredientRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    bullet: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#00CA55",
      marginRight: 12,
    },
    ingredientName: {
      flex: 1,
      fontSize: 15,
      color: c.textPrimary,
    },
    ingredientAmount: {
      fontSize: 14,
      color: c.textSecondary,
      fontWeight: "500",
    },
    instructionsContainer: {
      backgroundColor: c.surface,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: c.border,
      padding: 16,
    },
  });
}
