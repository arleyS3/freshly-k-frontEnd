import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { obtenerTodosLosProductosUsuario } from '../services/inventoryService';
import { useAutenticacion } from '../hooks/useAutenticacion';
import type { AllProductsScreenProps } from '../navigation/types';
import type { InventarioUsuarioProducto } from '../models';

const formatDiasRestantes = (diasRestantes: number): string => {
	if (diasRestantes < 0) {
		const diasVencido = Math.abs(diasRestantes);
		return diasVencido === 1 ? 'Vencio hace 1 dia' : `Vencio hace ${diasVencido} dias`;
	}

	if (diasRestantes === 0) {
		return 'Vence hoy';
	}

	return diasRestantes === 1 ? 'Vence en 1 dia' : `Vence en ${diasRestantes} dias`;
};

/**
 * TodosLosProductos - Lista completa del inventario del usuario.
 *
 * Muestra todos los productos del inventario con filtros por estado
 * y búsqueda por nombre. Cada producto es seleccionable para editar.
 *
 * Responsabilidades:
 * - Cargar todos los productos del usuario desde el servicio
 * - Filtrar por estado (todos, por vencer, recientes)
 * - Buscar por nombre con texto libre
 * - Mostrar días restantes con formato legible
 * - Navegar a ProductEditScreen al presionar un producto
 *
 * @param navigation - Props de navegación para AllProductsScreen
 */
export default function TodosLosProductos({ navigation }: AllProductsScreenProps) {
    const { usuario } = useAutenticacion();
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [productos, setProductos] = useState<InventarioUsuarioProducto[]>([]);
	const [porVencer, setPorVencer] = useState(0);
	const [busqueda, setBusqueda] = useState('');
	const [filtroActivo, setFiltroActivo] = useState<'todos' | 'porVencer' | 'recientes'>('todos');

	const totalProductos = useMemo(() => productos.length, [productos]);

	const productosFiltrados = useMemo(() => {
		const termino = busqueda.trim().toLowerCase();

		return productos
			.filter((producto) => {
				if (filtroActivo === 'porVencer') {
					return producto.diasRestantes <= 2;
				}

				if (filtroActivo === 'recientes') {
					return producto.diasRestantes >= 0;
				}

				return true;
			})
			.filter((producto) => {
				if (!termino) {
					return true;
				}

				const nombre = (producto.nombrePersonalizado || producto.nombreProducto || '').toLowerCase();
				return nombre.includes(termino);
			});
	}, [busqueda, filtroActivo, productos]);

	const loadProductos = useCallback(async (isRefresh = false) => {
		if (!usuario?.usuario_id) {
			setLoading(false);
			setRefreshing(false);
			setProductos([]);
			setPorVencer(0);
			setError('No hay sesion activa');
			return;
		}

		if (isRefresh) {
			setRefreshing(true);
		} else {
			setLoading(true);
		}
		setError(null);

        try {
            const response = await obtenerTodosLosProductosUsuario(usuario.usuario_id);
            const items = Array.isArray(response?.productos) ? response.productos : [];
            setProductos(items);
            setPorVencer(Number(response?.porVencer) || 0);
        } catch (e: any) {
            setError(e?.message || 'No se pudo cargar el inventario');
            setProductos([]);
            setPorVencer(0);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
	}, [usuario?.usuario_id]);

	useEffect(() => {
		loadProductos();
	}, [loadProductos]);

	const renderItem = ({ item }: { item: InventarioUsuarioProducto }) => {
		const nombre = item.nombrePersonalizado || item.nombreProducto;

		return (
			<Pressable
				style={styles.productCard}
				onPress={() =>
					navigation.navigate('ProductEdit', {
						inventarioId: item.inventarioId,
						productoNombre: nombre,
					})
				}
			>
				<View style={styles.cardLeft}>
					<View style={styles.iconBox}>
						<MaterialCommunityIcons name="food-steak" size={24} color="#00C950" />
					</View>
					<View style={styles.productTextWrap}>
						<Text numberOfLines={1} style={styles.productName}>{nombre}</Text>
						<View style={styles.infoRow}>
							<Feather name="clock" size={14} color="#6A7282" />
							<Text style={styles.productMeta}>{formatDiasRestantes(item.diasRestantes)}</Text>
						</View>
					</View>
				</View>

				<View style={styles.chevronBox}>
					<Feather name="chevron-right" size={22} color="#6A7282" />
				</View>
			</Pressable>
		);
	};

	const renderFilterButton = (label: string, value: 'todos' | 'porVencer' | 'recientes') => {
		const activo = filtroActivo === value;

		return (
			<Pressable
				onPress={() => setFiltroActivo(value)}
				style={[styles.filterButton, activo ? styles.filterButtonActive : styles.filterButtonInactive]}
			>
				<Text style={[styles.filterButtonText, activo ? styles.filterButtonTextActive : styles.filterButtonTextInactive]}>
					{label}
				</Text>
			</Pressable>
		);
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.headerTop}>
				<Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
					<Feather name="arrow-left" size={22} color="#101828" />
				</Pressable>
				<View style={styles.headerTextWrap}>
					<Text style={styles.title}>Inventario completo</Text>
					<Text style={styles.subtitle}>{totalProductos} alimentos</Text>
				</View>
			</View>

			<View style={styles.searchBox}>
				<Feather name="search" size={20} color="#6A7282" />
				<TextInput
					placeholder="Buscar alimento..."
					placeholderTextColor="#98A2B3"
					value={busqueda}
					onChangeText={setBusqueda}
					style={styles.searchInput}
				/>
			</View>
			<View style={styles.headerActions}>
				{renderFilterButton('Todos', 'todos')}
				{renderFilterButton('Próximos a vencer', 'porVencer')}
				{renderFilterButton('Más recientes', 'recientes')}
				<Pressable style={styles.iconActionButton} onPress={() => undefined}>
					<Feather name="sliders" size={20} color="#101828" />
				</Pressable>
			</View>

			{loading ? (
				<View style={styles.centerState}>
					<ActivityIndicator size="large" color="#00CA55" />
				</View>
			) : error ? (
				<View style={styles.centerState}>
					<Text style={styles.errorText}>{error}</Text>
					<Pressable style={styles.retryButton} onPress={() => loadProductos()}>
						<Text style={styles.retryText}>Reintentar</Text>
					</Pressable>
				</View>
			) : (
				<FlatList
					data={productosFiltrados}
					renderItem={renderItem}
					keyExtractor={(item) => String(item.inventarioId)}
					contentContainerStyle={styles.listContent}
					showsVerticalScrollIndicator={false}
					onRefresh={() => loadProductos(true)}
					refreshing={refreshing}
					ListEmptyComponent={
						<View style={styles.emptyState}>
							<Text style={styles.emptyTitle}>Tu inventario esta vacio</Text>
							<Text style={styles.emptySubtitle}>Agrega alimentos para verlos aqui.</Text>
						</View>
					}
				/>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#FFFFFF',
	},
	headerTop: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 24,
		paddingTop: 16,
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
		marginRight: 12,
	},
	headerTextWrap: {
		flex: 1,
	},
	title: {
		fontSize: 24,
		fontWeight: '700',
		color: '#101828',
	},
	subtitle: {
		fontSize: 14,
		lineHeight: 20,
		color: '#6A7282',
		marginTop: 2,
	},
	headerActions: {
		paddingHorizontal: 24,
		paddingTop: 16,
		paddingBottom: 12,
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'nowrap',
	},
	filterButton: {
		height: 40,
		borderRadius: 999,
		paddingHorizontal: 16,
		justifyContent: 'center',
		marginRight: 10,
	},
	filterButtonActive: {
		backgroundColor: '#DCFCE7',
	},
	filterButtonInactive: {
		backgroundColor: '#F3F4F6',
	},
	filterButtonText: {
		fontSize: 14,
		fontWeight: '600',
	},
	filterButtonTextActive: {
		color: '#166534',
	},
	filterButtonTextInactive: {
		color: '#101828',
	},
	iconActionButton: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#F3F4F6',
	},
	searchBox: {
		marginHorizontal: 24,
		height: 52,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: '#E5E7EB',
		backgroundColor: '#FFFFFF',
		paddingHorizontal: 16,
		flexDirection: 'row',
		alignItems: 'center',
	},
	searchInput: {
		flex: 1,
		marginLeft: 12,
		fontSize: 14,
		color: '#101828',
		paddingVertical: 0,
	},
	summaryBox: {
		marginHorizontal: 24,
		marginTop: 16,
		marginBottom: 12,
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		paddingVertical: 14,
		paddingHorizontal: 20,
		borderWidth: 1,
		borderColor: '#E5E7EB',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	summaryItem: {
		alignItems: 'center',
		justifyContent: 'center',
		flex: 1,
	},
	summaryDivider: {
		width: 1,
		height: 36,
		backgroundColor: '#E5E7EB',
	},
	summaryNumber: {
		fontSize: 20,
		fontWeight: '700',
		color: '#00A63E',
	},
	summaryLabel: {
		fontSize: 12,
		color: '#6A7282',
		marginTop: 2,
	},
	listContent: {
		paddingHorizontal: 24,
		paddingTop: 16,
		paddingBottom: 24,
	},
	productCard: {
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#E5E7EB',
		paddingHorizontal: 18,
		paddingVertical: 16,
		marginBottom: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		shadowColor: '#101828',
		shadowOpacity: 0.04,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 2 },
		elevation: 1,
	},
	cardLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
		marginRight: 10,
	},
	iconBox: {
		width: 48,
		height: 48,
		borderRadius: 14,
		backgroundColor: '#DCFCE7',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 14,
	},
	productTextWrap: {
		flex: 1,
	},
	productName: {
		fontSize: 16,
		fontWeight: '700',
		color: '#101828',
		marginBottom: 4,
	},
	infoRow: {
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'wrap',
	},
	productMeta: {
		marginLeft: 6,
		fontSize: 13,
		color: '#6A7282',
	},
	chevronBox: {
		width: 28,
		height: 28,
		alignItems: 'center',
		justifyContent: 'center',
	},
	centerState: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 24,
	},
	errorText: {
		fontSize: 14,
		color: '#B42318',
		textAlign: 'center',
		marginBottom: 12,
	},
	retryButton: {
		backgroundColor: '#00CA55',
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderRadius: 10,
	},
	retryText: {
		color: '#FFFFFF',
		fontWeight: '600',
		fontSize: 14,
	},
	emptyState: {
		paddingVertical: 48,
		alignItems: 'center',
	},
	emptyTitle: {
		fontSize: 16,
		fontWeight: '700',
		color: '#101828',
	},
	emptySubtitle: {
		fontSize: 13,
		color: '#6A7282',
		marginTop: 6,
	},
});
