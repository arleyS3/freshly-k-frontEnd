import { useCallback, useState } from "react";
import {
	Pressable,
	StyleSheet,
	Text,
	View,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
	RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import type { Producto } from "../models/Producto";
import ProductoCard from "../components/ProductoCard";
import { useAutenticacion } from "../hooks/useAutenticacion";
import type { HomeScreenProps } from "../navigation/types";
import { apiClient } from "../config/apiClient";
import type { InventarioUsuarioResponse, RecetaSugerida } from "../models";
import { sugerirRecetas } from "../services/recipeService";

const formatDiasRestantes = (diasRestantes: number): string => {
	if (diasRestantes < 0) {
		const diasVencido = Math.abs(diasRestantes);
		return diasVencido === 1
			? "Vencio hace 1 dia"
			: `Vencio hace ${diasVencido} dias`;
	}

	if (diasRestantes === 0) {
		return "Vence hoy";
	}

	return diasRestantes === 1
		? "Vence en 1 dia"
		: `Vence en ${diasRestantes} dias`;
};

/**
 * HomeScreen - Pantalla principal del inventario del usuario.
 *
 * Muestra un resumen del inventario, alertas de productos próximos a vencer,
 * acceso rápido para agregar alimentos y sugerencias de recetas basadas
 * en los ingredientes disponibles.
 *
 * Responsabilidades:
 * - Cargar y mostrar resumen del inventario del usuario
 * - Mostrar alertas de productos próximos a vencer
 * - Sugerir recetas según los ingredientes disponibles
 * - Navegar a AllProducts, Add, RecipeDetail y Settings
 * - Soportar pull-to-refresh para recargar datos
 *
 * @param navigation - Props de navegación para HomeScreen
 */
export default function PantallaInicio({ navigation }: HomeScreenProps) {
	const [product, setProduct] = useState<Producto[]>([]);
	const [recetas, setRecetas] = useState<RecetaSugerida[]>([]);
	const [recetasEstado, setRecetasEstado] = useState<'idle' | 'loading' | 'success' | 'empty' | 'no-inventory' | 'error'>('idle');
	const [inventarioEmpty, setInventarioEmpty] = useState(false);
	const [porVencer, setPorVencer] = useState(0);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { tokenSesion, usuario } = useAutenticacion();

	// Función para determinar el nivel de urgencia y color
	const getUrgencia = (
		diasRestantes: number,
	): {
		level: "urgente" | "advertencia" | "normal";
		color: string;
		bgColor: string;
	} => {
		if (diasRestantes <= 3) {
			return { level: "urgente", color: "#dc2626", bgColor: "#fef2f2" };
		} else if (diasRestantes <= 7) {
			return { level: "advertencia", color: "#d97706", bgColor: "#fffbeb" };
		}
		return { level: "normal", color: "#059669", bgColor: "#f0fdf4" };
	};

	const loadInventario = useCallback(
		async (isRefresh = false) => {
			if (isRefresh) {
				setRefreshing(true);
			} else {
				setLoading(true);
			}
			setError(null);

			try {
				if (!tokenSesion || !usuario?.usuario_id) {
					setProduct([]);
					setPorVencer(0);
					setInventarioEmpty(true);
					setLoading(false);
					setRefreshing(false);
					return [];
				}

				const json = await apiClient.get<InventarioUsuarioResponse>(
					`/api/inventario/usuario/${usuario.usuario_id}`,
				);

				if (!json || !Array.isArray(json.productos)) {
					setProduct([]);
					setPorVencer(0);
					setInventarioEmpty(true);
					setLoading(false);
					setRefreshing(false);
					return [];
				}

				// Ordenar productos por días restantes (los más próximos a vencer primero)
				const productosOrdenados = [...json.productos].sort((a, b) => {
					const diasA = Number(a.diasRestantes) ?? 999;
					const diasB = Number(b.diasRestantes) ?? 999;
					return diasA - diasB;
				});

				// Tomar los primeros 5 productos más próximos a vencer
				const mapped: Producto[] = productosOrdenados.slice(0, 5).map((inv) => {
					const nombre =
						inv.nombrePersonalizado || inv.nombreProducto || "Producto";
					const descripcion = formatDiasRestantes(Number(inv.diasRestantes));
					const dias = Number(inv.diasRestantes);
					const urgencia = getUrgencia(dias);

					return {
						nombre,
						descripcion,
						urgent: urgencia.level === "urgente",
						iconColor: urgencia.color,
						bgIcon: urgencia.bgColor,
					};
				});

				setProduct(mapped);
				setPorVencer(Number(json.porVencer) || 0);
				setInventarioEmpty(mapped.length === 0);

				return json.productos;
			} catch (e: unknown) {
				setError("No se pudo cargar el inventario. Intenta de nuevo.");
				setProduct([]);
				setPorVencer(0);
				setInventarioEmpty(true);
				return [];
			} finally {
				setLoading(false);
				setRefreshing(false);
			}
		},
		[tokenSesion, usuario?.usuario_id],
	);

	const onRefresh = useCallback(async () => {
		await loadInventario(true);
	}, [loadInventario]);

	useFocusEffect(
		useCallback(() => {
			const loadAll = async () => {
				const productos = await loadInventario();

			const ingredientNames = [
				...new Set(
					productos
						.map((p) => p.nombrePersonalizado || p.nombreProducto)
						.filter((n): n is string => !!n)
						.map((n) => n.trim().toLowerCase()),
				),
			].slice(0, 20);

				if (ingredientNames.length === 0) {
					setRecetas([]);
					setRecetasEstado("no-inventory");
					return;
				}

				setRecetasEstado("loading");
				try {
					console.log(
						">> DEBUG: Ingredientes enviados a la API:",
						JSON.stringify(ingredientNames, null, 2),
					);
					const recetasData = await sugerirRecetas(ingredientNames, 5);
					setRecetas(recetasData);
					setRecetasEstado(
						recetasData.length > 0 ? "success" : "empty",
					);
			} catch (e: unknown) {
				console.warn("Error al cargar recetas sugeridas:", e);
					setRecetas([]);
					setRecetasEstado("error");
				}
			};

			loadAll();
		}, [loadInventario]),
	);

	// Loading inicial
	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#00CA55" />
				<Text style={styles.loadingText}>Cargando inventario...</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						colors={["#00CA55"]}
						tintColor="#00CA55"
					/>
				}
			>
				<View style={styles.headerTop}>
					<View>
						<Text style={styles.title}>Mi Cocina</Text>
					</View>
					<TouchableOpacity
						style={styles.avatar}
						onPress={() => navigation.navigate("Settings")}
						accessibilityLabel="Ir a configuración"
						accessibilityRole="button"
					>
						<Text style={styles.avatarText}>
						{(usuario?.nombre || usuario?.email || "A").charAt(0).toUpperCase()}
					</Text>
					</TouchableOpacity>
				</View>

				{/* Error state */}
				{error && (
					<View style={styles.errorContainer}>
						<Feather name="alert-circle" size={24} color="#dc2626" />
						<View style={styles.errorTextContainer}>
							<Text style={styles.errorTitle}>Error de conexión</Text>
							<Text style={styles.errorSubtitle}>{error}</Text>
						</View>
						<TouchableOpacity
							onPress={() => loadInventario()}
							style={styles.retryButton}
						>
							<Text style={styles.retryText}>Reintentar</Text>
						</TouchableOpacity>
					</View>
				)}

				{/* Alerta de productos próximos a vencer */}
				{porVencer > 0 && (
					<View style={styles.alertContainer}>
						<Feather name="alert-triangle" size={24} color="#c10007" />
						<View style={styles.alertTextContainer}>
							<Text style={styles.alertTitle}>¡Atención!</Text>
							<Text style={styles.alertSubtitle}>
								{porVencer} alimento{porVencer !== 1 ? "s" : ""} proximo
								{porVencer !== 1 ? "s" : ""} a vencer
							</Text>
						</View>
					</View>
				)}

				{/* Mensaje cuando no hay productos próximos a vencer */}
				{porVencer === 0 && product.length > 0 && (
					<View style={styles.successContainer}>
						<Feather name="check-circle" size={24} color="#059669" />
						<View style={styles.successTextContainer}>
							<Text style={styles.successTitle}>¡Todo en orden!</Text>
							<Text style={styles.successSubtitle}>
								No hay productos por vencer
							</Text>
						</View>
					</View>
				)}

				<Pressable
					style={styles.button}
					onPress={() => navigation.navigate("Add")}
					accessibilityLabel="Agregar nuevo alimento"
					accessibilityRole="button"
				>
					<Feather
						name="plus"
						size={20}
						color="white"
						style={{ marginRight: 8 }}
					/>
					<Text style={styles.buttonText}>Agregar alimento</Text>
				</Pressable>

				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>Tu inventario</Text>
					<Pressable
						onPress={() => navigation.navigate("AllProducts")}
						accessibilityLabel="Ver todos los productos"
					>
						<Text style={styles.sectionLink}>Ver todo</Text>
					</Pressable>
				</View>

				<View style={styles.containerProduct}>
					{inventarioEmpty ? (
						<View style={styles.emptyContainer}>
							<Feather name="package" size={48} color="#9CA3AF" />
							<Text style={styles.emptyTitle}>Sin productos aún</Text>
							<Text style={styles.emptySubtitle}>
								Agrega tu primer alimento para comenzar a controlar tu
								inventario
							</Text>
							<TouchableOpacity
								style={styles.emptyButton}
								onPress={() => navigation.navigate("Add")}
								accessibilityLabel="Agregar primer producto"
							>
								<Feather name="plus" size={18} color="white" />
								<Text style={styles.emptyButtonText}>Agregar producto</Text>
							</TouchableOpacity>
						</View>
					) : (
						product.map((prod, index) => (
							<ProductoCard key={index} producto={prod} />
						))
					)}
				</View>

				<View style={[styles.sectionHeader, { marginTop: 12 }]}>
					<View style={{ flexDirection: "row", alignItems: "center" }}>
						<Feather
							name="star"
							size={20}
							color="#101828"
							style={{ marginRight: 8 }}
						/>
						<Text style={styles.sectionTitle}>Recetas para ti</Text>
					</View>
				</View>

				<View style={styles.containerRecetas}>
					{recetasEstado === "loading" && (
						<View style={styles.recetasLoadingContainer}>
							<ActivityIndicator size="small" color="#00CA55" />
							<Text style={styles.recetasLoadingText}>
								Buscando recetas...
							</Text>
						</View>
					)}

					{recetasEstado === "no-inventory" && (
						<View style={styles.emptyRecetasContainer}>
							<Feather name="package" size={36} color="#9CA3AF" />
							<Text style={styles.emptyRecetasText}>
								Agrega productos a tu inventario para recibir sugerencias de
								recetas
							</Text>
						</View>
					)}

					{recetasEstado === "empty" && (
						<View style={styles.emptyRecetasContainer}>
							<Feather name="search" size={36} color="#9CA3AF" />
							<Text style={styles.emptyRecetasText}>
								No se encontraron recetas con tus ingredientes
							</Text>
						</View>
					)}

					{recetasEstado === "error" && null}

					{recetasEstado === "success" &&
						recetas.map((receta) => (
							<Pressable
								key={receta.id}
								style={styles.recetaCard}
								onPress={() =>
									navigation.navigate("RecipeDetail", {
										recetaId: receta.id,
									})
								}
								accessibilityLabel={`Ver receta ${receta.titulo}`}
								accessibilityRole="button"
							>
								<View style={styles.recetaTextContainer}>
									<Text style={styles.recetaTitle}>{receta.titulo}</Text>
									<Text style={styles.recetaSubtitle}>
										{receta.usedIngredientCount} ingredientes en tu cocina
										{receta.missedIngredientCount > 0 &&
											` • faltan ${receta.missedIngredientCount}`}
									</Text>
								</View>
								<View style={styles.recetaIconContainer}>
									<Feather name="chevron-right" size={20} color="#00CA55" />
								</View>
							</Pressable>
						))}
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F9FAFB",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#F9FAFB",
	},
	loadingText: {
		marginTop: 12,
		fontSize: 16,
		color: "#6B7280",
	},
	scrollContent: {
		flexGrow: 1,
		paddingHorizontal: 24,
		paddingTop: 30,
		paddingBottom: 40,
	},
	headerTop: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 24,
		paddingBottom: 16,
		borderBottomWidth: 1.5,
		borderBottomColor: "#e5e7eb",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#101828",
	},
	subtitle: {
		fontSize: 14,
		color: "#6a7282",
		marginTop: 4,
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "#00CA55",
		alignItems: "center",
		justifyContent: "center",
	},
	avatarText: {
		color: "white",
		fontSize: 16,
		fontWeight: "bold",
	},
	errorContainer: {
		flexDirection: "row",
		backgroundColor: "#fef2f2",
		borderWidth: 1.5,
		borderColor: "#fecaca",
		borderRadius: 16,
		padding: 16,
		alignItems: "center",
		marginBottom: 24,
	},
	errorTextContainer: {
		flex: 1,
		marginLeft: 12,
	},
	errorTitle: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#991b1b",
	},
	errorSubtitle: {
		fontSize: 14,
		color: "#dc2626",
		marginTop: 2,
	},
	retryButton: {
		backgroundColor: "#dc2626",
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
	},
	retryText: {
		color: "white",
		fontWeight: "600",
		fontSize: 14,
	},
	alertContainer: {
		flexDirection: "row",
		backgroundColor: "#fef2f2",
		borderWidth: 1.5,
		borderColor: "#ffc9c9",
		borderRadius: 16,
		padding: 16,
		alignItems: "center",
		marginBottom: 24,
	},
	alertTextContainer: {
		marginLeft: 12,
	},
	alertTitle: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#82181a",
	},
	alertSubtitle: {
		fontSize: 14,
		color: "#c10007",
		marginTop: 2,
	},
	button: {
		flexDirection: "row",
		backgroundColor: "#00CA55",
		borderRadius: 16,
		height: 56,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 24,
		shadowColor: "#00CA55",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 6,
		elevation: 3,
	},
	buttonText: {
		color: "white",
		fontWeight: "bold",
		fontSize: 16,
	},
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#101828",
	},
	sectionLink: {
		fontSize: 14,
		color: "#00CA55",
		fontWeight: "600",
	},
	containerProduct: {
		width: "100%",
		marginBottom: 12,
	},
	emptyContainer: {
		alignItems: "center",
		paddingVertical: 32,
		paddingHorizontal: 24,
		backgroundColor: "white",
		borderRadius: 16,
		borderWidth: 1.5,
		borderColor: "#E5E7EB",
	},
	emptyTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#374151",
		marginTop: 16,
	},
	emptySubtitle: {
		fontSize: 14,
		color: "#6B7280",
		textAlign: "center",
		marginTop: 8,
		lineHeight: 20,
	},
	emptyButton: {
		flexDirection: "row",
		backgroundColor: "#00CA55",
		borderRadius: 12,
		paddingHorizontal: 20,
		paddingVertical: 12,
		alignItems: "center",
		marginTop: 20,
	},
	emptyButtonText: {
		color: "white",
		fontWeight: "600",
		fontSize: 14,
		marginLeft: 8,
	},
	containerRecetas: {
		width: "100%",
	},
	successContainer: {
		flexDirection: "row",
		backgroundColor: "#f0fdf4",
		borderWidth: 1.5,
		borderColor: "#bbf7d0",
		borderRadius: 16,
		padding: 16,
		alignItems: "center",
		marginBottom: 24,
	},
	successTextContainer: {
		marginLeft: 12,
	},
	successTitle: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#166534",
	},
	successSubtitle: {
		fontSize: 14,
		color: "#059669",
		marginTop: 2,
	},
	recetaCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "white",
		borderRadius: 16,
		padding: 16,
		marginBottom: 8,
		borderWidth: 1.5,
		borderColor: "#e5e7eb",
	},
	recetaTextContainer: {
		flex: 1,
	},
	recetaTitle: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#101828",
		marginBottom: 4,
	},
	recetaSubtitle: {
		fontSize: 14,
		color: "#6a7282",
	},
	recetaIconContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "#dcfce7",
		justifyContent: "center",
		alignItems: "center",
	},
	recetasLoadingContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 24,
		gap: 8,
	},
	recetasLoadingText: {
		fontSize: 14,
		color: "#6B7280",
	},
	emptyRecetasContainer: {
		alignItems: "center",
		paddingVertical: 32,
		paddingHorizontal: 24,
		backgroundColor: "white",
		borderRadius: 16,
		borderWidth: 1.5,
		borderColor: "#E5E7EB",
	},
	emptyRecetasText: {
		fontSize: 14,
		color: "#6B7280",
		textAlign: "center",
		marginTop: 12,
		lineHeight: 20,
	},
});
