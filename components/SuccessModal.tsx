import React from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type SuccessModalProps = {
	visible: boolean;
	iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
	title: string;
	description: string;
	buttonText?: string;
	onButtonPress?: () => void;
	onClose: () => void;
	iconColor?: string;
	iconBackgroundColor?: string;
	primaryButtonColor?: string;
	primaryButtonTextColor?: string;
	variant?: 'single' | 'confirm';
	secondaryButtonText?: string;
	onSecondaryPress?: () => void;
	showCloseButton?: boolean;
	loading?: boolean;
	disableActions?: boolean;
};

/**
 * SuccessModal - Modal reutilizable para mostrar mensajes de éxito o confirmación.
 *
 * Props principales:
 * - visible: controla visibilidad del modal
 * - iconName: nombre del icono de MaterialCommunityIcons a mostrar
 * - title: título principal
 * - description: texto adicional
 * - buttonText: texto del botón primario
 * - onButtonPress: callback del botón primario
 * - onClose: callback al cerrar el modal
 *
 * Comportamiento:
 * - Si variant === 'single', al presionar el botón primario se ejecuta onButtonPress (si existe)
 *   y luego onClose automáticamente.
 * - Si variant === 'confirm', se muestra también un botón secundario que ejecuta onSecondaryPress.
 * - El modal puede mostrar un estado de carga (loading) que deshabilita acciones.
 *
 * Ejemplo:
 * <SuccessModal visible iconName="check" title="Listo" description="Acción completada" onClose={() => {}} />
 */
export default function SuccessModal({
	visible,
	iconName,
	title,
	description,
	buttonText = 'Continuar',
	onButtonPress,
	onClose,
	iconColor = '#00C950',
	iconBackgroundColor = '#DCFCE7',
	primaryButtonColor = '#00C950',
	primaryButtonTextColor = '#FFFFFF',
	variant = 'single',
	secondaryButtonText = 'Cancelar',
	onSecondaryPress,
	showCloseButton = false,
	loading = false,
	disableActions = false,
}: SuccessModalProps) {
	const handleButtonPress = () => {
		if (disableActions || loading) return;
		onButtonPress?.();
		if (variant === 'single') {
			onClose();
		}
	};

	const handleSecondaryPress = () => {
		if (disableActions || loading) return;
		onSecondaryPress?.();
		onClose();
	};

	return (
		<Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
			<Pressable style={styles.overlay} onPress={loading ? () => undefined : onClose}>
				<Pressable style={styles.card} onPress={() => undefined}>
					{showCloseButton && (
						<Pressable style={styles.closeButton} onPress={onClose} disabled={loading || disableActions}>
							<MaterialCommunityIcons name="close" size={28} color="#6A7282" />
						</Pressable>
					)}

					<View style={styles.iconWrap}>
						<View style={[styles.iconCircle, { backgroundColor: iconBackgroundColor }]}>
							<MaterialCommunityIcons name={iconName} size={40} color={iconColor} />
						</View>
					</View>

					<View style={styles.textWrap}>
						<Text style={styles.title}>{title}</Text>
						<Text style={styles.description}>{description}</Text>
					</View>

					<Pressable
						style={[styles.button, { backgroundColor: primaryButtonColor }, (loading || disableActions) && styles.buttonDisabled]}
						onPress={handleButtonPress}
						disabled={loading || disableActions}
					>
						{loading ? (
							<ActivityIndicator size="small" color={primaryButtonTextColor} />
						) : (
							<Text style={[styles.buttonText, { color: primaryButtonTextColor }]}>{buttonText}</Text>
						)}
					</Pressable>

					{variant === 'confirm' && (
						<Pressable
							style={[styles.secondaryButton, (loading || disableActions) && styles.buttonDisabled]}
							onPress={handleSecondaryPress}
							disabled={loading || disableActions}
						>
							<Text style={styles.secondaryButtonText}>{secondaryButtonText}</Text>
						</Pressable>
					)}
				</Pressable>
			</Pressable>
		</Modal>
	);
}


const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(17, 24, 39, 0.55)',
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 24,
	},
	card: {
		width: '100%',
		maxWidth: 345,
		backgroundColor: '#FFFFFF',
		borderRadius: 24,
		paddingHorizontal: 24,
		paddingTop: 24,
		paddingBottom: 24,
		alignItems: 'center',
	},
	closeButton: {
		position: 'absolute',
		top: 16,
		right: 16,
		zIndex: 2,
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
	},
	iconWrap: {
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		paddingTop: 24,
		paddingBottom: 8,
	},
	iconCircle: {
		width: 80,
		height: 80,
		borderRadius: 40,
		alignItems: 'center',
		justifyContent: 'center',
	},
	textWrap: {
		width: '100%',
		alignItems: 'center',
		paddingTop: 8,
		paddingBottom: 20,
	},
	title: {
		fontSize: 24,
		lineHeight: 32,
		fontWeight: '700',
		color: '#101828',
		textAlign: 'center',
	},
	description: {
		marginTop: 8,
		fontSize: 16,
		lineHeight: 24,
		color: '#4A5565',
		textAlign: 'center',
	},
	button: {
		width: '100%',
		height: 56,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#101828',
		shadowOpacity: 0.08,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 3 },
		elevation: 3,
	},
	buttonText: {
		fontSize: 16,
		lineHeight: 24,
		fontWeight: '600',
	},
	secondaryButton: {
		width: '100%',
		height: 56,
		borderRadius: 16,
		backgroundColor: '#F3F4F6',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 12,
	},
	secondaryButtonText: {
		fontSize: 16,
		lineHeight: 24,
		fontWeight: '600',
		color: '#364153',
	},
	buttonDisabled: {
		opacity: 0.7,
	},
});
