import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Button, Chip, Text } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function PerfilScreen() {
  const { usuario, logout } = useAuth();
  const { mostrar } = useToast();

  const cerrar = async () => {
    await logout();
    mostrar('Sesión cerrada');
  };

  return (
    <View style={styles.contenedor}>
      <Avatar.Text size={88} label={(usuario?.nombre ?? '?').slice(0, 1).toUpperCase()} />
      <Text variant="headlineSmall" style={{ marginTop: 16 }}>{usuario?.nombre}</Text>
      <Text variant="bodyMedium" style={{ marginBottom: 12 }}>{usuario?.correo}</Text>
      <Chip icon={usuario?.rol === 'Docente' ? 'account-tie' : 'school-outline'}>{usuario?.rol}</Chip>
      <Button mode="contained" icon="logout" onPress={cerrar} style={{ marginTop: 32 }}>
        Cerrar sesión
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
