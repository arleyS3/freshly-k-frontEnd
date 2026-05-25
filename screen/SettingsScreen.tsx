import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAutenticacion } from '../hooks/useAutenticacion';
import { cargarPreferencias, actualizarPreferencias } from '../services/notificationService';
import type { SettingsScreenProps } from '../navigation/types';

/**
 * SettingsScreen - Pantalla de ajustes y configuración de la aplicación.
 *
 * Permite gestionar el perfil del usuario, preferencias de notificaciones,
 * opciones de sostenibilidad y cerrar sesión. Las preferencias se
 * persisten en el backend al cambiar cada toggle.
 *
 * Responsabilidades:
 * - Mostrar información del perfil del usuario
 * - Gestionar preferencias de notificaciones (alertas, sugerencias)
 * - Configurar opciones de sostenibilidad (modo ahorro)
 * - Persistir cambios de preferencias en el backend
 * - Cerrar sesión del usuario
 *
 * @param navigation - Props de navegación para SettingsScreen
 */
export default function SettingsScreen({ navigation }: SettingsScreenProps) {
    const { cerrarSesion, usuario } = useAutenticacion();
	const [alertasVencimientoActivas, setAlertasVencimientoActivas] = useState(true);
	const [sugerenciasDiariasActivas, setSugerenciasDiariasActivas] = useState(true);
	const [modoAhorroActivo, setModoAhorroActivo] = useState(true);

	// Cargar preferencias desde el backend al montar
	useEffect(() => {
		cargarPreferencias().then((prefs) => {
			setAlertasVencimientoActivas(prefs.alertasVencimiento);
			setSugerenciasDiariasActivas(prefs.sugerenciasDiarias);
			setModoAhorroActivo(prefs.modoAhorro);
		}).catch(console.warn);
	}, []);

	const manejarCerrarSesion = async () => {
		await cerrarSesion();
	};

	const nombreUsuario = usuario?.nombre || 'Usuario';
	const emailUsuario = usuario?.email || 'Sin sesión';
	const inicialUsuario = (usuario?.nombre || usuario?.email || 'A').charAt(0).toUpperCase();

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.headerContainer}>
				<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
					<Ionicons name="arrow-back" size={24} color="#101828" />
				</TouchableOpacity>
				<View style={styles.headerTextContainer}>
					<Text style={styles.title}>Configuración</Text>
					<Text style={styles.subtitle}>Personaliza tu experiencia</Text>
				</View>
			</View>

			<ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Perfil</Text>
					<View style={styles.card}>
						<View style={styles.profileRow}>
							<View style={styles.avatar}>
								<Text style={styles.avatarText}>{inicialUsuario}</Text>
							</View>
							<View style={styles.profileInfo}>
								<Text style={styles.profileName}>{nombreUsuario}</Text>
								<Text style={styles.profileEmail}>{emailUsuario}</Text>
							</View>
							<Ionicons name="chevron-forward" size={20} color="#6A7282" />
						</View>
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Notificaciones</Text>
					<View style={styles.card}>
						<View style={styles.itemRow}>
							<View style={styles.itemLeft}>
								<View style={styles.iconBadge}>
									<Ionicons name="notifications-outline" size={20} color="#00C950" />
								</View>
								<View>
									<Text style={styles.itemTitle}>Alertas de vencimiento</Text>
									<Text style={styles.itemDescription}>Recibe notificaciones</Text>
								</View>
							</View>
							<TouchableOpacity
								onPress={() => {
									const nuevoValor = !alertasVencimientoActivas;
									setAlertasVencimientoActivas(nuevoValor);
									actualizarPreferencias({ alertasVencimiento: nuevoValor });
								}}
								style={[styles.toggleBase, alertasVencimientoActivas ? styles.toggleActivo : styles.toggleInactivo]}
								accessibilityRole="switch"
								accessibilityState={{ checked: alertasVencimientoActivas }}
							>
								<View
									style={[styles.togglePunto, alertasVencimientoActivas ? styles.togglePuntoActivo : styles.togglePuntoInactivo]}
								/>
							</TouchableOpacity>
						</View>
						<View style={styles.rowDivider} />
						<View style={styles.itemRow}>
							<View style={styles.itemLeft}>
								<View style={styles.iconBadge}>
									<Ionicons name="leaf-outline" size={20} color="#00C950" />
								</View>
								<View>
									<Text style={styles.itemTitle}>Sugerencias diarias</Text>
									<Text style={styles.itemDescription}>Recetas recomendadas</Text>
								</View>
							</View>
							<TouchableOpacity
								onPress={() => {
									const nuevoValor = !sugerenciasDiariasActivas;
									setSugerenciasDiariasActivas(nuevoValor);
									actualizarPreferencias({ sugerenciasDiarias: nuevoValor });
								}}
								style={[styles.toggleBase, sugerenciasDiariasActivas ? styles.toggleActivo : styles.toggleInactivo]}
								accessibilityRole="switch"
								accessibilityState={{ checked: sugerenciasDiariasActivas }}
							>
								<View
									style={[styles.togglePunto, sugerenciasDiariasActivas ? styles.togglePuntoActivo : styles.togglePuntoInactivo]}
								/>
							</TouchableOpacity>
						</View>
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Preferencias</Text>
					<View style={styles.card}>
						<TouchableOpacity style={styles.itemRowPresionable} activeOpacity={0.85}>
							<View style={styles.itemLeft}>
								<View style={styles.iconBadge}>
									<Ionicons name="time-outline" size={20} color="#00C950" />
								</View>
								<View>
									<Text style={styles.itemTitle}>Tiempo de preparación</Text>
									<Text style={styles.itemDescription}>Hasta 30 minutos</Text>
								</View>
							</View>
							<Ionicons name="chevron-forward" size={20} color="#6A7282" />
						</TouchableOpacity>
						<View style={styles.rowDivider} />
						<TouchableOpacity style={styles.itemRowPresionable} activeOpacity={0.85}>
							<View style={styles.itemLeft}>
								<View style={styles.iconBadge}>
									<Ionicons name="snow-outline" size={20} color="#00C950" />
								</View>
								<View>
									<Text style={styles.itemTitle}>Almacenamiento por defecto</Text>
									<Text style={styles.itemDescription}>Refrigerado</Text>
								</View>
							</View>
							<Ionicons name="chevron-forward" size={20} color="#6A7282" />
						</TouchableOpacity>
						<View style={styles.rowDivider} />
						<TouchableOpacity style={styles.itemRowPresionable} activeOpacity={0.85}>
							<View style={styles.itemLeft}>
								<View style={styles.iconBadge}>
									<Ionicons name="restaurant-outline" size={20} color="#00C950" />
								</View>
								<View>
									<Text style={styles.itemTitle}>Tipo de comida</Text>
									<Text style={styles.itemDescription}>Todas las categorías</Text>
								</View>
							</View>
							<Ionicons name="chevron-forward" size={20} color="#6A7282" />
						</TouchableOpacity>
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Sostenibilidad</Text>
					<View style={styles.card}>
						<View style={styles.itemRow}>
							<View style={styles.itemLeft}>
								<View style={styles.iconBadge}>
									<Ionicons name="leaf" size={20} color="#00C950" />
								</View>
								<View>
									<Text style={styles.itemTitle}>Modo ahorro</Text>
									<Text style={styles.itemDescription}>Prioriza reducir desperdicio</Text>
								</View>
							</View>
							<TouchableOpacity
								onPress={() => {
									const nuevoValor = !modoAhorroActivo;
									setModoAhorroActivo(nuevoValor);
									actualizarPreferencias({ modoAhorro: nuevoValor });
								}}
								style={[styles.toggleBase, modoAhorroActivo ? styles.toggleActivo : styles.toggleInactivo]}
								accessibilityRole="switch"
								accessibilityState={{ checked: modoAhorroActivo }}
							>
								<View
									style={[styles.togglePunto, modoAhorroActivo ? styles.togglePuntoActivo : styles.togglePuntoInactivo]}
								/>
							</TouchableOpacity>
						</View>
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Mis datos</Text>
					<View style={styles.card}>
						<TouchableOpacity style={styles.itemRowPresionable} activeOpacity={0.85}>
							<View>
								<Text style={styles.itemTitle}>Resumen mensual</Text>
								<Text style={styles.itemDescription}>Ver estadísticas</Text>
							</View>
							<Ionicons name="chevron-forward" size={20} color="#6A7282" />
						</TouchableOpacity>
					</View>
				</View>

				<TouchableOpacity style={styles.logoutButton} onPress={manejarCerrarSesion}>
					<Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
					<Text style={styles.logoutText}>Cerrar sesión</Text>
				</TouchableOpacity>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
	headerContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 24,
		paddingTop: 12,
		paddingBottom: 14,
		borderBottomWidth: 1,
		borderBottomColor: '#E5E7EB',
		backgroundColor: '#FFFFFF',
	},
	backButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
	headerTextContainer: { marginLeft: 14, flex: 1 },
	title: { fontSize: 24, fontWeight: '700', color: '#101828' },
	subtitle: { fontSize: 14, lineHeight: 20, color: '#6A7282', marginTop: 2 },
	container: { flex: 1, backgroundColor: '#F9FAFB' },
	scrollContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 36 },
	section: { marginBottom: 24 },
	sectionTitle: {
		fontSize: 14,
		fontWeight: '700',
		lineHeight: 20,
		letterSpacing: 0.35,
		color: '#6A7282',
		marginBottom: 12,
	},
	card: {
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		borderWidth: 1.7,
		borderColor: '#E5E7EB',
		overflow: 'hidden',
	},
	profileRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 18,
		paddingVertical: 18,
	},
	avatar: {
		width: 64,
		height: 64,
		borderRadius: 32,
		backgroundColor: '#00C950',
		alignItems: 'center',
		justifyContent: 'center',
	},
	avatarText: { color: '#FFFFFF', fontSize: 24, fontWeight: '700' },
	profileInfo: { flex: 1, marginLeft: 16 },
	profileName: { color: '#101828', fontSize: 18, fontWeight: '700', lineHeight: 28 },
	profileEmail: { color: '#6A7282', fontSize: 14, lineHeight: 20 },
	itemRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 16,
		minHeight: 76,
	},
	itemRowPresionable: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 16,
		minHeight: 76,
	},
	itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 14 },
	iconBadge: {
		width: 40,
		height: 40,
		borderRadius: 14,
		backgroundColor: '#DCFCE7',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
	},
	itemTitle: { color: '#101828', fontSize: 16, fontWeight: '700', lineHeight: 24 },
	itemDescription: { color: '#6A7282', fontSize: 14, lineHeight: 20 },
	rowDivider: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 1.7 },
	toggleBase: {
		width: 48,
		height: 28,
		borderRadius: 999,
		justifyContent: 'center',
		paddingHorizontal: 2,
		borderWidth: 1,
	},
	toggleActivo: {
		backgroundColor: '#22C55E',
		borderColor: '#16A34A',
	},
	toggleInactivo: {
		backgroundColor: '#E5E7EB',
		borderColor: '#D1D5DB',
	},
	togglePunto: {
		width: 22,
		height: 22,
		borderRadius: 11,
		backgroundColor: '#FFFFFF',
		shadowColor: '#000000',
		shadowOpacity: 0.12,
		shadowRadius: 2,
		shadowOffset: { width: 0, height: 1 },
		elevation: 2,
	},
	togglePuntoActivo: {
		alignSelf: 'flex-end',
	},
	togglePuntoInactivo: {
		alignSelf: 'flex-start',
	},
	logoutButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		backgroundColor: '#00C950',
		paddingVertical: 14,
		borderRadius: 16,
		marginTop: 4,
	},
	logoutText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
