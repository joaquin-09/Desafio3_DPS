import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { correoValido } from '../utils/validators';
import { RootStackParamList } from '../types';

export default function LoginScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Login'>) {
  const { login } = useAuth();
  const { mostrar } = useToast();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [ver, setVer] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [intento, setIntento] = useState(false);

  const errorCorreo = intento && !correoValido(correo);
  const errorPass = intento && !password;

  const entrar = async () => {
    setIntento(true);
    if (!correoValido(correo) || !password) return;
    setEnviando(true);
    try {
      await login(correo, password);
    } catch (e: any) {
      mostrar(e.message ?? 'No se pudo iniciar sesión');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.contenedor} keyboardShouldPersistTaps="handled">
        <Text variant="displaySmall" style={styles.titulo}>📚 Recursos de Aprendizaje</Text>
        <Text variant="bodyMedium" style={styles.sub}>Inicia sesión para continuar</Text>

        <TextInput
          mode="outlined"
          label="Correo"
          value={correo}
          onChangeText={setCorreo}
          autoCapitalize="none"
          keyboardType="email-address"
          left={<TextInput.Icon icon="email-outline" />}
          error={errorCorreo}
        />
        <HelperText type="error" visible={errorCorreo}>Ingresa un correo válido</HelperText>

        <TextInput
          mode="outlined"
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!ver}
          left={<TextInput.Icon icon="lock-outline" />}
          right={<TextInput.Icon icon={ver ? 'eye-off' : 'eye'} onPress={() => setVer(!ver)} />}
          error={errorPass}
        />
        <HelperText type="error" visible={errorPass}>Ingresa tu contraseña</HelperText>

        <Button mode="contained" onPress={entrar} loading={enviando} disabled={enviando} style={styles.boton}>
          Iniciar sesión
        </Button>
        <Button onPress={() => navigation.navigate('Registro')}>¿No tienes cuenta? Regístrate</Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  titulo: { textAlign: 'center', marginBottom: 4 },
  sub: { textAlign: 'center', marginBottom: 24 },
  boton: { marginTop: 8, marginBottom: 8 },
});
