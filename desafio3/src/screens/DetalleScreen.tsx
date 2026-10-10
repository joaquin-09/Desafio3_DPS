import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Divider, IconButton, Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import StarRating from '../components/StarRating';
import { calificarRecurso, obtenerRecurso } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useFavoritos } from '../context/FavoritesContext';
import { useToast } from '../context/ToastContext';
import { Recurso, RootStackParamList } from '../types';

export default function DetalleScreen({ route }: NativeStackScreenProps<RootStackParamList, 'Detalle'>) {
  const { usuario } = useAuth();
  const { esFavorito, alternar } = useFavoritos();
  const { mostrar } = useToast();
  const [recurso, setRecurso] = useState<Recurso | null>(null);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const esEstudiante = usuario?.rol === 'Estudiante';

  useFocusEffect(
    useCallback(() => {
      obtenerRecurso(route.params.id)
        .then(setRecurso)
        .catch((e) => setError(e.message));
    }, [route.params.id])
  );

  if (error) return <Text style={{ padding: 24 }}>{error}</Text>;
  if (!recurso) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  const miCalificacion =
    recurso.calificaciones?.find((c) => c.usuarioId === usuario?.id)?.valor ?? 0;

  const calificar = async (valor: number) => {
    if (!usuario) return;
    setEnviando(true);
    try {
      setRecurso(await calificarRecurso(recurso.id, usuario.id, valor));
      mostrar(`Calificaste este recurso con ${valor} ${valor === 1 ? 'estrella' : 'estrellas'}`);
    } catch (e: any) {
      mostrar(e.message ?? 'No se pudo guardar la calificación');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ScrollView>
      {!!recurso.imagen && <Image source={{ uri: recurso.imagen }} style={styles.imagen} resizeMode="cover" />}
      <View style={styles.cuerpo}>
        <View style={styles.fila}>
          <Text variant="headlineSmall" style={{ flex: 1 }}>{recurso.titulo}</Text>
          {esEstudiante && (
            <IconButton
              icon={esFavorito(recurso.id) ? 'heart' : 'heart-outline'}
              iconColor={esFavorito(recurso.id) ? '#e53935' : undefined}
              onPress={async () => mostrar((await alternar(recurso.id)) ? 'Agregado a favoritos' : 'Quitado de favoritos')}
            />
          )}
        </View>
        <Chip icon="tag-outline" compact style={{ alignSelf: 'flex-start', marginVertical: 8 }}>{recurso.tipo}</Chip>
        <Text variant="bodyLarge">{recurso.descripcion}</Text>

        <Button mode="contained" icon="open-in-new" style={{ marginTop: 16 }} onPress={() => Linking.openURL(recurso.enlace)}>
          Abrir recurso
        </Button>

        <Divider style={{ marginVertical: 20 }} />

        <Text variant="titleMedium">Calificación promedio</Text>
        <View style={styles.fila}>
          <StarRating valor={recurso.promedio ?? 0} />
          <Text variant="titleMedium">
            {(recurso.promedio ?? 0).toFixed(1)} · {recurso.votos ?? 0} {(recurso.votos ?? 0) === 1 ? 'voto' : 'votos'}
          </Text>
        </View>

        {esEstudiante && (
          <View style={{ marginTop: 16 }}>
            <Text variant="titleMedium">{miCalificacion ? 'Tu calificación' : 'Califica este recurso'}</Text>
            {enviando ? <ActivityIndicator style={{ alignSelf: 'flex-start', margin: 12 }} /> : <StarRating valor={miCalificacion} onCambiar={calificar} tamano={36} />}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  imagen: { width: '100%', height: 220 },
  cuerpo: { padding: 16 },
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
