import React, { useContext, useEffect, useRef } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

import PantallaInicio from './screen/HomeScreen';
import PantallaLogin from './screen/LoginScreen';
import PantallaRegistro from './screen/RegisterScreen';
import IndexScreen from './screen/IndexScreen';
import PantallaAgregar from './screen/AddScreen';
import AgregarManual from './screen/AddManualScreen';
import ForgotPasswordScreen from './screen/ForgotPassword';
import PantallaHistorial from './screen/HistoryScreen';
import PantallaBusquedaProducto from './screen/SearchProductScreen';
import DetalleProducto from './screen/ProductDetailScreen';
import ProductEditScreen from './screen/ProductEditScreen';
import SettingsScreen from './screen/SettingsScreen';
import TodosLosProductos from './screen/AllProducts';
import DetalleReceta from './screen/RecipeDetailScreen';
import { AuthProvider, AuthContext } from './context/AuthContext';
import type { HomeTabParamList, RootStackParamList } from './navigation/types';

// Configurar comportamiento de notificaciones en foreground
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: false,
		shouldSetBadge: false,
	}),
});

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<HomeTabParamList>();

/**
 * HomeTabs - Navegador de pestañas principales de la aplicación.
 *
 * Contiene las pestañas: Inicio, Agregar e Historial.
 * Cada pestaña usa un ícono de Feather con los colores de la aplicación.
 */
function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: React.ComponentProps<typeof Feather>['name'] = 'home';

          if (route.name === 'AddTab') {
            iconName = 'plus';
          } else if (route.name === 'HistoryTab') {
            iconName = 'calendar';
          }

          return <Feather name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#00CA55',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="HomeTab" component={PantallaInicio} options={{ title: 'Inicio' }} />
      <Tab.Screen name="AddTab" component={PantallaAgregar} options={{ title: 'Agregar' }} />
      <Tab.Screen name="HistoryTab" component={PantallaHistorial} options={{ title: 'Historial' }} />
    </Tab.Navigator>
  );
}

/**
 * RootNavigator - Navegador raíz que alterna entre stack autenticado e invitado.
 *
 * Responsabilidades:
 * - Determinar el stack activo según el estado de autenticación (tokenSesion)
 * - Mostrar indicador de carga mientras se verifica la sesión
 * - Renderizar el stack invitado (Index, Login, Register, ForgotPassword)
 * - Renderizar el stack autenticado (Home, AllProducts, Add, Settings, etc.)
 */
function RootNavigator() {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    return null;
  }

  const { tokenSesion, cargando } = authContext;

  if (cargando) {
    return null;
  }

  return (
    <Stack.Navigator
      key={tokenSesion ? 'auth-stack' : 'guest-stack'}
      screenOptions={{ headerShown: false }}
    >
      {tokenSesion ? (
        <>
          <Stack.Screen name="Home" component={HomeTabs} />
          <Stack.Screen name="AllProducts" component={TodosLosProductos} />
          <Stack.Screen name="Add" component={PantallaAgregar} />
          <Stack.Screen name="AgregarManual" component={AgregarManual} />
          <Stack.Screen name="SearchProduct" component={PantallaBusquedaProducto} />
          <Stack.Screen name="ProductDetail" component={DetalleProducto} />
          <Stack.Screen name="ProductEdit" component={ProductEditScreen} />
          <Stack.Screen name="RecipeDetail" component={DetalleReceta} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Index" component={IndexScreen} />
          <Stack.Screen name="Login" component={PantallaLogin} />
          <Stack.Screen name="Register" component={PantallaRegistro} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

/**
 * App - Componente raíz de la aplicación Freshly.
 *
 * Provee los contextos globales de navegación y autenticación:
 * SafeAreaProvider, AuthProvider y NavigationContainer.
 * Configura el manejador global de notificaciones en foreground
 * y la navegación por notificaciones push.
 */
export default function App() {
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  /**
   * Escucha respuestas a notificaciones push.
   * Cuando el usuario toca una notificación, navega a la pantalla
   * indicada en los datos de la notificación.
   */
  useEffect(() => {
    // Manejar respuesta al tocar una notificación
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      const screen = data?.screen as string | undefined;

      if (screen && navigationRef.current) {
        // Navegar a la pantalla indicada en los datos de la notificación
        switch (screen) {
          case 'AllProducts':
            navigationRef.current.navigate('AllProducts');
            break;
          default:
            navigationRef.current.navigate('Home');
        }
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer ref={navigationRef}>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
