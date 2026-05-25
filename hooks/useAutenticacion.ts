import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AuthContextType } from '../models/Auth';

/**
 * Hook para acceder al contexto de autenticación.
 * Envuelve useContext y valida su uso dentro del AuthProvider.
 * @returns {AuthContextType} Contexto con usuario, token y métodos de auth
 */
export const useAutenticacion = (): AuthContextType => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAutenticacion debe usarse dentro de un AuthProvider. Envuelve tu componente con <AuthProvider>.');
    }

    return context;
};

export default useAutenticacion;
