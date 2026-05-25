import { apiClient } from '../config/apiClient';
import type {
  InventarioDetalleResponse,
  InventarioDetalleUpdateRequest,
  InventarioUsuarioResponse,
} from '../models';

/**
 * Obtener todos los productos del inventario para un usuario.
 * Servicio puro: realiza la llamada HTTP y retorna la respuesta tipada.
 * @param usuarioId - ID del usuario
 */
export async function obtenerTodosLosProductosUsuario(usuarioId: number): Promise<InventarioUsuarioResponse> {
  return apiClient.get<InventarioUsuarioResponse>(`/api/inventario/usuario/${usuarioId}/todos`);
}

/**
 * Obtener detalle de un item de inventario por id.
 * @param inventarioId - ID del inventario
 */
export async function obtenerDetalleInventario(inventarioId: number): Promise<InventarioDetalleResponse> {
  return apiClient.get<InventarioDetalleResponse>(`/api/inventario/${inventarioId}`);
}

/**
 * Marcar un item de inventario como consumido.
 * @param inventarioId - ID del inventario
 */
export async function consumirInventario(inventarioId: number): Promise<void> {
  await apiClient.post(`/api/inventario/${inventarioId}/consumir`);
}

/**
 * Eliminar un item del inventario.
 * @param inventarioId - ID del inventario
 */
export async function eliminarInventario(inventarioId: number): Promise<void> {
  await apiClient.delete(`/api/inventario/${inventarioId}`);
}

/**
 * Actualiza datos de un item del inventario.
 * @param inventarioId - ID del inventario
 * @param payload - campos a actualizar
 */
export async function actualizarInventario(
  inventarioId: number,
  payload: InventarioDetalleUpdateRequest
): Promise<InventarioDetalleResponse> {
  return apiClient.put<InventarioDetalleResponse>(`/api/inventario/${inventarioId}`, payload);
}

export default {
  obtenerTodosLosProductosUsuario,
  obtenerDetalleInventario,
  consumirInventario,
  eliminarInventario,
  actualizarInventario,
};
