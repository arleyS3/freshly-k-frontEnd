import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

type AddNavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * AddScreen - Pantalla con opciones para agregar un alimento al inventario.
 *
 * Ofrece dos formas de agregar: buscar en la base de datos o ingresar
 * los datos manualmente. Cada opción navega a su respectiva pantalla.
 *
 * Responsabilidades:
 * - Presentar opciones de agregado (búsqueda y manual)
 * - Navegar a SearchProductScreen o AgregarManual según la selección
 */
const PantallaAgregar = () => {
	const navigation = useNavigation<AddNavigationProp>();

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={styles.contentContainer}
		>
			<View style={styles.header}>
				<Pressable
					onPress={() => navigation.goBack()}
					style={styles.backButton}
					accessibilityLabel="Volver"
					accessibilityRole="button"
				>
					<MaterialCommunityIcons name="arrow-left" size={24} color="#0B1D2E" />
				</Pressable>
				<View style={styles.headerTextContainer}>
					<Text style={styles.title}>Agregar alimento</Text>
					<Text style={styles.subtitle}>Elige cómo quieres añadirlo</Text>
				</View>
			</View>

			<View style={styles.cardsContainer}>
				{/* Buscar alimento */}
				<Pressable
					style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
					onPress={() => navigation.navigate("SearchProduct")}
					accessibilityLabel="Buscar alimento en la base de datos"
					accessibilityRole="button"
				>
					<View style={[styles.iconContainer, { backgroundColor: "#E6F9F0" }]}>
						<MaterialCommunityIcons name="magnify" size={28} color="#00CA55" />
					</View>
					<View style={styles.cardTextContainer}>
						<Text style={styles.cardTitle}>Buscar alimento</Text>
						<Text style={styles.cardSubtitle}>
							Encuentra en nuestra base de datos
						</Text>
					</View>
					<MaterialCommunityIcons
						name="chevron-right"
						size={24}
						color="#9CA3AF"
					/>
				</Pressable>

				{/* Agregar manual */}
				<Pressable
					style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
					onPress={() => navigation.navigate("AgregarManual")}
					accessibilityLabel="Agregar alimento manualmente"
					accessibilityRole="button"
				>
					<View style={[styles.iconContainer, { backgroundColor: "#E6F9F0" }]}>
						<MaterialCommunityIcons
							name="pencil-outline"
							size={28}
							color="#00CA55"
						/>
					</View>
					<View style={styles.cardTextContainer}>
						<Text style={styles.cardTitle}>Agregar manual</Text>
						<Text style={styles.cardSubtitle}>Ingresa los datos tú mismo</Text>
					</View>
					<MaterialCommunityIcons
						name="chevron-right"
						size={24}
						color="#9CA3AF"
					/>
				</Pressable>
			</View>

			<View style={styles.infoNote}>
				<MaterialCommunityIcons
					name="lightbulb-outline"
					size={20}
					color="#00875A"
				/>
				<Text style={styles.infoText}>
					Te ayudaremos a calcular la fecha de vencimiento
				</Text>
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F7FDF9",
	},
	contentContainer: {
		paddingBottom: 40,
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
		width: 44,
		height: 44,
		justifyContent: "center",
		alignItems: "center",
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
	cardsContainer: {
		paddingHorizontal: 24,
		gap: 16,
	},
	card: {
		backgroundColor: "white",
		borderRadius: 16,
		padding: 20,
		flexDirection: "row",
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
	cardPressed: {
		opacity: 0.9,
		transform: [{ scale: 0.98 }],
		backgroundColor: "#F3F4F6",
	},
	iconContainer: {
		width: 56,
		height: 56,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 16,
	},
	cardTextContainer: {
		flex: 1,
	},
	cardTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#0B1D2E",
		marginBottom: 4,
	},
	cardSubtitle: {
		fontSize: 14,
		color: "#6B7F95",
	},
	infoNote: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#E6F9F0",
		borderRadius: 12,
		padding: 16,
		marginHorizontal: 24,
		marginTop: 24,
	},
	infoText: {
		fontSize: 14,
		color: "#00875A",
		flex: 1,
		marginLeft: 12,
	},
});

export default PantallaAgregar;
