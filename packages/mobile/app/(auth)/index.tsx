import { useAuth } from "@/context/AuthProvider";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { useState, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import RoundIcon from "@/components/ui/RoundIcon"; // Убедитесь, что путь правильный
import { Facebook, Github } from "lucide-react-native";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<any>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      formRef.current?.shake(500);
      Alert.alert("Ошибка", "Пожалуйста, заполните все поля");
      return;
    }
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      formRef.current?.shake(500);
      Alert.alert(
        "Ошибка",
        error instanceof Error ? error.message : "Неверный email или пароль",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log("Google login pressed");
  };

  const handleGithubLogin = () => {
    console.log("GitHub login pressed");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#1a237e", "#311b92", "#4a148c"]}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <Animatable.View
          ref={formRef}
          animation="fadeIn"
          duration={1000}
          style={styles.authBox}
        >
          <Text style={styles.title}>NETBIT</Text>
          {/* Иконки для социальных сетей */}
          <View style={styles.socialGridButtons}>
            <TouchableOpacity onPress={handleGoogleLogin}>
              <RoundIcon
                style={styles.socialButtons}
                IconComponent={Facebook}
                size={50}
                color="#fff"
                backgroundColor="#333144"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleGithubLogin}>
              <RoundIcon
                style={styles.socialButtons}
                IconComponent={Github}
                size={50}
                color="#fff"
                backgroundColor="#333144"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.containerdescription}>
            <View style={styles.sublinedescription} />
            <Text style={styles.subdescription}>или используйте email</Text>
            <View style={styles.sublinedescription} />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
          <TextInput
            style={styles.input}
            placeholder="Пароль"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
          />
          <TouchableOpacity
            onPress={handleLogin}
            style={[styles.button, isLoading && styles.buttonDisabled]}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>ВОЙТИ</Text>
            )}
          </TouchableOpacity>
        </Animatable.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  icons: {
    justifyContent: "center",
    marginTop: 10,
    marginHorizontal: 10,
  },
  socialGridButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  socialButtons: {
    marginHorizontal: 4,
  },
  iconForm: {
    backgroundColor: "#333144",
    borderRadius: 100,
    marginTop: 10,
    marginBottom: 20,
    width: 50,
    height: 50,
    alignItems: "center",
    shadowRadius: 1,
    shadowColor: "#000",
  },
  keyboardView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  authBox: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "rgba(30, 30, 45, 0.95)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
    letterSpacing: 2,
  },
  containerdescription: {
    marginTop: 20,
    marginBottom: 20,
    alignContent: "center",
    flexDirection: "row",
  },
  sublinedescription: {
    height: 1,
    backgroundColor: "#ffffff",
    marginHorizontal: 12,
    flex: 1,
  },
  subdescription: {
    color: "#aaaaaa",
    fontSize: 12,
  },
  formContainer: {
    width: "90%",
    backgroundColor: "#222131",
    alignItems: "center",
    shadowColor: "#000",
    shadowRadius: 10,
    borderRadius: 18,
  },
  input: {
    width: "90%",
    backgroundColor: "rgba(43, 43, 61, 0.8)",
    borderRadius: 12,
    padding: 15,
    marginTop: 25,
    marginBottom: 15,
    color: "#fff",
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#3c82f6",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#3c82f6",
    paddingVertical: 15,
    marginTop: 10,
    borderRadius: 12,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3c82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
    height: 50,
  },
  buttonDisabled: {
    backgroundColor: "#666",
    shadowOpacity: 0.2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
