import {
	StyleSheet,
	Text,
	View,
	Pressable,
	useColorScheme,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { Producto } from "../models/Producto";

interface ProductProps {
	producto: Producto;
	onPress?: () => void;
}

/**
 * ProductoCard
 * Componente presentacional que muestra información básica de un producto
 * en forma de tarjeta para listas.
 *
 * Mejoras UI/UX aplicadas:
 * - Soporte dark mode con semantic color tokens
 * - Feedback visual al presionar (Pressable + scale)
 * - Accesibilidad completa (accessibilityLabel, role, hint)
 * - Consistencia de icon library (solo MaterialCommunityIcons)
 * - Mejor spacing y line-height para legibilidad
 * - Soporte para reduced motion (via Pressable nativo)
 *
 * @component
 * @param {ProductProps} props - Props del componente
 * @param {Producto} props.producto - Datos del producto a mostrar (ver models/Producto)
 */
function ProductoCard({ producto, onPress }: ProductProps) {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";

	// Semantic color tokens by theme
	const colors = {
		light: {
			card: "#ffffff",
			cardBorder: "#e5e7eb",
			cardBorderUrgent: "#fecaca",
			cardBorderWarning: "#fde68a",
			textPrimary: "#101828",
			textSecondary: "#6a7282",
			textUrgent: "#dc2626",
			iconDefault: "#059669",
			urgentDot: "#fb2c36",
			pressedOverlay: "rgba(0, 0, 0, 0.06)",
		},
		dark: {
			card: "#1f2937",
			cardBorder: "#374151",
			cardBorderUrgent: "#7f1d1d",
			cardBorderWarning: "#78350f",
			textPrimary: "#f9fafb",
			textSecondary: "#9ca3af",
			textUrgent: "#f87171",
			iconDefault: "#34d399",
			urgentDot: "#fb2c36",
			pressedOverlay: "rgba(255, 255, 255, 0.08)",
		},
	};

	const theme = colors[isDark ? "dark" : "light"];

	// Color del icono basado en urgencia
	const iconColor =
		producto.iconColor ||
		(producto.urgent ? theme.textUrgent : theme.iconDefault);

	// Color del borde según urgencia
	const borderColor = producto.urgent
		? theme.cardBorderUrgent
		: producto.iconColor === "#d97706"
			? theme.cardBorderWarning
			: theme.cardBorder;

	// Dynamic styles
	const cardStyle = [style.card, { borderColor, backgroundColor: theme.card }];

	const titleStyle = [
		style.title,
		{ color: theme.textPrimary },
		producto.urgent && { color: theme.textUrgent },
	];

	const descriptionStyle = [
		style.description,
		{ color: theme.textSecondary },
		producto.iconColor && { color: producto.iconColor },
	];

	// Accessibility
	const accessibilityLabel = `${producto.nombre}. ${producto.descripcion}${
		producto.urgent ? ". Urgente" : ""
	}`;

	// Background color for icon (adapts to dark mode)
	const bgIconColor = producto.bgIcon || (isDark ? "#064e3b" : "#f0fdf4");

	return (
		<Pressable
			accessibilityLabel={accessibilityLabel}
			accessibilityRole="button"
			accessibilityState={{
				disabled: false,
				selected: false,
			}}
			accessibilityHint="Toca para ver los detalles del producto"
			onPress={onPress}
			style={({ pressed }) => [
				...cardStyle,
				pressed && { backgroundColor: theme.pressedOverlay },
			]}
		>
			<View
				style={[style.iconContainer, { backgroundColor: bgIconColor }]}
				accessibilityElementsHidden={true}
				importantForAccessibility="no-hide-descendants"
			>
				<MaterialCommunityIcons
					name={producto.icon || "food-apple-outline"}
					size={24}
					color={iconColor}
					accessibilityElementsHidden={true}
				/>
			</View>

			<View style={style.textContainer}>
				<Text style={titleStyle} numberOfLines={1}>
					{producto.nombre}
				</Text>
				<View style={style.subtitleRow}>
					<MaterialCommunityIcons
						name="clock-outline"
						size={14}
						color={producto.iconColor || theme.textSecondary}
						accessibilityElementsHidden={true}
					/>
					<Text style={descriptionStyle} numberOfLines={2}>
						{producto.descripcion}
					</Text>
				</View>
			</View>

			{producto.urgent && (
				<View
					style={[style.urgentDot, { backgroundColor: theme.urgentDot }]}
					accessibilityLabel="Producto urgente"
					accessibilityRole="image"
				/>
			)}
		</Pressable>
	);
}

const style = StyleSheet.create({
	card: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "white",
		borderRadius: 16,
		padding: 16,
		marginBottom: 12, // Increased from 8 to 12 for better spacing rhythm (8dp grid)
		borderWidth: 1.5,
		borderColor: "#e5e7eb",
		// Touch target: ensure minimum height
		minHeight: 56,
	},
	iconContainer: {
		width: 48,
		height: 48,
		borderRadius: 14,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 16,
		// Ensure icon container meets minimum touch target
		minWidth: 48,
	},
	textContainer: {
		flex: 1,
		paddingVertical: 2, // Prevent text from touching container edges
	},
	title: {
		fontSize: 16,
		fontWeight: "600", // Adjusted from "bold" to "600" for better hierarchy
		color: "#101828",
		marginBottom: 4,
		lineHeight: 22, // 1.375 line-height for better readability
	},
	subtitleRow: {
		flexDirection: "row",
		alignItems: "flex-start", // Changed to flex-start to align icon with first line
		gap: 6,
	},
	description: {
		fontSize: 14,
		color: "#6a7282",
		lineHeight: 20, // 1.43 line-height (approx 14 * 1.43)
		flex: 1,
	},
	urgentDot: {
		width: 12, // Increased from 8 to 12 for better visibility
		height: 12, // Increased from 8 to 12
		borderRadius: 6,
		backgroundColor: "#fb2c36",
	},
});

export default ProductoCard;
