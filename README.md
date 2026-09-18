# Freshly

Aplicación móvil para gestionar alimentos, controlar fechas de vencimiento y reducir el desperdicio de comida. Freshly permite registrar productos en el inventario, consultar información de alimentos, recibir alertas, revisar el historial de cambios y obtener sugerencias de recetas.

## Características principales

- Registro e inicio de sesión de usuarios.
- Persistencia de sesión mediante token JWT.
- Gestión del inventario personal.
- Búsqueda de productos en la API.
- Alta manual de alimentos.
- Edición, consumo y eliminación de productos del inventario.
- Alertas de productos próximos a vencer.
- Historial de acciones del inventario.
- Sugerencias de recetas según los productos disponibles.
- Preferencias de notificaciones y modo ahorro.
- Notificaciones push mediante Expo.
- Navegación con stack principal y pestañas inferiores.
- Soporte para Android, iOS y web mediante Expo.
- Soporte de tema claro y componentes preparados para modo oscuro en algunas vistas.

## Tecnologías

- **React Native 0.81.5**
- **Expo SDK 54**
- **TypeScript 5.9** con modo estricto habilitado
- **React 19**
- **React Navigation 7**
- **Axios** para comunicación HTTP
- **AsyncStorage** para persistencia multiplataforma
- **Expo SecureStore** para almacenar el token en dispositivos nativos cuando está disponible
- **Expo Notifications** para notificaciones push
- **React Native Safe Area Context** para adaptar la interfaz a las áreas seguras del dispositivo

## Arquitectura

El proyecto utiliza una arquitectura modular inspirada en **MVC**, adaptada a una aplicación React Native:

- **Views**: las pantallas y componentes de React Native se encargan de renderizar la interfaz y capturar la interacción del usuario.
- **Controllers**: `AuthContext` coordina el estado global de autenticación, la restauración de sesión y las operaciones de inicio/cierre de sesión.
- **Services**: los servicios encapsulan las llamadas a la API y no administran directamente el estado de la interfaz.
- **Models**: contienen las interfaces y tipos TypeScript utilizados para tipar usuarios, autenticación, productos, inventario, recetas y notificaciones.
- **Navigation**: define las rutas y los parámetros de navegación de forma tipada.
- **Config**: centraliza la URL de la API y el cliente HTTP de Axios.

### Flujo general de datos

```text
Pantalla / componente
        |
        v
Hook o AuthContext (estado y coordinación)
        |
        v
Service (petición HTTP)
        |
        v
apiClient de Axios
        |
        v
API backend
```

### Autenticación y sesión

1. `AuthProvider` restaura el usuario y el token al iniciar la aplicación.
2. `apiClient` agrega automáticamente el token como `Bearer` en las peticiones.
3. Al iniciar sesión, el token se guarda en SecureStore en nativo o AsyncStorage en web.
4. Los datos básicos del usuario se guardan en AsyncStorage.
5. Una respuesta HTTP `401` elimina el token almacenado.
6. El cambio de `tokenSesion` determina si se muestra el flujo de invitado o el flujo autenticado.

### Navegación

La navegación raíz se encuentra en `App.tsx` y utiliza:

- **Native Stack Navigator** para el flujo de invitado y las pantallas autenticadas.
- **Bottom Tab Navigator** para las pestañas principales:
  - Inicio
  - Agregar
  - Historial

Las rutas y sus parámetros están definidos en `navigation/types.ts` mediante `RootStackParamList` y `HomeTabParamList`.

## Estructura del proyecto

```text
.
├── App.tsx                 # Punto de entrada y configuración de navegación
├── index.ts                # Entrada de Expo
├── app.json                # Configuración de Expo
├── eas.json                # Perfiles de compilación y publicación con EAS
├── package.json            # Dependencias y scripts
├── tsconfig.json           # Configuración de TypeScript
├── assets/                 # Iconos, splash screen y favicon
├── components/             # Componentes reutilizables de presentación
├── config/                 # Configuración de API y cliente Axios
├── context/                # Contextos globales, principalmente autenticación
├── hooks/                  # Hooks personalizados
├── models/                 # Interfaces y modelos de dominio
├── navigation/             # Tipos y configuración relacionada con navegación
├── screen/                 # Pantallas de la aplicación
├── services/               # Servicios de autenticación, inventario, productos, recetas e historial
├── types/                  # Tipos auxiliares
└── utils/                  # Funciones utilitarias y formateadores
```

## Requisitos previos

Antes de instalar el proyecto, asegúrate de tener:

- Node.js LTS instalado.
- npm, yarn o pnpm.
- Git.
- Expo CLI mediante `npx expo`.
- Para Android: Android Studio, un emulador configurado o un dispositivo físico.
- Para iOS: macOS con Xcode o un dispositivo iOS compatible.
- Para web: un navegador moderno.

> Para notificaciones push, es necesario utilizar un dispositivo físico. Los simuladores y emuladores pueden no proporcionar un Expo Push Token válido.

## Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/arleyS3/freshly-k-frontEnd.git
cd freshly-k-frontEnd
```

2. Instala las dependencias:

```bash
npm install
```

3. Configura la URL del backend si necesitas utilizar una API distinta a la configurada por defecto.

Crea un archivo `.env` en la raíz del proyecto:

```env
EXPO_PUBLIC_API_BASE_URL=https://tu-api.example.com
```

La aplicación también contempla una URL de producción en Railway cuando no se define esta variable. En desarrollo web, la configuración actual utiliza `http://localhost:8080` como alternativa.

4. Inicia el proyecto:

```bash
npm start
```

Se abrirá Expo Dev Tools o se mostrará el menú interactivo de Expo para seleccionar el destino de ejecución.

## Comandos disponibles

```bash
# Iniciar Expo
a npm start

# Ejecutar en Android
npm run android

# Ejecutar en iOS
npm run ios

# Ejecutar en web
npm run web
```

> En el bloque anterior, el comando de inicio correcto es `npm start`. La línea `a npm start` no es necesaria y se muestra únicamente para evitar confusión con el nombre del script definido en `package.json`.

## Ejecutar con Expo Go

1. Ejecuta `npm start`.
2. Instala Expo Go en tu dispositivo móvil.
3. Escanea el código QR mostrado por Expo Dev Tools o por la terminal.
4. Verifica que el dispositivo y el equipo estén en la misma red, salvo que utilices un túnel.

## Variables de entorno

| Variable | Descripción | Obligatoria |
| --- | --- | --- |
| `EXPO_PUBLIC_API_BASE_URL` | URL base del backend de Freshly | No; existe una URL por defecto |

No guardes tokens, contraseñas ni credenciales reales en el repositorio. Si existe un archivo local de credenciales para desarrollo, debe mantenerse fuera del control de versiones y añadirse al `.gitignore`.

## Backend y endpoints

El frontend se comunica con el backend mediante Axios. Entre los recursos utilizados se encuentran:

- `/api/auth/login`
- `/api/auth/register`
- `/api/productos/search`
- `/api/productos/:id/detalle`
- Endpoints de inventario para crear, consultar, actualizar, consumir y eliminar productos.
- Endpoints de recetas para obtener sugerencias.
- `/api/notificaciones/push-token`
- `/api/notificaciones/preferencias`

La configuración central del cliente HTTP está en `config/apiClient.ts`, mientras que la resolución de la URL base se encuentra en `config/api.ts`.

## Compilación con EAS

El proyecto incluye `eas.json` con perfiles de desarrollo, preview y producción. Para utilizar EAS Build:

```bash
npx eas login
npx eas build:configure
npx eas build --profile development
```

Para una compilación de producción:

```bash
npx eas build --profile production
```

Revisa la configuración de Expo, el identificador del proyecto EAS y las credenciales de Android/iOS antes de generar una aplicación distribuible.

## Solución de problemas

### La aplicación no puede conectarse al backend

- Comprueba `EXPO_PUBLIC_API_BASE_URL`.
- Verifica que el backend esté disponible.
- En Android físico, no utilices `localhost` para acceder a un backend que se ejecuta en tu ordenador; usa la IP local del equipo o una URL accesible desde el dispositivo.
- Reinicia Expo limpiando la caché:

```bash
npx expo start -c
```

### El token no se conserva

- En dispositivos nativos se intenta utilizar `expo-secure-store`.
- En web se utiliza AsyncStorage.
- Revisa los logs de `apiClient` y `AuthContext`.

### No llegan las notificaciones push

- Usa un dispositivo físico.
- Acepta los permisos de notificación.
- Confirma que `projectId` esté configurado en `app.json`.
- Verifica que el token se haya registrado correctamente en el backend.

## Calidad y convenciones

- El código está escrito en TypeScript.
- Se recomienda mantener `strict: true` en `tsconfig.json`.
- Las pantallas deben delegar la comunicación con el backend a los servicios correspondientes.
- Los componentes reutilizables deben ubicarse en `components/`.
- Las rutas nuevas deben agregarse también a los tipos de `navigation/types.ts`.
- Las variables de entorno y credenciales no deben subirse al repositorio.

## Licencia

Este proyecto no declara actualmente una licencia de código abierto en el repositorio. Si se desea permitir su redistribución o uso por terceros, se debe añadir un archivo `LICENSE` con la licencia correspondiente.
