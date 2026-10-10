import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { correoValido, passwordValida, reglasPassword } from '../utils/validators';
import { Rol } from '../types';

export default function RegisterScreen() {
  const { registrar } = useAuth();
  const { mostrar } = useToast();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [rol, setRol] = useState<Rol>('Estudiante');
  const [ver, setVer] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [intento, setIntento] = useState(false);

  const errNombre = intento && nombre.trim().length < 3;
  const errCorreo = intento && !correoValido(correo);
  const errConf = (intento || confirmar.length > 0) && confirmar !== password;

  const crear = async () => {
    setIntento(true);
    if (nombre.trim().length < 3 || !correoValido(correo) || !passwordValida(password) || confirmar !== password) {
      return;
    }
    setEnviando(true);
    try {
      await registrar(nombre, correo, password, rol);
      mostrar('¡Cuenta creada con éxito!');
    } catch (e: any) {
      mostrar(e.message ?? 'No se pudo completar el registro');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.contenedor} keyboardShouldPersistTaps="handled">
        <TextInput mode="outlined" label="Nombre completo" value={nombre} onChangeText={setNombre} error={errNombre} />
        <HelperText type="error" visible={errNombre}>Mínimo 3 caracteres</HelperText>

        <TextInput
          mode="outlined"
          label="Correo"
          value={correo}
          onChangeText={setCorreo}
          autoCapitalize="none"
          keyboardType="email-address"
          error={errCorreo}
        />
        <HelperText type="error" visible={errCorreo}>Ingresa un correo válido</HelperText>

        <TextInput
          mode="outlined"
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!ver}
          right={<TextInput.Icon icon={ver ? 'eye-off' : 'eye'} onPress={() => setVer(!ver)} />}
        />
        {/* Checklist en vivo de las reglas de contraseña */}
        <View style={styles.reglas}>
          {reglasPassword(password).map((r) => (
            <Text key={r.texto} variant="bodySmall" style={{ color: r.cumple ? '#2e7d32' : (intento ? '#d32f2f' : '#757575') }}>
              {r.cumple ? '✓' : '•'} {r.texto}
            </Text>
          ))}
        </View>

        <TextInput
          mode="outlined"
          label="Confirmar contraseña"
          value={confirmar}
          onChangeText={setConfirmar}
          secureTextEntry={!ver}
          error={errConf}
        />
        <HelperText type="error" visible={errConf}>Las contraseñas no coinciden</HelperText>

        <Text variant="labelLarge" style={{ marginBottom: 8 }}>Tipo de cuenta</Text>
        <SegmentedButtons
          value={rol}
          onValueChange={(v) => setRol(v as Rol)}
          buttons={[
            { value: 'Estudiante', label: 'Estudiante', icon: 'school-outline' },
            { value: 'Docente', label: 'Docente', icon: 'account-tie' },
          ]}
        />

        <Button mode="contained" onPress={crear} loading={enviando} disabled={enviando} style={styles.boton}>
          Crear cuenta
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: { padding: 24 },
  reglas: { marginTop: 6, marginBottom: 12, gap: 2 },
  boton: { marginTop: 24 },
});
