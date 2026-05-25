/**
 * Tipos compartidos de la aplicación
 */

export interface Usuario {
	usuario_id: number;
	nombre: string;
	email: string;
}

export interface LoginResponse {
	token: string;
	usuario_id: number;
	nombre: string;
	email: string;
}

export interface RegisterRequest {
	email: string;
	password: string;
	name: string;
}

export interface ApiResponse<T = any> {
	ok: boolean;
	message?: string;
	data?: T;
}

export interface ApiError {
	status?: number;
	message: string;
	data?: any;
	originalError?: Error;
}

export interface Producto {
	nombre: string;
	descripcion: string;
}

export interface Inventario {
	id: number;
	nombre_personalizado?: string;
	fecha_vencimiento?: string;
	estado?: string;
	producto?: {
		nombre: string;
	};
}
