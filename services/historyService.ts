import { apiClient } from '../config/apiClient';
import type { HistorialUsuarioItem } from '../models';

/**
 * Obtiene el historial de acciones de un usuario.
 * @param usuarioId - ID del usuario autenticado
 */
export async function obtenerHistorialUsuario(usuarioId: number): Promise<HistorialUsuarioItem[]> {
  return apiClient.get<HistorialUsuarioItem[]>(`/api/historial/usuario/${usuarioId}`);
}

export default {
  obtenerHistorialUsuario,
};
