import React, { useCallback, useMemo, useState } from 'react';
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
	useColorScheme,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import type { ProductEditScreenProps } from '../navigation/types';
import type { InventarioDetalleResponse } from '../models';
import {
	actualizarInventario,
	consumirInventario,
	eliminarInventario,
	obtenerDetalleInventario,
} from '../services/inventoryService';
import { obtenerNombreTipoAlmacenamiento } from '../utils/storageTypeFormatter';
import SuccessModal from '../components/SuccessModal';

type ActionType = 'consumir' | 'eliminar' | 'editar' | null;

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

function formatearFechaLarga(fecha: string): string {
	const parsed = new Date(`${fecha}T00:00:00`);
	if (Number.isNaN(parsed.getTime())) return fecha;

	return new Intl.DateTimeFormat('es-ES', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	}).format(parsed);
}

function getUrgencyCopy(tiempoRestante: number): { title: string; subtitle: string } {
	if (tiempoRestante < 0) {
		const dias = Math.abs(tiempoRestante);
		return {
			title: 'Vencido - Revisar ahora',
			subtitle: dias === 1 ? 'Venció hace 1 día' : `Venció hace ${dias} días`,
		};
	}

	if (tiempoRestante === 0) {
		return {
			title: 'Urgente - Consumir hoy',
			subtitle: 'Vence hoy',
		};
	}

	if (tiempoRestante <= 2) {
		return {
			title: 'Urgente - Consumir hoy',
			subtitle: tiempoRestante === 1 ? 'Vence en 1 día' : `Vence en ${tiempoRestante} días`,
		};
	}

	return {
		title: 'Aún en buen estado',
		subtitle: `Vence en ${tiempoRestante} días`,
	};
}

/**
 * ProductEditScreen - Pantalla para editar o gestionar un item del inventario.
 *
 * Permite ver el detalle completo de un producto en el inventario,
 * editar sus fechas y tipo de almacenamiento, marcarlo como consumido
 * o eliminarlo del inventario. Soporta modo oscuro.
 *
 * Responsabilidades:
 * - Cargar detalle del item de inventario desde la API
 * - Editar fecha de compra, vencimiento y tipo de almacenamiento
 * - Marcar producto como consumido
 * - Eliminar producto del inventario
 * - Mostrar urgencia según días restantes
 * - Soportar modo oscuro con tokens de color semánticos
 *
 * @param route - Parámetros de ruta (inventarioId, productoNombre)
 * @param navigation - Props de navegación para ProductEditScreen
 */
export default function ProductEditScreen({ route, navigation }: ProductEditScreenProps) {
	const { inventarioId, productoNombre } = route.params;
	const colorScheme = useColorScheme();
	const isDark = colorScheme === 'dark';

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [detalle, setDetalle] = useState<InventarioDetalleResponse | null>(null);
	const [actionLoading, setActionLoading] = useState<ActionType>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [editFechaCompra, setEditFechaCompra] = useState('');
	const [editFechaVencimiento, setEditFechaVencimiento] = useState('');
	const [editTipoAlmacenamiento, setEditTipoAlmacenamiento] = useState('');

	const [modalVisible, setModalVisible] = useState(false);
	const [modalTitle, setModalTitle] = useState('');
	const [modalDescription, setModalDescription] = useState('');
	const [modalGoBack, setModalGoBack] = useState(false);
	const [confirmAction, setConfirmAction] = useState<'consumir' | 'eliminar' | null>(null);

	const colors = {
		light: {
			background: '#F9FAFB',
			surface: '#FFFFFF',
			surfaceAlt: '#F3F4F6',
			border: '#E5E7EB',
			textPrimary: '#101828',
			textSecondary: '#6A7282',
			textMuted: '#98A2B3',
			accent: '#00C950',
			accentDark: '#00A63E',
			success: '#16A34A',
			successBg: '#DCFCE7',
			successBorder: '#B9F8CF',
			danger: '#C10007',
			dangerBg: '#FEF2F2',
			dangerBorder: '#FFC9C9',
		},
		dark: {
			background: '#0F172A',
			surface: '#1E293B',
			surfaceAlt: '#111827',
			border: '#334155',
			textPrimary: '#F9FAFB',
			textSecondary: '#94A3B8',
			textMuted: '#64748B',
			accent: '#22C55E',
			accentDark: '#16A34A',
			success: '#4ADE80',
			successBg: '#14532D',
			successBorder: '#166534',
			danger: '#F87171',
			dangerBg: '#7F1D1D',
			dangerBorder: '#991B1B',
		},
	};

	const theme = colors[isDark ? 'dark' : 'light'];

	// Estilo de error con soporte para ambos temas
	const errorStyle = {
		fontSize: 14,
		marginBottom: SPACING.sm,
		padding: SPACING.md,
		backgroundColor: isDark ? theme.dangerBg : theme.dangerBg,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: isDark ? theme.dangerBorder : theme.dangerBorder,
		color: isDark ? theme.danger : theme.danger,
	};

	const cargarDetalle = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await obtenerDetalleInventario(inventarioId);
			setDetalle(response);
			setEditFechaCompra(response.fecha_compra);
			setEditFechaVencimiento(response.fecha_vencimiento);
			setEditTipoAlmacenamiento(response.tipo_almacenamiento);
			setIsEditing(false);
		} catch (e: any) {
			setDetalle(null);
			setError(e?.message || 'No se pudo cargar el detalle del inventario.');
		} finally {
			setLoading(false);
		}
	}, [inventarioId]);

	useFocusEffect(
		useCallback(() => {
			cargarDetalle();
		}, [cargarDetalle])
	);

	const diasRestantes = useMemo(() => {
		if (typeof detalle?.tiempo_restante === 'number' && Number.isFinite(detalle.tiempo_restante)) {
			return detalle.tiempo_restante;
		}

		if (!detalle?.fecha_vencimiento) {
			return 0;
		}

		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const due = new Date(`${detalle.fecha_vencimiento}T00:00:00`);

		if (Number.isNaN(due.getTime())) {
			return 0;
		}

		const diffMs = due.getTime() - today.getTime();
		return Math.floor(diffMs / (1000 * 60 * 60 * 24));
	}, [detalle?.fecha_vencimiento, detalle?.tiempo_restante]);

	const urgency = useMemo(() => getUrgencyCopy(diasRestantes), [diasRestantes]);
	const urgencyTone = diasRestantes <= 2 ? 'danger' : 'success';
	const urgencyIcon = urgencyTone === 'danger' ? 'alert-circle-outline' : 'check-circle-outline';

	const onConsumir = () => {
		setConfirmAction('consumir');
	};

	const onEliminar = () => {
		setConfirmAction('eliminar');
	};

	const confirmarAccion = async () => {
		if (!confirmAction) return;

		setActionLoading(confirmAction);
		try {
			if (confirmAction === 'consumir') {
				await consumirInventario(inventarioId);
				setModalTitle('Producto consumido');
				setModalDescription('El producto fue marcado como consumido correctamente.');
			} else {
				await eliminarInventario(inventarioId);
				setModalTitle('Producto eliminado');
				setModalDescription('El producto fue eliminado del inventario.');
			}

			setModalGoBack(true);
			setConfirmAction(null);
			setModalVisible(true);
		} catch (e: any) {
			setConfirmAction(null);
			setError(e?.message || 'No se pudo completar la acción.');
		} finally {
			setActionLoading(null);
		}
	};

	const onEditar = async () => {
		if (!isEditing) {
			setIsEditing(true);
			return;
		}

		if (!editFechaCompra || !editFechaVencimiento || !editTipoAlmacenamiento) {
			setError('Completa fecha de compra, vencimiento y tipo de almacenamiento.');
			return;
		}

		setActionLoading('editar');
		try {
			const response = await actualizarInventario(inventarioId, {
				fecha_compra: editFechaCompra,
				fecha_vencimiento: editFechaVencimiento,
				tipo_almacenamiento: editTipoAlmacenamiento,
			});

			setDetalle(response);
			setIsEditing(false);
			setModalTitle('Producto actualizado');
			setModalDescription('Los datos del inventario se actualizaron correctamente.');
			setModalGoBack(false);
			setModalVisible(true);
		} catch (e: any) {
			setError(e?.message || 'No se pudo actualizar el producto.');
		} finally {
			setActionLoading(null);
		}
	};

	const isActionLoading = Boolean(actionLoading);
	const isDanger = urgencyTone === 'danger';

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
			<View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
				<Pressable
					onPress={() => navigation.goBack()}
					style={({ pressed }) => [
						styles.backButton,
						pressed && { backgroundColor: theme.surfaceAlt },
					]}
					accessibilityLabel="Volver"
					accessibilityRole="button"
					hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				>
					<Feather name="arrow-left" size={24} color={theme.textPrimary} />
				</Pressable>
				<View style={styles.headerTextWrap}>
					<Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
						{productoNombre}
					</Text>
					<Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Detalles del alimento</Text>
				</View>
			</View>

			{loading ? (
				<View style={[styles.centerState, { backgroundColor: theme.background }]}>
					<ActivityIndicator size="large" color={theme.accent} />
				</View>
			) : error ? (
				<View style={[styles.centerState, { backgroundColor: theme.background }]}>
					<Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
					<Pressable
						style={({ pressed }) => [
							styles.retryButton,
							{ backgroundColor: theme.accent },
							pressed && { backgroundColor: theme.accentDark },
						]}
						onPress={cargarDetalle}
						accessibilityLabel="Reintentar"
						accessibilityRole="button"
					>
						<Text style={styles.retryButtonText}>Reintentar</Text>
					</Pressable>
				</View>
			) : detalle ? (
				<ScrollView style={[styles.body, { backgroundColor: theme.background }]} contentContainerStyle={styles.bodyContent}>
					<View
						style={[
							styles.urgentCard,
							{
								backgroundColor: isDanger ? theme.dangerBg : theme.successBg,
								borderColor: isDanger ? theme.dangerBorder : theme.successBorder,
							},
						]}
						accessibilityRole="summary"
						accessibilityLabel={urgency.title}
					>
						<View style={styles.urgentHeadingRow}>
							<MaterialCommunityIcons name={urgencyIcon} size={24} color={isDanger ? theme.danger : theme.success} />
							<Text style={[styles.urgentTitle, { color: isDanger ? theme.danger : theme.success }]}>
								{urgency.title}
							</Text>
						</View>
						<Text style={[styles.urgentSubtitle, { color: isDanger ? theme.danger : theme.success }]}>
							{urgency.subtitle}
						</Text>
					</View>

					<View style={[styles.detailCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
						<View style={styles.detailRow}>
							<View style={[styles.detailIconWrap, { backgroundColor: theme.successBg }]}>
								<Feather name="calendar" size={20} color={theme.success} />
							</View>
							<View style={styles.detailTextWrap}>
								<Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Fecha de compra</Text>
								{isEditing ? (
									<>
										<TextInput
											style={[
												styles.editInput,
												{ borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.surface },
											]}
											value={editFechaCompra}
											onChangeText={setEditFechaCompra}
											placeholder="2024-01-15"
											placeholderTextColor={theme.textMuted}
											autoCapitalize="none"
											accessibilityLabel="Fecha de compra"
											accessibilityHint="Formato año-mes-día"
										/>
										<Text style={[styles.helperText, { color: theme.textMuted }]}>
											Ej: 2024-01-15
										</Text>
									</>
								) : (
									<Text style={[styles.detailValue, { color: theme.textPrimary }]}>
										{formatearFechaLarga(detalle.fecha_compra)}
									</Text>
								)}
							</View>
						</View>

						<View style={[styles.divider, { backgroundColor: theme.surfaceAlt }]} />

						<View style={styles.detailRow}>
							<View style={[styles.detailIconWrap, { backgroundColor: theme.successBg }]}>
								<Feather name="calendar" size={20} color={theme.success} />
							</View>
							<View style={styles.detailTextWrap}>
								<Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Fecha de vencimiento</Text>
								{isEditing ? (
									<>
										<TextInput
											style={[
												styles.editInput,
												{ borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.surface },
											]}
											value={editFechaVencimiento}
											onChangeText={setEditFechaVencimiento}
											placeholder="2024-02-15"
											placeholderTextColor={theme.textMuted}
											autoCapitalize="none"
											accessibilityLabel="Fecha de vencimiento"
											accessibilityHint="Formato año-mes-día"
										/>
										<Text style={[styles.helperText, { color: theme.textMuted }]}>
											Ej: 2024-02-15
										</Text>
									</>
								) : (
									<Text style={[styles.detailValue, { color: theme.textPrimary }]}>
										{formatearFechaLarga(detalle.fecha_vencimiento)}
									</Text>
								)}
							</View>
						</View>

						<View style={[styles.divider, { backgroundColor: theme.surfaceAlt }]} />

						<View style={styles.detailRow}>
							<View style={[styles.detailIconWrap, { backgroundColor: theme.successBg }]}>
								<MaterialCommunityIcons name="fridge-outline" size={20} color={theme.success} />
							</View>
							<View style={styles.detailTextWrap}>
								<Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Tipo de almacenamiento</Text>
								{isEditing ? (
									<>
										<TextInput
											style={[
												styles.editInput,
												{ borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.surface },
											]}
											value={editTipoAlmacenamiento}
											onChangeText={setEditTipoAlmacenamiento}
											placeholder="refrigerado"
											placeholderTextColor={theme.textMuted}
											autoCapitalize="none"
											accessibilityLabel="Tipo de almacenamiento"
										/>
										<Text style={[styles.helperText, { color: theme.textMuted }]}>
											Valores: ambiente, refrigerado, congelado
										</Text>
									</>
								) : (
									<Text style={[styles.detailValue, { color: theme.textPrimary }]}>
										{obtenerNombreTipoAlmacenamiento(detalle.tipo_almacenamiento)}
									</Text>
								)}
							</View>
						</View>
					</View>

					<View style={styles.actionsSection}>
						<Text style={[styles.actionsTitle, { color: theme.textSecondary }]}>ACCIONES</Text>
						{error ? (
							<View style={errorStyle}>
								<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
									<MaterialCommunityIcons name="alert-circle-outline" size={18} color={theme.danger} />
									<Text style={[styles.errorMessageText, { color: theme.danger, marginLeft: 8 }]}>
										Verifica los datos
									</Text>
								</View>
								<Text style={[styles.errorMessageDetail, { color: theme.danger }]}>
									{error}
								</Text>
							</View>
						) : null}

						<Pressable
							style={({ pressed }) => [
								styles.primaryButton,
								{ backgroundColor: theme.accent, shadowColor: theme.accent },
								pressed && { backgroundColor: theme.accentDark },
								isActionLoading && styles.buttonDisabled,
							]}
							onPress={onConsumir}
							disabled={isActionLoading}
							accessibilityLabel="Marcar como consumido"
							accessibilityRole="button"
							accessibilityState={{ disabled: isActionLoading }}
						>
							{actionLoading === 'consumir' ? (
								<ActivityIndicator size="small" color="#FFFFFF" />
							) : (
								<>
									<MaterialCommunityIcons name="check-circle-outline" size={20} color="#FFFFFF" />
									<Text style={styles.primaryButtonText}>Marcar como consumido</Text>
								</>
							)}
						</Pressable>

						<View style={styles.secondaryButtonsRow}>
							<Pressable
								style={({ pressed }) => [
									styles.secondaryButton,
									{ borderColor: theme.border, backgroundColor: theme.surface },
									pressed && { backgroundColor: theme.surfaceAlt },
									isActionLoading && styles.buttonDisabled,
								]}
								onPress={onEditar}
								disabled={isActionLoading}
								accessibilityLabel={isEditing ? 'Guardar cambios' : 'Editar datos'}
								accessibilityRole="button"
								accessibilityState={{ disabled: isActionLoading }}
							>
								{actionLoading === 'editar' ? (
									<ActivityIndicator size="small" color={theme.textPrimary} />
								) : (
									<>
										<Feather name={isEditing ? 'save' : 'edit-2'} size={20} color={theme.textPrimary} />
										<Text style={[styles.secondaryButtonText, { color: theme.textPrimary }]}> 
											{isEditing ? 'Guardar' : 'Editar'}
										</Text>
									</>
								)}
							</Pressable>

							<Pressable
								style={({ pressed }) => [
									styles.secondaryButton,
									styles.deleteButton,
									{ borderColor: theme.dangerBorder, backgroundColor: theme.surface },
									pressed && { backgroundColor: theme.dangerBg },
									isActionLoading && styles.buttonDisabled,
								]}
								onPress={onEliminar}
								disabled={isActionLoading}
								accessibilityLabel="Eliminar producto"
								accessibilityRole="button"
								accessibilityState={{ disabled: isActionLoading }}
							>
								{actionLoading === 'eliminar' ? (
									<ActivityIndicator size="small" color={theme.danger} />
								) : (
									<>
										<Feather name="trash-2" size={20} color={theme.danger} />
										<Text style={[styles.deleteButtonText, { color: theme.danger }]}>Eliminar</Text>
									</>
								)}
							</Pressable>
						</View>
					</View>
				</ScrollView>
			) : null}

			<SuccessModal
				visible={modalVisible}
				iconName="check-circle"
				title={modalTitle}
				description={modalDescription}
				buttonText="Continuar"
				onButtonPress={() => {
					if (modalGoBack) {
						navigation.goBack();
					}
				}}
				onClose={() => setModalVisible(false)}
			/>

			<SuccessModal
				visible={confirmAction !== null}
				iconName={confirmAction === 'eliminar' ? 'trash-can-outline' : 'check-circle-outline'}
				title={confirmAction === 'eliminar' ? '¿Eliminar alimento?' : '¿Marcar como consumido?'}
				description={
					confirmAction === 'eliminar'
						? `${productoNombre} se eliminará permanentemente de tu inventario.`
						: `${productoNombre} se moverá a tu historial de alimentos consumidos.`
				}
				buttonText={confirmAction === 'eliminar' ? 'Sí, eliminar' : 'Sí, marcar consumido'}
				variant="confirm"
				secondaryButtonText="Cancelar"
				onButtonPress={confirmarAccion}
				onSecondaryPress={() => setConfirmAction(null)}
				onClose={() => setConfirmAction(null)}
				showCloseButton
				loading={actionLoading === 'consumir' || actionLoading === 'eliminar'}
				disableActions={actionLoading === 'consumir' || actionLoading === 'eliminar'}
				primaryButtonColor={confirmAction === 'eliminar' ? theme.danger : theme.accent}
				iconColor={confirmAction === 'eliminar' ? theme.danger : theme.accentDark}
				iconBackgroundColor={confirmAction === 'eliminar' ? theme.dangerBg : theme.successBg}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	header: {
		borderBottomWidth: 1.5,
		paddingHorizontal: SPACING.xxl,
		paddingVertical: SPACING.lg,
		flexDirection: 'row',
		alignItems: 'center',
	},
	backButton: {
		width: TOUCH_TARGET_MIN,
		height: TOUCH_TARGET_MIN,
		borderRadius: TOUCH_TARGET_MIN / 2,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: SPACING.md,
	},
	headerTextWrap: {
		flex: 1,
	},
	headerTitle: {
		fontSize: 28,
		fontWeight: '700',
		lineHeight: 32,
	},
	headerSubtitle: {
		marginTop: 2,
		fontSize: 14,
		lineHeight: 20,
	},
	body: {
		flex: 1,
	},
	bodyContent: {
		paddingHorizontal: SPACING.xxl,
		paddingTop: SPACING.xxl,
		paddingBottom: SPACING.xxxl,
	},
	urgentCard: {
		borderWidth: 1.5,
		borderRadius: 16,
		paddingHorizontal: SPACING.lg,
		paddingTop: SPACING.lg,
		paddingBottom: SPACING.md,
		marginBottom: SPACING.xxl,
	},
	urgentHeadingRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	urgentTitle: {
		marginLeft: SPACING.sm,
		fontSize: 18,
		fontWeight: '700',
	},
	urgentSubtitle: {
		marginTop: SPACING.sm,
		fontSize: 14,
	},
	detailCard: {
		borderWidth: 1.5,
		borderRadius: 16,
		overflow: 'hidden',
	},
	detailRow: {
		minHeight: 78,
		paddingHorizontal: SPACING.lg,
		flexDirection: 'row',
		alignItems: 'center',
	},
	detailIconWrap: {
		width: 40,
		height: 40,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: SPACING.lg,
	},
	detailTextWrap: {
		flex: 1,
	},
	detailLabel: {
		fontSize: 14,
		marginBottom: 2,
	},
	detailValue: {
		fontSize: 16,
		lineHeight: 24,
		fontWeight: '700',
	},
	editInput: {
		height: 42,
		borderWidth: 1,
		borderRadius: 10,
		paddingHorizontal: 12,
		fontSize: 14,
	},
	helperText: {
		fontSize: 12,
		marginTop: 4,
	},
	divider: {
		height: 1.5,
	},
	actionsSection: {
		marginTop: SPACING.xxl,
	},
	errorMessageText: {
		fontWeight: '600',
		fontSize: 14,
	},
	errorMessageDetail: {
		fontSize: 13,
		marginLeft: 26,
	},
	actionsTitle: {
		fontSize: 14,
		fontWeight: '700',
		letterSpacing: 0.35,
		marginBottom: SPACING.md,
	},
	primaryButton: {
		height: 56,
		borderRadius: 16,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		shadowOpacity: 0.2,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 6 },
		gap: 8,
	},
	primaryButtonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '700',
	},
	secondaryButtonsRow: {
		marginTop: SPACING.md,
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: SPACING.md,
	},
	secondaryButton: {
		flex: 1,
		height: 56,
		borderRadius: 16,
		borderWidth: 1.5,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},
	secondaryButtonText: {
		fontSize: 16,
		fontWeight: '700',
	},
	deleteButton: {
		borderWidth: 1.5,
	},
	deleteButtonText: {
		fontSize: 16,
		fontWeight: '700',
	},
	buttonDisabled: {
		opacity: 0.65,
	},
	centerState: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: SPACING.xxl,
	},
	errorText: {
		fontSize: 14,
		textAlign: 'center',
		marginBottom: SPACING.md,
	},
	retryButton: {
		height: TOUCH_TARGET_MIN,
		borderRadius: 12,
		paddingHorizontal: SPACING.lg,
		alignItems: 'center',
		justifyContent: 'center',
	},
	retryButtonText: {
		color: '#FFFFFF',
		fontWeight: '700',
	},
});
