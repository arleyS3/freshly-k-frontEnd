/**
 * Formateador de tipos de almacenamiento para UI
 * Transforma valores del API (snake_case) en etiquetas legibles
 */

export interface EtiquetaTipoAlmacenamiento {
    apiValue: string;
    displayLabel: string;
    icon: string;
    bgColor: string;
    iconColor: string;
    subtitle: string;
}

const STORAGE_TYPE_MAP: Record<string, EtiquetaTipoAlmacenamiento> = {
	ambiente_abierto: {
		apiValue: 'ambiente_abierto',
		displayLabel: 'Ambiente',
		icon: 'food-apple-outline',
		bgColor: '#FFF4ED',
		iconColor: '#FF8C42',
		subtitle: 'Despensa o alacena',
	},
	refrigerado_abierto: {
		apiValue: 'refrigerado_abierto',
		displayLabel: 'Refrigerado',
		icon: 'fridge-outline',
		bgColor: '#DBEAFE',
		iconColor: '#5B8DEF',
		subtitle: 'En la nevera',
	},
	congelado_abierto: {
		apiValue: 'congelado_abierto',
		displayLabel: 'Congelado',
		icon: 'snowflake',
		bgColor: '#CEFAFE',
		iconColor: '#36C5D3',
		subtitle: 'En el congelador',
	},
};

/**
 * Obtener la etiqueta formateada para un tipo de almacenamiento.
 * Devuelve una estructura lista para mostrar en la UI.
 * @param apiValue Valor recibido desde el API (ej. "refrigerado_abierto")
 */
export const obtenerEtiquetaTipoAlmacenamiento = (apiValue: string): EtiquetaTipoAlmacenamiento => {
    return (
        STORAGE_TYPE_MAP[apiValue.toLowerCase()] || {
            apiValue,
            displayLabel: apiValue
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' '),
            icon: 'package-variant',
            bgColor: '#F3F4F6',
            iconColor: '#6B7F95',
            subtitle: 'Almacenamiento',
        }
    );
};

/**
 * Formatear un array de tipos desde el API a objetos para la UI.
 * Mantiene un orden preferencial para renderizado.
 */
export const formatearTiposAlmacenamiento = (apiValues: string[]): EtiquetaTipoAlmacenamiento[] => {
    return apiValues
        .map(value => obtenerEtiquetaTipoAlmacenamiento(value))
        .sort((a, b) => {
            const order = ['ambiente_abierto', 'refrigerado_abierto', 'congelado_abierto'];
            return order.indexOf(a.apiValue) - order.indexOf(b.apiValue);
        });
};

/**
 * Obtener el nombre legible (display) de un tipo de almacenamiento.
 */
export const obtenerNombreTipoAlmacenamiento = (apiValue: string): string => {
    return obtenerEtiquetaTipoAlmacenamiento(apiValue).displayLabel;
};
