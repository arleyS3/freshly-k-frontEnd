import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { apiClient } from '../config/apiClient';
import type { PreferenciasNotificaciones } from '../models/Notificaciones';

/**
 * Obtiene el Expo push token del dispositivo.
 * Solicita permiso si es necesario.
 * @returns El token push o null si no se pudo obtener
 */
export async function obtenerToken(): Promise<string | null> {
	if (!Device.isDevice) {
		console.warn('[Notif] Los simuladores no soportan push notifications');
		return null;
	}

	const { status: existingStatus } = await Notifications.getPermissionsAsync();
	let finalStatus = existingStatus;

	if (existingStatus !== 'granted') {
		const { status } = await Notifications.requestPermissionsAsync();
		finalStatus = status;
	}

	if (finalStatus !== 'granted') {
		console.warn('[Notif] Permiso de notificaciones no otorgado');
		return null;
	}

	const projectId = Constants.expoConfig?.extra?.eas?.projectId;
	if (!projectId) {
		console.warn('[Notif] No se encontró projectId en expoConfig');
		return null;
	}

	const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
	return tokenData.data;
}

/**
 * Registra el push token en el backend.
 * @param token - Expo push token a registrar
 */
export async function registrarTokenEnBackend(token: string): Promise<void> {
	try {
		await apiClient.post('/api/notificaciones/push-token', { token });
	} catch (error) {
		console.warn('[Notif] Error al registrar push token:', error);
	}
}

/**
 * Carga las preferencias de notificaciones desde el backend.
 * @returns Preferencias de notificaciones con valores por defecto si falla
 */
export async function cargarPreferencias(): Promise<PreferenciasNotificaciones> {
	try {
		return await apiClient.get<PreferenciasNotificaciones>('/api/notificaciones/preferencias');
	} catch (error) {
		console.warn('[Notif] Error al cargar preferencias:', error);
		return { alertasVencimiento: true, sugerenciasDiarias: true, modoAhorro: false };
	}
}

/**
 * Actualiza las preferencias de notificaciones en el backend.
 * @param prefs - Preferencias a actualizar (actualización parcial)
 */
export async function actualizarPreferencias(prefs: Partial<PreferenciasNotificaciones>): Promise<void> {
	try {
		await apiClient.put('/api/notificaciones/preferencias', prefs);
	} catch (error) {
		console.warn('[Notif] Error al actualizar preferencias:', error);
	}
}

export default { obtenerToken, registrarTokenEnBackend, cargarPreferencias, actualizarPreferencias };
