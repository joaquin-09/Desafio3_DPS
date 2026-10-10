import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, FAB, Searchbar, SegmentedButtons, Text } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ResourceCard from './ResourceCard';
import { eliminarRecurso, obtenerRecursos } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useFavoritos } from '../context/FavoritesContext';
import { useToast } from '../context/ToastContext';
import { Recurso, RootStackParamList } from '../types';

type Modo = 'todos' | 'favoritos' | 'gestion';
type Orden = 'ninguno' | 'asc' | 'desc';

export default function ListaRecursos({ modo }: { modo: Modo }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { usuario } = useAuth();
  const { favoritos, esFavorito, alternar } = useFavoritos();
  const { mostrar } = useToast();

  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [tipo, setTipo] = useState('Todos');
  const [orden, setOrden] = useState<Orden>('ninguno');

  const esEstudiante = usuario?.rol === 'Estudiante';

  const cargar = useCallback(async (esRefresco = false) => {
    esRefresco ? setRefrescando(true) : setCargando(true);
    try {
      setRecursos(await obtenerRecursos());
      setError('');
    } catch (e: any) {
      setError(e.message ?? 'No se pudieron cargar los recursos');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  // Recarga cada vez que la pantalla recibe el foco (por ejemplo, tras editar o calificar)
  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const tipos = useMemo(
    () => ['Todos', ...Array.from(new Set(recursos.map((r) => r.tipo))).sort()],
    [recursos]
  );

  const visibles = useMemo(() => {
    let lista = modo === 'favoritos' ? recursos.filter((r) => favoritos.includes(r.id)) : recursos;
    if (tipo !== 'Todos') lista = lista.filter((r) => r.tipo === tipo);
    const q = busqueda.trim().toLowerCase();
    if (q) {
      // Búsqueda por ID (exacto), título o tipo
      lista = lista.filter(
        (r) => r.id === q || r.titulo.toLowerCase().includes(q) || r.tipo.toLowerCase().includes(q)
      );
    }
    if (orden !== 'ninguno') {
      lista = [...lista].sort((a, b) =>
        orden === 'asc' ? a.titulo.localeCompare(b.titulo) : b.titulo.localeCompare(a.titulo)
      );
    }
    return lista;
  }, [recursos, favoritos, modo, tipo, busqueda, orden]);

  const confirmarEliminar = (r: Recurso) =>
    Alert.alert('Eliminar recurso', `¿Seguro que deseas eliminar "${r.titulo}"? Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await eliminarRecurso(r.id);
            setRecursos((prev) => prev.filter((x) => x.id !== r.id));
            mostrar('Recurso eliminado');
          } catch (e: any) {
            mostrar(e.message ?? 'No se pudo eliminar');
          }
        },
      },
    ]);

  const toggleFavorito = async (r: Recurso) => {
    const ahora = await alternar(r.id);
    mostrar(ahora ? 'Agregado a favoritos' : 'Quitado de favoritos');
  };

  if (cargando) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.contenedor}>
      <Searchbar
        placeholder="Buscar por ID, título o tipo"
        value={busqueda}
        onChangeText={setBusqueda}
        style={styles.buscador}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {tipos.map((t) => (
          <Chip key={t} selected={tipo === t} showSelectedOverlay onPress={() => setTipo(t)} style={styles.chip}>
            {t}
          </Chip>
        ))}
      </ScrollView>
      <SegmentedButtons
        value={orden}
        onValueChange={(v) => setOrden(v as Orden)}
        density="small"
        style={styles.orden}
        buttons={[
          { value: 'ninguno', label: 'Sin orden' },
          { value: 'asc', label: 'A → Z', icon: 'sort-alphabetical-ascending' },
          { value: 'desc', label: 'Z → A', icon: 'sort-alphabetical-descending' },
        ]}
      />

      {error ? (
        <View style={styles.centro}>
          <Text style={{ marginBottom: 12 }}>{error}</Text>
          <Button mode="contained" onPress={() => cargar()}>Reintentar</Button>
        </View>
      ) : (
        <FlatList
          data={visibles}
          keyExtractor={(r) => r.id}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => cargar(true)} />}
          contentContainerStyle={{ paddingBottom: 96 }}
          ListEmptyComponent={
            <View style={styles.centro}>
              <Text>
                {modo === 'favoritos'
                  ? 'Aún no tienes recursos favoritos.'
                  : 'No se encontraron recursos.'}
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <ResourceCard
              recurso={item}
              indice={index}
              esFavorito={esFavorito(item.id)}
              onAbrir={() => navigation.navigate('Detalle', { id: item.id })}
              onFavorito={esEstudiante ? () => toggleFavorito(item) : undefined}
              onEditar={modo === 'gestion' ? () => navigation.navigate('Formulario', { recurso: item }) : undefined}
              onEliminar={modo === 'gestion' ? () => confirmarEliminar(item) : undefined}
            />
          )}
        />
      )}

      {modo === 'gestion' && (
        <FAB icon="plus" label="Nuevo recurso" style={styles.fab} onPress={() => navigation.navigate('Formulario')} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  buscador: { margin: 12, marginBottom: 4 },
  chips: { paddingHorizontal: 12, paddingVertical: 8 },
  chip: { marginRight: 8 },
  orden: { marginHorizontal: 12, marginBottom: 8 },
  centro: { alignItems: 'center', padding: 32 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
