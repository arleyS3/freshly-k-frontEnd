import { useState } from "react";
import {
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	Pressable,
	ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Alert } from "react-native";
import { useAutenticacion } from "../hooks/useAutenticacion";
import type { LoginScreenProps } from "../navigation/types";

/**
 * LoginScreen - Pantalla para iniciar sesión en la aplicación.
 *
 * Contiene el formulario de email y contraseña, valida los campos
 * y delega la autenticación al AuthContext. El cambio de token
 * provoca el cambio automático del stack en el componente raíz.
 *
 * Responsabilidades:
 * - Recoger input del usuario (email y contraseña)
 * - Validar campos mínimos (formato de email, longitud de contraseña)
 * - Llamar a iniciarSesion expuesto por useAutenticacion
 * - Alternar visibilidad de la contraseña
 *
 * @param navigation - Props de navegación para LoginScreen
 */
function LoginScreen({ navigation }: LoginScreenProps) {
	const [correo, setCorreo] = useState("");
	const [contra, setContra] = useState("");
	const [loading, setLoading] = useState(false);
	const [mostrarPassword, setMostrarPassword] = useState(false);
	const [errores, setErrores] = useState<{ correo?: string; contra?: string }>(
		{},
	);

	const { iniciarSesion } = useAutenticacion();

	/**
	 * Valida un campo específico y actualiza errores en tiempo real.
	 */
	const validarCampo = (campo: "correo" | "contra", valor: string) => {
		setErrores((prev) => {
			const nuevo = { ...prev };
			if (
				campo === "correo" &&
				valor &&
				!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)
			) {
				nuevo.correo = "Ingresa un email válido";
			} else {
				delete nuevo.correo;
			}
			if (campo === "contra" && valor && valor.length < 6) {
				nuevo.contra = "La contraseña debe tener al menos 6 caracteres";
			} else {
				delete nuevo.contra;
			}
			return nuevo;
		});
	};

	/**
	 * Intenta autenticar al usuario.
	 *
	 * Si el login es correcto, el cambio de token provoca el cambio
	 * automático del stack en el componente raíz.
	 */
	const handleLogin = async () => {
		// Validar campos antes de enviar
		const nuevosErrores: { correo?: string; contra?: string } = {};
		if (!correo.trim()) {
			nuevosErrores.correo = "El email es requerido";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
			nuevosErrores.correo = "Ingresa un email válido";
		}
		if (!contra) {
			nuevosErrores.contra = "La contraseña es requerida";
		}
		setErrores(nuevosErrores);

		if (Object.keys(nuevosErrores).length > 0) {
			return;
		}

		setLoading(true);
		const res = await iniciarSesion(correo.trim().toLowerCase(), contra);
		setLoading(false);

		if (!res.ok) {
			Alert.alert("Error de inicio de sesión", res.message);
		}
	};

	return (
		<SafeAreaView style={style.container}>
			<KeyboardAwareScrollView
				contentContainerStyle={style.scrollContent}
				keyboardShouldPersistTaps="handled"
				enableOnAndroid={true}
				extraScrollHeight={24}
			>
				<TouchableOpacity
					style={style.backButton}
					onPress={() => navigation.goBack()}
				>
					<Feather name="arrow-left" size={24} color="#101828" />
				</TouchableOpacity>

				<View style={style.headerContainer}>
					<View style={style.logoContainer}>
						<MaterialCommunityIcons name="chef-hat" size={36} color="white" />
					</View>
					<Text style={style.title}>Bienvenido de nuevo</Text>
					<Text style={style.subtitle}>Inicia sesión para continuar</Text>
				</View>

				<View style={style.formContainer}>
					<Text style={style.label}>Email</Text>
					<View
						style={[style.inputContainer, errores.correo && style.inputError]}
					>
						<Feather
							name="mail"
							size={20}
							color="#9AAAB6"
							style={style.inputIcon}
						/>
						<TextInput
							value={correo}
							style={style.textInput}
							onChangeText={(t) => {
								setCorreo(t);
								if (errores.correo) validarCampo("correo", t);
							}}
							onBlur={() => validarCampo("correo", correo)}
							placeholder="tu@email.com"
							placeholderTextColor="#9AAAB6"
							keyboardType="email-address"
							autoCapitalize="none"
							textContentType="emailAddress"
							autoComplete="email"
						/>
					</View>
					{errores.correo && (
						<Text style={style.errorText}>{errores.correo}</Text>
					)}

					<Text style={[style.label, { marginTop: 16 }]}>Contraseña</Text>
					<View
						style={[style.inputContainer, errores.contra && style.inputError]}
					>
						<Feather
							name="lock"
							size={20}
							color="#9AAAB6"
							style={style.inputIcon}
						/>
						<TextInput
							value={contra}
							secureTextEntry={!mostrarPassword}
							style={style.textInput}
							onChangeText={(t) => {
								setContra(t);
								validarCampo("contra", t);
							}}
							onBlur={() => validarCampo("contra", contra)}
							placeholder="Tu contraseña"
							placeholderTextColor="#9AAAB6"
							textContentType="password"
							autoCapitalize="none"
						/>
						<TouchableOpacity
							onPress={() => setMostrarPassword(!mostrarPassword)}
							style={style.togglePassword}
							hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
						>
							<Feather
								name={mostrarPassword ? "eye-off" : "eye"}
								size={20}
								color="#9AAAB6"
							/>
						</TouchableOpacity>
					</View>
					{errores.contra && (
						<Text style={style.errorText}>{errores.contra}</Text>
					)}

					<TouchableOpacity
						style={style.forgotContainer}
						onPress={() => navigation.navigate("ForgotPassword")}
					>
						<Text style={style.forgotText}>¿Olvidaste tu contraseña?</Text>
					</TouchableOpacity>
				</View>

				<View style={style.bottomContainer}>
					<Pressable
						style={[style.button, loading && style.buttonLoading]}
						onPress={handleLogin}
						disabled={loading}
					>
						{loading ? (
							<ActivityIndicator color="white" size="small" />
						) : (
							<Text style={style.buttonText}>Iniciar sesión</Text>
						)}
					</Pressable>

					<View style={style.registerRow}>
						<Text style={style.texto}>¿No tienes cuenta? </Text>
						<Text
							style={style.textLink}
							onPress={() => {
								navigation.navigate("Register");
							}}
						>
							Crear cuenta
						</Text>
					</View>
				</View>
			</KeyboardAwareScrollView>
		</SafeAreaView>
	);
}

const style = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F9FAFB",
	},
	scrollContent: {
		flexGrow: 1,
		paddingHorizontal: 24,
		paddingTop: 20,
		paddingBottom: 40,
	},
	backButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "flex-start",
		marginBottom: 20,
	},
	headerContainer: {
		alignItems: "center",
		marginBottom: 40,
	},
	logoContainer: {
		width: 64,
		height: 64,
		backgroundColor: "#00CA55",
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 24,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 6,
		elevation: 3,
	},
	title: {
		fontSize: 30,
		fontWeight: "bold",
		color: "#101828",
		marginBottom: 8,
		textAlign: "center",
	},
	subtitle: {
		fontSize: 16,
		color: "#4A5565",
		textAlign: "center",
	},
	formContainer: {
		width: "100%",
		marginBottom: 32,
	},
	label: {
		color: "#364153",
		fontWeight: "bold",
		fontSize: 14,
		marginBottom: 8,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "white",
		borderWidth: 1.5,
		borderColor: "#E5E7EB",
		borderRadius: 16,
		paddingHorizontal: 16,
		height: 56,
	},
	inputIcon: {
		marginRight: 12,
	},
	textInput: {
		flex: 1,
		height: "100%",
		fontSize: 16,
		color: "#101828",
	},
	inputError: {
		borderColor: "#EF4444",
	},
	errorText: {
		color: "#EF4444",
		fontSize: 12,
		marginTop: 4,
		marginLeft: 4,
	},
	forgotContainer: {
		alignItems: "flex-end",
		marginTop: 12,
	},
	forgotText: {
		color: "#00CA55",
		fontSize: 14,
		fontWeight: "600",
	},
	bottomContainer: {
		width: "100%",
	},
	button: {
		paddingVertical: 16,
		borderRadius: 16,
		width: "100%",
		alignItems: "center",
		backgroundColor: "#00CA55",
		shadowColor: "#00CA55",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 6,
		elevation: 5,
		marginBottom: 20,
	},
	buttonText: {
		color: "white",
		fontWeight: "bold",
		fontSize: 16,
	},
	buttonLoading: {
		opacity: 0.7,
	},
	registerRow: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
	},
	texto: {
		color: "#4A5565",
		fontSize: 16,
	},
	textLink: {
		color: "#00CA55",
		fontWeight: "bold",
		fontSize: 16,
	},
	togglePassword: {
		padding: 4,
	},
});

export default function PantallaLogin(props: any) {
	return LoginScreen(props);
}
