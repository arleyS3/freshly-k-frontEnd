import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAutenticacion } from '../hooks/useAutenticacion';
import { obtenerHistorialUsuario } from '../services/historyService';
import type { HistorialUsuarioItem } from '../models';

type FilterType = "todos" | "crear" | "actualizar" | "eliminar";
type StatusType = "CREAR" | "ACTUALIZAR" | "ELIMINAR";

interface HistoryItem {
  id: string;
  name: string;
  date: string;
  status: StatusType;
}

type HistoryNavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * HistoryScreen - Historial de acciones del inventario del usuario.
 *
 * Muestra un registro cronológico de las acciones realizadas
 * (crear, actualizar, eliminar) con filtros por tipo y un resumen
 * de los últimos 7 días.
 *
 * Responsabilidades:
 * - Cargar historial desde historyService
 * - Filtrar acciones por tipo (todos, crear, actualizar, eliminar)
 * - Mostrar resumen estadístico de los últimos 7 días
 * - Formatear fechas para mostrar en español
 */
function PantallaHistorial() {
  const navigation = useNavigation<HistoryNavigationProp>();
  const { usuario } = useAutenticacion();

  const [activeFilter, setActiveFilter] = useState<FilterType>("todos");
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function cargarHistorial() {
      if (!usuario?.usuario_id) {
        if (mounted) {
          setHistoryData([]);
          setIsLoading(false);
          setError('No se encontró un usuario autenticado.');
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await obtenerHistorialUsuario(usuario.usuario_id);
        if (!mounted) return;

        const normalized = response.map(mapHistorialItem);
        setHistoryData(normalized);
      } catch (err: any) {
        if (!mounted) return;
        setHistoryData([]);
        setError(err?.message || 'No se pudo cargar el historial.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    cargarHistorial();

    return () => {
      mounted = false;
    };
  }, [usuario?.usuario_id]);

  const getFilteredData = () => {
    if (activeFilter === "crear") {
      return historyData.filter((item) => item.status === "CREAR");
    } else if (activeFilter === "actualizar") {
      return historyData.filter((item) => item.status === "ACTUALIZAR");
    } else if (activeFilter === "eliminar") {
      return historyData.filter((item) => item.status === "ELIMINAR");
    }
    return historyData;
  };

  const getStatusConfig = (status: StatusType) => {
    switch (status) {
      case "CREAR":
        return {
          icon: "check-circle",
          iconColor: "#00CA55",
          textColor: "#00CA55",
          bgColor: "#E6F9F0",
          text: "Crear",
        };
      case "ACTUALIZAR":
        return {
          icon: "pencil-circle",
          iconColor: "#2B6CB0",
          textColor: "#2B6CB0",
          bgColor: "#EAF2FF",
          text: "Actualizar",
        };
      case "ELIMINAR":
        return {
          icon: "close-circle",
          iconColor: "#6B7F95",
          textColor: "#6B7F95",
          bgColor: "#F0F2F5",
          text: "Eliminar",
        };
    }
  };

  const summary = useMemo(() => ({
    crear: historyData.filter((item) => item.status === "CREAR").length,
    actualizar: historyData.filter((item) => item.status === "ACTUALIZAR").length,
    eliminar: historyData.filter((item) => item.status === "ELIMINAR").length,
  }), [historyData]);

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => {
    const config = getStatusConfig(item.status);
    return (
      <View style={styles.historyCard}>
        <MaterialCommunityIcons
          name={config.icon as any}
          size={24}
          color={config.iconColor}
        />
        <View style={styles.historyCardContent}>
          <Text style={styles.historyCardTitle}>{item.name}</Text>
          <View style={styles.dateContainer}>
            <MaterialCommunityIcons
              name="calendar-blank"
              size={14}
              color="#6B7F95"
            />
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
          <Text style={[styles.statusText, { color: config.textColor }]}>
            {config.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0B1D2E" />
        </Pressable>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Historial</Text>
          <Text style={styles.subtitle}>{historyData.length} registros</Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <Pressable
          style={[
            styles.filterTab,
            activeFilter === "todos" && styles.filterTabActive,
          ]}
          onPress={() => setActiveFilter("todos")}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === "todos" && styles.filterTextActive,
            ]}
          >
            Todos
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.filterTab,
            activeFilter === "crear" && styles.filterTabActive,
          ]}
          onPress={() => setActiveFilter("crear")}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === "crear" && styles.filterTextActive,
            ]}
          >
            Crear
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.filterTab,
            activeFilter === "actualizar" && styles.filterTabActive,
          ]}
          onPress={() => setActiveFilter("actualizar")}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === "actualizar" && styles.filterTextActive,
            ]}
          >
            Actualizar
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.filterTab,
            activeFilter === "eliminar" && styles.filterTabActive,
          ]}
          onPress={() => setActiveFilter("eliminar")}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === "eliminar" && styles.filterTextActive,
            ]}
          >
            Eliminar
          </Text>
        </Pressable>
      </View>

      {isLoading && <Text style={styles.infoText}>Cargando historial...</Text>}
      {!isLoading && error && <Text style={styles.errorText}>{error}</Text>}
      {!isLoading && !error && historyData.length === 0 && (
        <Text style={styles.infoText}>No hay registros de historial para este usuario.</Text>
      )}

      <FlatList
        data={getFilteredData()}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {activeFilter === "todos" && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Resumen últimos 7 días</Text>
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{summary.crear}</Text>
              <Text style={styles.statLabel}>Crear</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: "#2B6CB0" }]}>
                {summary.actualizar}
              </Text>
              <Text style={styles.statLabel}>Actualizar</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: "#6B7F95" }]}>
                {summary.eliminar}
              </Text>
              <Text style={styles.statLabel}>Eliminar</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FDF9",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    marginTop: 4,
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0B1D2E",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7F95",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 6,
    flexWrap: "wrap",
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F0F2F5",
  },
  filterTabActive: {
    backgroundColor: "#00CA55",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7F95",
  },
  filterTextActive: {
    color: "white",
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  historyCardContent: {
    flex: 1,
    marginLeft: 12,
  },
  historyCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0B1D2E",
    marginBottom: 4,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 13,
    color: "#6B7F95",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  summaryContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#6B7F95",
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: "#E63946",
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0B1D2E",
    marginBottom: 20,
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#00CA55",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7F95",
  },
});

function normalizeStatus(accion: string): StatusType {
  if (accion === "ELIMINAR") return "ELIMINAR";
  if (accion === "ACTUALIZAR") return "ACTUALIZAR";
  return "CREAR";
}

function formatHistoryDate(isoDate: string): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) return isoDate;

  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function mapHistorialItem(item: HistorialUsuarioItem): HistoryItem {
  return {
    id: String(item.historial_id),
    name: item.producto_nombre,
    date: formatHistoryDate(item.fecha),
    status: normalizeStatus(item.accion),
  };
}

export default PantallaHistorial;
