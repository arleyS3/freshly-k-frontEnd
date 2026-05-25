import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * Tipo que define las rutas del stack principal de navegación y sus parámetros.
 * - Rutas de invitado: Index, Login, Register, ForgotPassword (sin parámetros).
 * - Rutas autenticadas: Home, AllProducts, Add, AgregarManual, SearchProduct,
 *   Settings (sin parámetros); ProductDetail (recibe productoId);
 *   ProductEdit (recibe inventarioId y productoNombre);
 *   RecipeDetail (recibe recetaId).
 */
export type RootStackParamList = {
	Index: undefined;
	Login: undefined;
	Register: undefined;
	ForgotPassword: undefined;
	Home: undefined;
	AllProducts: undefined;
	Add: undefined;
    AgregarManual: undefined;
	SearchProduct: undefined;
	ProductDetail: { productoId: number };
	ProductEdit: { inventarioId: number; productoNombre: string };
	Settings: undefined;
	RecipeDetail: { recetaId: number };
};

/**
 * Tipo que define las rutas del Tab Navigator inferior y sus parámetros.
 * - HomeTab: pantalla de inicio.
 * - AddTab: pantalla para agregar productos.
 * - HistoryTab: pantalla de historial.
 */
export type HomeTabParamList = {
	HomeTab: undefined;
	AddTab: undefined;
	HistoryTab: undefined;
};

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;
export type ForgotPasswordScreenProps = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;
export type IndexScreenProps = NativeStackScreenProps<RootStackParamList, 'Index'>;
export type AddScreenProps = NativeStackScreenProps<RootStackParamList, 'Add'>;
export type AgregarManualScreenProps = NativeStackScreenProps<RootStackParamList, 'AgregarManual'>;
export type SearchProductScreenProps = NativeStackScreenProps<RootStackParamList, 'SearchProduct'>;
export type ProductDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;
export type ProductEditScreenProps = NativeStackScreenProps<RootStackParamList, 'ProductEdit'>;
export type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;
export type AllProductsScreenProps = NativeStackScreenProps<RootStackParamList, 'AllProducts'>;
/**
 * Propiedades tipadas para la pantalla de historial.
 * 
 * @remarks
 * ACTUALMENTE el tipo apunta a la ruta 'Settings' del RootStackParamList,
 * lo cual parece ser un error. Debería apuntar a una ruta 'History' que aún
 * no existe en RootStackParamList, pero no se corrige para mantener
 * compatibilidad con el código existente.
 */
export type HistoryScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export type RecipeDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'RecipeDetail'>;

export type HomeScreenProps = CompositeScreenProps<
	BottomTabScreenProps<HomeTabParamList, 'HomeTab'>,
	NativeStackScreenProps<RootStackParamList>
>;
