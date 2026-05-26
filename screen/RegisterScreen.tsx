import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Alert } from "react-native";
import SuccessModal from "../components/SuccessModal";
import { useAutenticacion } from "../hooks/useAutenticacion";
import type { RegisterScreenProps } from "../navigation/types";

/**
 * RegisterScreen - Pantalla para registrar una nueva cuenta de usuario.
 *
 * Recoge nombre, email, contraseña y confirmación, valida los campos
 * en tiempo real y delega el registro al AuthContext.
 * Muestra un modal de éxito al completar el registro.
 *
 * Responsabilidades:
 * - Capturar nombre, email, contraseña y confirmación
 * - Validar campos en tiempo real (longitud, formato, coincidencia)
 * - Llamar a registrarUsuario expuesto por useAutenticacion
 * - Mostrar modal de éxito al completar el registro
 * - Navegar a LoginScreen tras registro exitoso
 *
 * @param navigation - Props de navegación para RegisterScreen
 */
export default function PantallaRegistro({ navigation }: RegisterScreenProps) {
	const [nombre, setNombre] = useState("");
	const [correo, setCorreo] = useState("");
	const [contra, setContra] = useState("");
	const [confirmarContra, setConfirmarContra] = useState("");
	const [isRegistering, setIsRegistering] = useState(false);
	const [showSuccessModal, setShowSuccessModal] = useState(false);

	// Estados para toggles de contraseña
	const [mostrarPassword, setMostrarPassword] = useState(false);
	const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

	// Estados para errores inline
	const [errores, setErrores] = useState<{
		nombre?: string;
		correo?: string;
		contra?: string;
		confirmar?: string;
	}>({});

	const [apiError, setApiError] = useState<string | null>(null);

	const { registrarUsuario } = useAutenticacion();

	/**
	 * Valida un campo específico y actualiza errores en tiempo real.
	 */
	const validarCampo = (
		campo: "nombre" | "correo" | "contra" | "confirmar",
		valor: string,
		valorContra?: string,
	) => {
		setApiError(null); // Limpiar error de API al editar
		setErrores((prev) => {
			const nuevo = { ...prev };

			if (campo === "nombre") {
				if (valor.trim().length < 2) {
					nuevo.nombre = "El nombre debe tener al menos 2 caracteres";
				} else {
					delete nuevo.nombre;
				}
			}

			if (campo === "correo") {
				if (valor && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
					nuevo.correo = "Ingresa un email válido";
				} else {
					delete nuevo.correo;
				}
			}

			if (campo === "contra") {
				if (valor && valor.length < 6) {
					nuevo.contra = "La contraseña debe tener al menos 6 caracteres";
				} else {
					delete nuevo.contra;
				}
				// También validar confirmar si ya tiene valor
				if (valorContra !== undefined && valorContra && valor !== valorContra) {
					nuevo.confirmar = "Las contraseñas no coinciden";
				} else if (valorContra !== undefined) {
					// Si la contra es válida, re-evaluar confirmar
					delete nuevo.confirmar;
				}
			}

			if (campo === "confirmar") {
				if (valorContra !== undefined && valor && valor !== valorContra) {
					nuevo.confirmar = "Las contraseñas no coinciden";
				} else {
					delete nuevo.confirmar;
				}
			}

			return nuevo;
		});
	};

	async function Registrar() {
		if (isRegistering) return;
		setApiError(null); // Limpiar error previo

		// Validar todos los campos antes de enviar
		const nuevosErrores: typeof errores = {};

		if (!nombre.trim()) {
			nuevosErrores.nombre = "El nombre es requerido";
		} else if (nombre.trim().length < 2) {
			nuevosErrores.nombre = "El nombre debe tener al menos 2 caracteres";
		}

		if (!correo.trim()) {
			nuevosErrores.correo = "El email es requerido";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
			nuevosErrores.correo = "Ingresa un email válido";
		}

		if (!contra) {
			nuevosErrores.contra = "La contraseña es requerida";
		} else if (contra.length < 6) {
			nuevosErrores.contra = "La contraseña debe tener al menos 6 caracteres";
		}

		if (!confirmarContra) {
			nuevosErrores.confirmar = "Confirma tu contraseña";
		} else if (contra !== confirmarContra) {
			nuevosErrores.confirmar = "Las contraseñas no coinciden";
		}

		setErrores(nuevosErrores);

		if (Object.keys(nuevosErrores).length > 0) {
			return;
		}

		try {
			setIsRegistering(true);
			const res = await registrarUsuario({
				email: correo.trim().toLowerCase(),
				password: contra,
				name: nombre,
			});
			if (res.ok) {
				setShowSuccessModal(true);
			} else {
				setApiError(
					res.message || "No se pudo crear la cuenta. Inténtalo de nuevo.",
				);
			}
		} finally {
			setIsRegistering(false);
		}
	}

	return (
		<>
			<SafeAreaView style={styles.container}>
				<KeyboardAwareScrollView
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={true}
					keyboardShouldPersistTaps="handled"
					enableOnAndroid={true}
					extraScrollHeight={24}
				>
					<TouchableOpacity
						style={styles.backButton}
						onPress={() => navigation.goBack()}
					>
						<Feather name="arrow-left" size={24} color="#101828" />
					</TouchableOpacity>

					<View style={styles.header}>
						<View style={styles.logoContainer}>
							<MaterialCommunityIcons name="chef-hat" size={35} color="white" />
						</View>
						<Text style={styles.title}>Crear cuenta</Text>
						<Text style={styles.subtitle}>
							Comienza a gestionar tu comida hoy
						</Text>
					</View>

					<View style={styles.formContainer}>
						<Text style={styles.label}>Nombre</Text>
						<View
							style={[
								styles.inputContainer,
								(errores.nombre || apiError) && styles.inputError,
							]}
						>
							<Feather
								name="user"
								size={20}
								color="#9AAAB6"
								style={styles.inputIcon}
							/>
							<TextInput
								value={nombre}
								style={styles.textInput}
								onChangeText={(t) => {
									setNombre(t);
									validarCampo("nombre", t);
								}}
								onBlur={() => validarCampo("nombre", nombre)}
								placeholder="Tu nombre"
								placeholderTextColor="#9AAAB6"
								textContentType="name"
								autoCapitalize="words"
							/>
						</View>
						{errores.nombre && (
							<Text style={styles.errorText}>{errores.nombre}</Text>
						)}

						<Text style={styles.label}>Email</Text>
						<View
							style={[
								styles.inputContainer,
								(errores.correo || apiError) && styles.inputError,
							]}
						>
							<Feather
								name="mail"
								size={20}
								color="#9AAAB6"
								style={styles.inputIcon}
							/>
							<TextInput
								value={correo}
								style={styles.textInput}
								onChangeText={(t) => {
									setCorreo(t);
									validarCampo("correo", t);
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
							<Text style={styles.errorText}>{errores.correo}</Text>
						)}

						<Text style={styles.label}>Contraseña</Text>
						<View
							style={[
								styles.inputContainer,
								(errores.contra || apiError) && styles.inputError,
							]}
						>
							<Feather
								name="lock"
								size={20}
								color="#9AAAB6"
								style={styles.inputIcon}
							/>
							<TextInput
								value={contra}
								secureTextEntry={!mostrarPassword}
								style={styles.textInput}
								onChangeText={(t) => {
									setContra(t);
									validarCampo("contra", t, confirmarContra);
								}}
								onBlur={() => validarCampo("contra", contra, confirmarContra)}
								placeholder="Mínimo 6 caracteres"
								placeholderTextColor="#9AAAB6"
								textContentType="newPassword"
							/>
							<TouchableOpacity
								onPress={() => setMostrarPassword(!mostrarPassword)}
								style={styles.togglePassword}
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
							<Text style={styles.errorText}>{errores.contra}</Text>
						)}

						{/* Confirmar Contraseña Input */}
						<Text style={styles.label}>Confirmar contraseña</Text>
						<View
							style={[
								styles.inputContainer,
								(errores.confirmar || apiError) && styles.inputError,
							]}
						>
							<Feather
								name="lock"
								size={20}
								color="#9AAAB6"
								style={styles.inputIcon}
							/>
							<TextInput
								value={confirmarContra}
								secureTextEntry={!mostrarConfirmar}
								style={styles.textInput}
								onChangeText={(t) => {
									setConfirmarContra(t);
									validarCampo("confirmar", t, contra);
								}}
								onBlur={() =>
									validarCampo("confirmar", confirmarContra, contra)
								}
								placeholder="Repite tu contraseña"
								placeholderTextColor="#9AAAB6"
								textContentType="newPassword"
							/>
							<TouchableOpacity
								onPress={() => setMostrarConfirmar(!mostrarConfirmar)}
								style={styles.togglePassword}
								hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
							>
								<Feather
									name={mostrarConfirmar ? "eye-off" : "eye"}
									size={20}
									color="#9AAAB6"
								/>
							</TouchableOpacity>
						</View>
						{errores.confirmar && (
							<Text style={styles.errorText}>{errores.confirmar}</Text>
						)}

						{apiError && (
							<Text
								style={[
									styles.errorText,
									{ marginTop: 16, textAlign: "center", fontSize: 14 },
								]}
							>
								{apiError}
							</Text>
						)}

						<Pressable
							style={[styles.button, isRegistering && styles.buttonDisabled]}
							onPress={Registrar}
							disabled={isRegistering}
						>
							{isRegistering ? (
								<ActivityIndicator color="white" size="small" />
							) : (
								<Text style={styles.buttonText}>Crear cuenta</Text>
							)}
						</Pressable>

						<View style={styles.loginRow}>
							<Text style={styles.texto}>¿Ya tienes cuenta? </Text>
							<Text
								style={styles.textLink}
								onPress={() => {
									navigation.navigate("Login");
								}}
							>
								Iniciar sesión
							</Text>
						</View>

						<View style={styles.termsContainer}>
							<Text style={styles.termsText}>
								Al crear una cuenta aceptas nuestros
							</Text>
							<Text style={styles.termsLink}>términos y condiciones</Text>
						</View>
					</View>
				</KeyboardAwareScrollView>
			</SafeAreaView>
			<SuccessModal
				visible={showSuccessModal}
				iconName="check-circle"
				title="Registro exitoso"
				description="Tu cuenta fue creada correctamente. Ahora puedes iniciar sesión."
				buttonText="Continuar"
				onButtonPress={() => navigation.navigate("Login")}
				onClose={() => setShowSuccessModal(false)}
				loading={false}
				disableActions={false}
			/>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F9FAFB",
	},
	scrollContent: {
		flexGrow: 1,
		paddingHorizontal: 24,
		paddingBottom: 40,
		paddingTop: 10,
	},
	topBar: {
		width: "100%",
		flexDirection: "row",
		justifyContent: "flex-start",
		marginBottom: 10,
		marginTop: 10,
	},
	backButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "flex-start",
		marginBottom: 20,
	},
	header: {
		alignItems: "center",
		marginBottom: 30,
	},
	logoContainer: {
		width: 60,
		height: 60,
		backgroundColor: "#00CA55",
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 16,
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#0B1D2E",
		marginBottom: 8,
	},
	subtitle: {
		color: "#4A657A",
		fontSize: 14,
	},
	formContainer: {
		width: "100%",
	},
	label: {
		color: "#0B1D2E",
		fontWeight: "700",
		fontSize: 14,
		marginBottom: 8,
		marginTop: 16,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "white",
		borderWidth: 1,
		borderColor: "#E5E5E5",
		borderRadius: 16,
		paddingHorizontal: 16,
		height: 56,
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
	inputIcon: {
		marginRight: 12,
	},
	textInput: {
		flex: 1,
		height: "100%",
		fontSize: 15,
		color: "#0B1D2E",
	},
	togglePassword: {
		padding: 4,
	},
	button: {
		marginTop: 32,
		paddingVertical: 18,
		borderRadius: 16,
		width: "100%",
		alignItems: "center",
		backgroundColor: "#00CA55",
		shadowColor: "#00CA55",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 5,
	},
	buttonText: {
		color: "white",
		fontWeight: "bold",
		fontSize: 16,
	},
	buttonDisabled: {
		opacity: 0.7,
	},
	loginRow: {
		marginTop: 20,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
	},
	texto: {
		color: "#4A657A",
		fontSize: 14,
	},
	textLink: {
		color: "#00CA55",
		fontWeight: "bold",
		fontSize: 14,
	},
	termsContainer: {
		marginTop: 30,
		alignItems: "center",
	},
	termsText: {
		color: "#9AAAB6",
		fontSize: 12,
	},
	termsLink: {
		color: "#00CA55",
		fontSize: 12,
		fontWeight: "600",
		marginTop: 4,
	},
});
