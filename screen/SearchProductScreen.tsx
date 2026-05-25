import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	StyleSheet,
	Text,
	TextInput,
	Pressable,
	View,
	useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ProductoCard from "../components/ProductoCard";
import { buscarProductos } from "../services/productService";
import { useAutenticacion } from "../hooks/useAutenticacion";
import type { SearchProductScreenProps } from "../navigation/types";
import type { ProductoBusqueda } from "../models";

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
const DEBOUNCE_MS = 350;
const MIN_QUERY_LENGTH = 2;

type SearchResult = ProductoBusqueda & { id?: number };

/**
 * SearchProductScreen - Pantalla de búsqueda de productos en la base de datos.
 *
 * Permite buscar alimentos por nombre o categoría con debounce,
 * muestra resultados en una lista virtualizada y navega al detalle
 * del producto seleccionado. Soporta modo oscuro.
 *
 * Responsabilidades:
 * - Buscar productos con debounce de 350ms
 * - Cancelar peticiones anteriores al escribir nuevo término
 * - Mostrar resultados en FlatList virtualizada
 * - Gestionar estados de carga, error y vacío
 * - Navegar a ProductDetailScreen al seleccionar un producto
 * - Soportar modo oscuro con tokens de color semánticos
 *
 * @param navigation - Props de navegación para SearchProductScreen
 */
export default function PantallaBusquedaProducto({
	navigation,
}: SearchProductScreenProps) {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";
	const { tokenSesion } = useAutenticacion();
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchResult[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const inputRef = useRef<TextInput>(null);
	const abortRef = useRef<AbortController | null>(null);

	// Semantic color tokens by theme
	const colors = {
		light: {
			background: "#F8FAFC",
			surface: "#FFFFFF",
			surfaceBorder: "#E5E7EB",
			textPrimary: "#22223A",
			textSecondary: "#6B7280",
			textTertiary: "#9CA3AF",
			accent: "#22C55E",
			accentLight: "#DCFCE7",
			error: "#EF4444",
			errorBg: "#FEF2F2",
			placeholder: "#A1A1AA",
			inputBg: "#FFFFFF",
		},
		dark: {
			background: "#0F172A",
			surface: "#1E293B",
			surfaceBorder: "#334155",
			textPrimary: "#F1F5F9",
			textSecondary: "#94A3B8",
			textTertiary: "#64748B",
			accent: "#22C55E",
			accentLight: "#14532D",
			error: "#F87171",
			errorBg: "#7F1D1D",
			placeholder: "#64748B",
			inputBg: "#1E293B",
		},
	};

	const theme = colors[isDark ? "dark" : "light"];

	// Memoized handler para navegar al detalle
	const handleProductPress = useCallback(
		(productoId: number) => {
			if (productoId && Number.isFinite(productoId)) {
				navigation.navigate("ProductDetail", { productoId });
			}
		},
		[navigation],
	);

	// Memoized render item para performance de FlatList
	const renderItem = useCallback(
		({ item }: { item: SearchResult }) => {
			const productoId = item.producto_id ?? item.id;
			const isValidId =
				typeof productoId === "number" && Number.isFinite(productoId);

			return (
				<ProductoCard
					producto={{
						nombre: item.nombre ?? "Producto",
						descripcion: item.descripcion ?? item.keywords ?? "—",
						bgIcon: item.bgIcon,
						icon: item.icon,
						urgent: item.urgent,
					}}
					onPress={isValidId ? () => handleProductPress(productoId) : undefined}
				/>
			);
		},
		[handleProductPress],
	);

	// Memoized keyExtractor para evitar re-renders innecesarios
	const keyExtractor = useCallback(
		(item: SearchResult, index: number) =>
			String(item.producto_id ?? item.id ?? index),
		[],
	);

	// Debounced search effect
	useEffect(() => {
		const q = query.trim();
		setError(null);
		if (q.length < MIN_QUERY_LENGTH) {
			setResults([]);
			setLoading(false);
			return;
		}

		setLoading(true);
		const timeout = setTimeout(async () => {
			abortRef.current?.abort();
			const controller = new AbortController();
			abortRef.current = controller;
			try {
				const normalizedResults = await buscarProductos(
					q,
					tokenSesion ?? undefined,
					controller.signal,
				);
				setResults(normalizedResults as SearchResult[]);
			} catch (e: unknown) {
				// Handle cancellation gracefully
				if (
					e instanceof Error &&
					(e.name === "CanceledError" ||
						e.message.includes("canceled") ||
						(e as { code?: string }).code === "ERR_CANCELED")
				) {
					return;
				}
				const apiMessage = (e as { response?: { data?: { message?: string } } })
					?.response?.data?.message;
				setError(
					typeof apiMessage === "string" ? apiMessage : "No se pudo buscar.",
				);
				setResults([]);
			} finally {
				setLoading(false);
			}
		}, DEBOUNCE_MS);

		return () => {
			clearTimeout(timeout);
			abortRef.current?.abort();
		};
	}, [query, tokenSesion]);

	// Handler para limpiar búsqueda
	const handleClearSearch = useCallback(() => {
		setQuery("");
		setResults([]);
		inputRef.current?.focus();
	}, []);

	// Handler para volver
	const handleGoBack = useCallback(() => {
		navigation.goBack();
	}, [navigation]);

	// Dynamic styles
	const searchBarStyle = [
		styles.searchBarContainer,
		{
			backgroundColor: theme.inputBg,
			borderColor: theme.surfaceBorder,
		},
	];

	const headerTitleStyle = [styles.title, { color: theme.textPrimary }];

	const headerSubtitleStyle = [styles.subtitle, { color: theme.textSecondary }];

	const sectionTitleStyle = [styles.sectionTitle, { color: theme.textPrimary }];

	return (
		<SafeAreaView
			style={[styles.safeArea, { backgroundColor: theme.background }]}
		>
			<View style={styles.container}>
				{/* Header */}
				<View style={styles.headerRow}>
					<Pressable
						style={({ pressed }) => [
							styles.backButton,
							pressed && styles.backButtonPressed,
						]}
						onPress={handleGoBack}
						accessibilityLabel="Volver"
						accessibilityRole="button"
						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
					>
						<Ionicons name="arrow-back" size={28} color={theme.textPrimary} />
					</Pressable>
					<View style={styles.headerTextContainer}>
						<Text style={headerTitleStyle}>Buscar alimento</Text>
						<Text style={headerSubtitleStyle}>
							Encuentra en nuestra base de datos
						</Text>
					</View>
				</View>

				{/* Search Bar con Label visible */}
				<View style={styles.searchSection}>
					<Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
						Buscar
					</Text>
					<View style={searchBarStyle}>
						<Ionicons
							name="search"
							size={22}
							color={theme.placeholder}
							style={styles.searchIcon}
						/>
						<TextInput
							ref={inputRef}
							style={[styles.searchInput, { color: theme.textPrimary }]}
							placeholder="Por nombre o categoría..."
							placeholderTextColor={theme.placeholder}
							value={query}
							onChangeText={setQuery}
							autoCorrect={false}
							autoCapitalize="none"
							keyboardType="default"
							returnKeyType="search"
							accessibilityLabel="Campo de búsqueda de productos"
							accessibilityHint="Escribe el nombre del alimento que buscas"
						/>
						{query.length > 0 && (
							<Pressable
								onPress={handleClearSearch}
								accessibilityLabel="Limpiar búsqueda"
								accessibilityRole="button"
								hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
								style={styles.clearButton}
							>
								<Ionicons
									name="close-circle"
									size={22}
									color={theme.textTertiary}
								/>
							</Pressable>
						)}
					</View>
				</View>

				{/* Results Section */}
				<View style={styles.resultsSection}>
					<View style={styles.sectionTitleRow}>
						<Ionicons
							name="search"
							size={20}
							color={theme.accent}
							style={{ marginRight: SPACING.sm }}
						/>
						<Text style={sectionTitleStyle}>Resultados</Text>
						{loading && (
							<ActivityIndicator
								style={{ marginLeft: SPACING.md }}
								size="small"
								color={theme.accent}
							/>
						)}
					</View>

					{error && (
						<View
							style={[
								styles.errorContainer,
								{ backgroundColor: theme.errorBg },
							]}
						>
							<Ionicons
								name="alert-circle"
								size={20}
								color={theme.error}
								style={{ marginRight: SPACING.sm }}
							/>
							<Text style={[styles.errorText, { color: theme.error }]}>
								{error}
							</Text>
						</View>
					)}

					<FlatList
						style={styles.list}
						data={results}
						keyExtractor={keyExtractor}
						renderItem={renderItem}
						contentContainerStyle={styles.listContent}
						keyboardShouldPersistTaps="handled"
						maxToRenderPerBatch={10}
						windowSize={5}
						initialNumToRender={8}
						removeClippedSubviews={true}
						getItemLayout={(_, index) => ({
							length: 88, // Altura estimada de ProductoCard con margin
							offset: 88 * index,
							index,
						})}
						ListEmptyComponent={
							query.trim().length < MIN_QUERY_LENGTH ? (
								<View style={styles.emptyState}>
									<View
										style={[
											styles.emptyIconContainer,
											{ backgroundColor: theme.surfaceBorder },
										]}
									>
										<Ionicons
											name="search"
											size={32}
											color={theme.textTertiary}
										/>
									</View>
									<Text
										style={[styles.emptyTitle, { color: theme.textSecondary }]}
									>
										Escribe para buscar
									</Text>
									<Text
										style={[
											styles.emptySubtitle,
											{ color: theme.textTertiary },
										]}
									>
										Ingresa al menos {MIN_QUERY_LENGTH} caracteres
									</Text>
								</View>
							) : loading ? (
								<View style={styles.emptyState}>
									<ActivityIndicator size="large" color={theme.accent} />
									<Text
										style={[
											styles.emptySubtitle,
											{ color: theme.textTertiary, marginTop: SPACING.md },
										]}
									>
										Buscando...
									</Text>
								</View>
							) : (
								<View style={styles.emptyState}>
									<View
										style={[
											styles.emptyIconContainer,
											{ backgroundColor: theme.surfaceBorder },
										]}
									>
										<Ionicons
											name="nutrition-outline"
											size={32}
											color={theme.textTertiary}
										/>
									</View>
									<Text
										style={[styles.emptyTitle, { color: theme.textSecondary }]}
									>
										Sin resultados
									</Text>
									<Text
										style={[
											styles.emptySubtitle,
											{ color: theme.textTertiary },
										]}
									>
										No encontramos "{query}" en nuestra base de datos
									</Text>
								</View>
							)
						}
					/>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	container: {
		flex: 1,
		paddingHorizontal: SPACING.xl,
		paddingTop: SPACING.lg,
		paddingBottom: SPACING.xxl,
	},
	headerRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginBottom: SPACING.xl,
	},
	backButton: {
		marginRight: SPACING.md,
		marginTop: 2,
		minWidth: TOUCH_TARGET_MIN,
		minHeight: TOUCH_TARGET_MIN,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: TOUCH_TARGET_MIN / 2,
	},
	backButtonPressed: {
		backgroundColor: "rgba(0, 0, 0, 0.06)",
	},
	headerTextContainer: {
		flex: 1,
	},
	title: {
		fontSize: 28,
		fontWeight: "700",
		letterSpacing: -0.5,
	},
	subtitle: {
		fontSize: 15,
		marginTop: 2,
	},
	searchSection: {
		marginBottom: SPACING.xxl,
	},
	inputLabel: {
		fontSize: 14,
		fontWeight: "600",
		marginBottom: SPACING.sm,
		marginLeft: SPACING.xs,
	},
	searchBarContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderRadius: 16,
		borderWidth: 1.5,
		height: 52,
		paddingHorizontal: SPACING.md,
	},
	searchIcon: {
		marginRight: SPACING.sm,
	},
	searchInput: {
		flex: 1,
		fontSize: 17,
		paddingVertical: 0,
		backgroundColor: "transparent",
	},
	clearButton: {
		padding: SPACING.xs,
		marginLeft: SPACING.xs,
	},
	resultsSection: {
		flex: 1,
		minHeight: 0,
	},
	list: {
		flex: 1,
	},
	listContent: {
		flexGrow: 1,
		paddingBottom: SPACING.md,
	},
	sectionTitleRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: SPACING.lg,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "700",
		letterSpacing: -0.3,
	},
	errorContainer: {
		flexDirection: "row",
		alignItems: "center",
		padding: SPACING.md,
		borderRadius: 12,
		marginBottom: SPACING.lg,
	},
	errorText: {
		fontSize: 15,
		flex: 1,
	},
	emptyState: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 60,
	},
	emptyIconContainer: {
		width: 72,
		height: 72,
		borderRadius: 36,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: SPACING.lg,
	},
	emptyTitle: {
		fontSize: 18,
		fontWeight: "600",
		marginTop: SPACING.lg,
	},
	emptySubtitle: {
		fontSize: 14,
		marginTop: SPACING.xs,
		textAlign: "center",
		paddingHorizontal: SPACING.xxl,
	},
	emptyText: {
		fontSize: 15,
		textAlign: "center",
		marginVertical: SPACING.lg,
	},
});
