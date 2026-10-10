# 📚 Lista de Recursos de Aprendizaje

Tercer Desafío Práctico — Diseño y Programación de Software Multiplataforma (DPS441)

## 🔗 Enlaces

- **Repositorio de GitHub:** [PEGA_AQUI_LA_URL_DEL_REPOSITORIO](PEGA_AQUI_LA_URL_DEL_REPOSITORIO)
- **Video demostrativo:** [PEGA_AQUI_LA_URL_DEL_VIDEO](PEGA_AQUI_LA_URL_DEL_VIDEO)
- **API (mockapi.io):** `https://6aca8b823115bcc95820ecaa.mockapi.io`

## ✨ Funcionalidades

- Registro de usuario con validación segura de contraseña (mínimo 12 caracteres, mayúscula, minúscula, número y carácter especial) y checklist en vivo en pantalla
- Inicio de sesión con sesión persistente (`AsyncStorage`) y cierre de sesión
- Contraseñas guardadas como hash SHA-256, nunca en texto plano
- Dos roles con navegación distinta:
  - **Estudiante:** ver, buscar, filtrar, ordenar, marcar favoritos y calificar recursos
  - **Docente:** CRUD completo de recursos (POST, PUT y DELETE) desde la pestaña *Gestión*
- Búsqueda por ID, título o tipo; filtro por tipo y orden alfabético A → Z / Z → A
- Favoritos persistidos localmente, separados por usuario, con pestaña propia
- Sistema de calificación de 1 a 5 estrellas: un voto por estudiante por recurso (si vuelve a votar, se reemplaza), con promedio y número de votos guardados en el backend
- Validaciones visibles en formularios: campos vacíos, formato de correo, URLs válidas, longitud mínima
- Confirmación antes de eliminar un recurso
- Retroalimentación visual: indicadores de carga, pull-to-refresh, mensajes (Snackbar), animaciones de entrada en las tarjetas y manejo de errores de red con botón *Reintentar*

## 🛠️ Tecnologías

- React Native (Expo)
- TypeScript
- React Navigation (Native Stack + Bottom Tabs)
- React Native Paper (Material Design 3)
- Context API (sesión, favoritos y mensajes)
- `@react-native-async-storage/async-storage` (sesión y favoritos)
- `expo-crypto` (hash SHA-256 de contraseñas)
- mockapi.io (API REST dinámica en formato JSON)

## 🌐 API (mockapi.io)

URL base: `https://6aca8b823115bcc95820ecaa.mockapi.io`

| Recurso | Endpoint | Campos |
| --- | --- | --- |
| Usuarios | `/usuarios` | `nombre`, `correo`, `password` (hash), `rol` (`Estudiante` o `Docente`) |
| Recursos | `/recursos` | `titulo`, `descripcion`, `tipo`, `enlace`, `imagen`, `calificaciones` (arreglo de `{ usuarioId, valor }`), `promedio`, `votos` |

Operaciones utilizadas: `GET`, `POST`, `PUT` y `DELETE` sobre `/recursos`; `GET` y `POST` sobre `/usuarios`.

## 📂 Estructura del proyecto

```
desafio3/
├── App.tsx                        # Proveedores globales (tema, toast, auth, favoritos)
└── src/
    ├── config.ts                  # URL de la API y tipos de recurso
    ├── types.ts                   # Interfaces TypeScript (Usuario, Recurso, etc.)
    ├── api/
    │   └── api.ts                 # Llamadas a la API (CRUD, usuarios, calificaciones)
    ├── context/
    │   ├── AuthContext.tsx        # Registro, login, logout y sesión persistente
    │   ├── FavoritesContext.tsx   # Favoritos por usuario (AsyncStorage)
    │   └── ToastContext.tsx       # Mensajes de retroalimentación (Snackbar)
    ├── components/
    │   ├── ListaRecursos.tsx      # Lista con búsqueda, filtro, orden (todos / favoritos / gestión)
    │   ├── ResourceCard.tsx       # Tarjeta de recurso con animación de entrada
    │   └── StarRating.tsx         # Estrellas de calificación
    ├── screens/
    │   ├── LoginScreen.tsx
    │   ├── RegisterScreen.tsx
    │   ├── DetalleScreen.tsx      # Detalle del recurso y calificación
    │   ├── FormularioScreen.tsx   # Crear / editar recurso (Docente)
    │   └── PerfilScreen.tsx       # Datos del usuario y cierre de sesión
    ├── navigation/
    │   └── Navegacion.tsx         # Stack + Tabs según el rol
    └── utils/
        └── validators.ts          # Validaciones de contraseña, correo y URL
```

## 📄 ARCHIVOS

### 1️⃣ `src/types.ts`

```ts
export type Rol = 'Estudiante' | 'Docente';

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  password: string; // hash SHA-256, nunca texto plano
  rol: Rol;
}

export type Sesion = Omit<Usuario, 'password'>;

export interface Calificacion {
  usuarioId: string;
  valor: number; // 1 a 5
}

export interface Recurso {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  enlace: string;
  imagen: string;
  calificaciones?: Calificacion[];
  promedio?: number;
  votos?: number;
}

export type RecursoInput = Pick<
  Recurso,
  'titulo' | 'descripcion' | 'tipo' | 'enlace' | 'imagen'
>;

export type RootStackParamList = {
  Login: undefined;
  Registro: undefined;
  Principal: undefined;
  Detalle: { id: string };
  Formulario: { recurso?: Recurso } | undefined;
};
```

### 2️⃣ `src/config.ts`

```ts
// URL base del proyecto en mockapi.io (sin "/" final).
export const API_URL = 'https://6aca8b823115bcc95820ecaa.mockapi.io';

export const TIPOS_RECURSO = ['Libro', 'Video', 'Artículo', 'Tutorial', 'Curso'];
```

### 3️⃣ `src/utils/validators.ts`

```ts
export interface ReglaPassword {
  texto: string;
  cumple: boolean;
}

export const reglasPassword = (p: string): ReglaPassword[] => [
  { texto: 'Mínimo 12 caracteres', cumple: p.length >= 12 },
  { texto: 'Al menos una letra mayúscula', cumple: /[A-Z]/.test(p) },
  { texto: 'Al menos una letra minúscula', cumple: /[a-z]/.test(p) },
  { texto: 'Al menos un número', cumple: /[0-9]/.test(p) },
  { texto: 'Al menos un carácter especial (! @ # $ % ^ & *)', cumple: /[!@#$%^&*]/.test(p) },
];

export const passwordValida = (p: string) => reglasPassword(p).every((r) => r.cumple);

export const correoValido = (c: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.trim());

export const urlValida = (u: string) => /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(u.trim());
```

### 4️⃣ `src/api/api.ts`

```ts
import { API_URL } from '../config';
import { Calificacion, Recurso, RecursoInput, Usuario } from '../types';

async function peticion<T>(ruta: string, opciones?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${ruta}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opciones,
  });
  if (!res.ok) {
    throw new Error(`Error ${res.status} al comunicarse con el servidor`);
  }
  return res.json() as Promise<T>;
}

/* ---------- Usuarios ---------- */

export async function buscarUsuarioPorCorreo(correo: string): Promise<Usuario | null> {
  try {
    const lista = await peticion<Usuario[]>(`/usuarios?correo=${encodeURIComponent(correo)}`);
    // mockapi filtra por coincidencia parcial, por eso se compara exacto
    return lista.find((u) => u.correo.toLowerCase() === correo.toLowerCase()) ?? null;
  } catch (e: any) {
    // mockapi responde 404 cuando el filtro no encuentra nada
    if (String(e.message).includes('404')) return null;
    throw e;
  }
}

export const registrarUsuario = (u: Omit<Usuario, 'id'>) =>
  peticion<Usuario>('/usuarios', { method: 'POST', body: JSON.stringify(u) });

/* ---------- Recursos (CRUD) ---------- */

export const obtenerRecursos = () => peticion<Recurso[]>('/recursos');

export const obtenerRecurso = (id: string) => peticion<Recurso>(`/recursos/${id}`);

export const crearRecurso = (r: RecursoInput) =>
  peticion<Recurso>('/recursos', {
    method: 'POST',
    body: JSON.stringify({ ...r, calificaciones: [], promedio: 0, votos: 0 }),
  });

export const actualizarRecurso = (id: string, r: Partial<Recurso>) =>
  peticion<Recurso>(`/recursos/${id}`, { method: 'PUT', body: JSON.stringify(r) });

export const eliminarRecurso = (id: string) =>
  peticion<Recurso>(`/recursos/${id}`, { method: 'DELETE' });

/* ---------- Calificaciones ---------- */

export const calcularPromedio = (c: Calificacion[]) =>
  c.length ? Math.round((c.reduce((s, x) => s + x.valor, 0) / c.length) * 10) / 10 : 0;

// Un estudiante solo tiene una calificación por recurso: si vuelve a calificar, se reemplaza.
export async function calificarRecurso(
  id: string,
  usuarioId: string,
  valor: number
): Promise<Recurso> {
  const actual = await obtenerRecurso(id); // se lee el estado más reciente para no pisar votos ajenos
  const previas = (actual.calificaciones ?? []).filter((c) => c.usuarioId !== usuarioId);
  const calificaciones = [...previas, { usuarioId, valor }];
  return actualizarRecurso(id, {
    ...actual,
    calificaciones,
    promedio: calcularPromedio(calificaciones),
    votos: calificaciones.length,
  });
}
```

### 5️⃣ `src/context/ToastContext.tsx`

```tsx
import React, { createContext, useCallback, useContext, useState } from 'react';
import { Snackbar } from 'react-native-paper';

interface ToastCtx {
  mostrar: (mensaje: string) => void;
}

const Ctx = createContext<ToastCtx>({ mostrar: () => {} });
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [mensaje, setMensaje] = useState('');
  const [visible, setVisible] = useState(false);

  const mostrar = useCallback((m: string) => {
    setMensaje(m);
    setVisible(true);
  }, []);

  return (
    <Ctx.Provider value={{ mostrar }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={2800}
        action={{ label: 'OK', onPress: () => setVisible(false) }}
      >
        {mensaje}
      </Snackbar>
    </Ctx.Provider>
  );
}
```

### 6️⃣ `src/context/AuthContext.tsx`

```tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { buscarUsuarioPorCorreo, registrarUsuario } from '../api/api';
import { Rol, Sesion } from '../types';

const CLAVE_SESION = 'sesion';

interface AuthCtx {
  usuario: Sesion | null;
  cargando: boolean;
  login: (correo: string, password: string) => Promise<void>;
  registrar: (nombre: string, correo: string, password: string, rol: Rol) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>(null as unknown as AuthCtx);
export const useAuth = () => useContext(Ctx);

const hash = (texto: string) =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, texto);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Sesion | null>(null);
  const [cargando, setCargando] = useState(true);

  // Restaura la sesión guardada al abrir la app
  useEffect(() => {
    AsyncStorage.getItem(CLAVE_SESION)
      .then((v) => v && setUsuario(JSON.parse(v)))
      .finally(() => setCargando(false));
  }, []);

  const guardarSesion = async (s: Sesion) => {
    setUsuario(s);
    await AsyncStorage.setItem(CLAVE_SESION, JSON.stringify(s));
  };

  const login = async (correo: string, password: string) => {
    const u = await buscarUsuarioPorCorreo(correo.trim());
    if (!u || u.password !== (await hash(password))) {
      throw new Error('Correo o contraseña incorrectos');
    }
    const { password: _omitida, ...sesion } = u;
    await guardarSesion(sesion);
  };

  const registrar = async (nombre: string, correo: string, password: string, rol: Rol) => {
    if (await buscarUsuarioPorCorreo(correo.trim())) {
      throw new Error('Ya existe una cuenta con ese correo');
    }
    const nuevo = await registrarUsuario({
      nombre: nombre.trim(),
      correo: correo.trim().toLowerCase(),
      password: await hash(password),
      rol,
    });
    const { password: _omitida, ...sesion } = nuevo;
    await guardarSesion(sesion);
  };

  const logout = async () => {
    setUsuario(null);
    await AsyncStorage.removeItem(CLAVE_SESION);
  };

  return (
    <Ctx.Provider value={{ usuario, cargando, login, registrar, logout }}>
      {children}
    </Ctx.Provider>
  );
}
```

### 7️⃣ `src/context/FavoritesContext.tsx`

```tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

interface FavCtx {
  favoritos: string[];
  esFavorito: (id: string) => boolean;
  alternar: (id: string) => Promise<boolean>; // devuelve true si quedó como favorito
}

const Ctx = createContext<FavCtx>(null as unknown as FavCtx);
export const useFavoritos = () => useContext(Ctx);

// Los favoritos se guardan en el dispositivo, separados por usuario.
export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { usuario } = useAuth();
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const clave = usuario ? `favoritos_${usuario.id}` : null;

  useEffect(() => {
    if (!clave) {
      setFavoritos([]);
      return;
    }
    AsyncStorage.getItem(clave).then((v) => setFavoritos(v ? JSON.parse(v) : []));
  }, [clave]);

  const alternar = async (id: string) => {
    const siguiente = favoritos.includes(id)
      ? favoritos.filter((f) => f !== id)
      : [...favoritos, id];
    setFavoritos(siguiente);
    if (clave) await AsyncStorage.setItem(clave, JSON.stringify(siguiente));
    return siguiente.includes(id);
  };

  return (
    <Ctx.Provider value={{ favoritos, esFavorito: (id) => favoritos.includes(id), alternar }}>
      {children}
    </Ctx.Provider>
  );
}
```

### 8️⃣ `src/components/StarRating.tsx`

```tsx
import React from 'react';
import { View } from 'react-native';
import { IconButton } from 'react-native-paper';

interface Props {
  valor: number;
  onCambiar?: (v: number) => void; // si no se pasa, es solo lectura
  tamano?: number;
}

export default function StarRating({ valor, onCambiar, tamano = 28 }: Props) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <IconButton
          key={n}
          icon={n <= Math.round(valor) ? 'star' : 'star-outline'}
          iconColor="#f5a623"
          size={tamano}
          style={{ margin: 0 }}
          disabled={!onCambiar}
          onPress={() => onCambiar?.(n)}
          accessibilityLabel={`${n} estrellas`}
        />
      ))}
    </View>
  );
}
```

### 9️⃣ `src/components/ResourceCard.tsx`

```tsx
import React, { useEffect, useRef } from 'react';
import { Animated, Linking, StyleSheet, View } from 'react-native';
import { Card, Chip, IconButton, Text } from 'react-native-paper';
import { Recurso } from '../types';
import StarRating from './StarRating';

interface Props {
  recurso: Recurso;
  indice: number;
  esFavorito?: boolean;
  onAbrir: () => void;
  onFavorito?: () => void; // solo estudiantes
  onEditar?: () => void; // solo docentes
  onEliminar?: () => void; // solo docentes
}

export default function ResourceCard({
  recurso,
  indice,
  esFavorito,
  onAbrir,
  onFavorito,
  onEditar,
  onEliminar,
}: Props) {
  // Animación de entrada escalonada
  const opacidad = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacidad, {
      toValue: 1,
      duration: 350,
      delay: Math.min(indice, 8) * 60,
      useNativeDriver: true,
    }).start();
  }, [indice, opacidad]);

  return (
    <Animated.View style={{ opacity: opacidad, transform: [{ translateY: opacidad.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
      <Card style={styles.card} onPress={onAbrir}>
        {!!recurso.imagen && <Card.Cover source={{ uri: recurso.imagen }} />}
        <Card.Title
          title={recurso.titulo}
          titleNumberOfLines={2}
          subtitle={`ID ${recurso.id}`}
          right={() =>
            onFavorito ? (
              <IconButton
                icon={esFavorito ? 'heart' : 'heart-outline'}
                iconColor={esFavorito ? '#e53935' : undefined}
                onPress={onFavorito}
                accessibilityLabel="Marcar como favorito"
              />
            ) : null
          }
        />
        <Card.Content>
          <View style={styles.fila}>
            <Chip compact icon="tag-outline">{recurso.tipo}</Chip>
            <View style={styles.fila}>
              <StarRating valor={recurso.promedio ?? 0} tamano={16} />
              <Text variant="labelSmall">
                {(recurso.promedio ?? 0).toFixed(1)} ({recurso.votos ?? 0})
              </Text>
            </View>
          </View>
          <Text variant="bodyMedium" numberOfLines={2} style={styles.desc}>
            {recurso.descripcion}
          </Text>
          <Text
            variant="bodySmall"
            numberOfLines={1}
            style={styles.enlace}
            onPress={() => Linking.openURL(recurso.enlace)}
          >
            {recurso.enlace}
          </Text>
        </Card.Content>
        {(onEditar || onEliminar) && (
          <Card.Actions>
            {onEditar && <IconButton icon="pencil" onPress={onEditar} accessibilityLabel="Editar" />}
            {onEliminar && (
              <IconButton icon="delete" iconColor="#d32f2f" onPress={onEliminar} accessibilityLabel="Eliminar" />
            )}
          </Card.Actions>
        )}
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 12, marginBottom: 12 },
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  desc: { marginTop: 8 },
  enlace: { marginTop: 6, marginBottom: 10, color: '#1565c0', textDecorationLine: 'underline' },
});
```

### 🔟 `src/components/ListaRecursos.tsx`

```tsx
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chips}
      >
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
  chipsScroll: { flexGrow: 0, flexShrink: 0 }, // evita que el layout aplaste la barra de chips
  chips: { paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center' },
  chip: { marginRight: 8 },
  orden: { marginHorizontal: 12, marginBottom: 8 },
  centro: { alignItems: 'center', padding: 32 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
```

### 1️⃣1️⃣ `src/screens/LoginScreen.tsx`

```tsx
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
```

### 1️⃣2️⃣ `src/screens/RegisterScreen.tsx`

```tsx
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
```

### 1️⃣3️⃣ `src/screens/PerfilScreen.tsx`

```tsx
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
```

### 1️⃣4️⃣ `src/screens/FormularioScreen.tsx`

```tsx
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, HelperText, Text, TextInput } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { actualizarRecurso, crearRecurso } from '../api/api';
import { TIPOS_RECURSO } from '../config';
import { useToast } from '../context/ToastContext';
import { urlValida } from '../utils/validators';
import { RootStackParamList } from '../types';

export default function FormularioScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Formulario'>) {
  const editando = route.params?.recurso;
  const { mostrar } = useToast();

  const [titulo, setTitulo] = useState(editando?.titulo ?? '');
  const [descripcion, setDescripcion] = useState(editando?.descripcion ?? '');
  const [tipo, setTipo] = useState(editando?.tipo ?? '');
  const [enlace, setEnlace] = useState(editando?.enlace ?? '');
  const [imagen, setImagen] = useState(editando?.imagen ?? '');
  const [intento, setIntento] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const errores = {
    titulo: titulo.trim().length < 3 ? 'El título debe tener al menos 3 caracteres' : '',
    descripcion: descripcion.trim().length < 10 ? 'La descripción debe tener al menos 10 caracteres' : '',
    tipo: !tipo.trim() ? 'Selecciona o escribe un tipo' : '',
    enlace: !urlValida(enlace) ? 'Ingresa una URL válida (http:// o https://)' : '',
    imagen: !urlValida(imagen) ? 'Ingresa una URL de imagen válida' : '',
  };
  const hayErrores = Object.values(errores).some(Boolean);
  const ver = (campo: keyof typeof errores) => intento && !!errores[campo];

  const guardar = async () => {
    setIntento(true);
    if (hayErrores) return;
    setEnviando(true);
    const datos = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      tipo: tipo.trim(),
      enlace: enlace.trim(),
      imagen: imagen.trim(),
    };
    try {
      if (editando) {
        await actualizarRecurso(editando.id, { ...editando, ...datos }); // PUT
        mostrar('Recurso actualizado');
      } else {
        await crearRecurso(datos); // POST
        mostrar('Recurso creado');
      }
      navigation.goBack();
    } catch (e: any) {
      mostrar(e.message ?? 'No se pudo guardar el recurso');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.contenedor} keyboardShouldPersistTaps="handled">
        <TextInput mode="outlined" label="Título" value={titulo} onChangeText={setTitulo} error={ver('titulo')} />
        <HelperText type="error" visible={ver('titulo')}>{errores.titulo}</HelperText>

        <TextInput
          mode="outlined"
          label="Descripción"
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          numberOfLines={4}
          error={ver('descripcion')}
        />
        <HelperText type="error" visible={ver('descripcion')}>{errores.descripcion}</HelperText>

        <Text variant="labelLarge" style={{ marginBottom: 8 }}>Tipo de recurso</Text>
        <View style={styles.chips}>
          {TIPOS_RECURSO.map((t) => (
            <Chip key={t} selected={tipo === t} showSelectedOverlay onPress={() => setTipo(t)}>{t}</Chip>
          ))}
        </View>
        <TextInput mode="outlined" label="Otro tipo (opcional)" value={tipo} onChangeText={setTipo} error={ver('tipo')} />
        <HelperText type="error" visible={ver('tipo')}>{errores.tipo}</HelperText>

        <TextInput
          mode="outlined"
          label="Enlace al recurso"
          value={enlace}
          onChangeText={setEnlace}
          autoCapitalize="none"
          keyboardType="url"
          error={ver('enlace')}
        />
        <HelperText type="error" visible={ver('enlace')}>{errores.enlace}</HelperText>

        <TextInput
          mode="outlined"
          label="URL de la imagen"
          value={imagen}
          onChangeText={setImagen}
          autoCapitalize="none"
          keyboardType="url"
          error={ver('imagen')}
        />
        <HelperText type="error" visible={ver('imagen')}>{errores.imagen}</HelperText>

        <Button mode="contained" onPress={guardar} loading={enviando} disabled={enviando} style={{ marginTop: 16 }}>
          {editando ? 'Guardar cambios' : 'Crear recurso'}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: { padding: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
});
```

### 1️⃣5️⃣ `src/screens/DetalleScreen.tsx`

```tsx
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
```

### 1️⃣6️⃣ `src/navigation/Navegacion.tsx`

```tsx
import React from 'react';
import { ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import ListaRecursos from '../components/ListaRecursos';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DetalleScreen from '../screens/DetalleScreen';
import FormularioScreen from '../screens/FormularioScreen';
import PerfilScreen from '../screens/PerfilScreen';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const icono = (nombre: keyof typeof MaterialCommunityIcons.glyphMap) =>
  ({ color, size }: { color: string; size: number }) =>
    <MaterialCommunityIcons name={nombre} color={color} size={size} />;

// Estudiante: Recursos, Favoritos, Perfil. Docente: Recursos, Gestión, Perfil.
function Principal() {
  const { usuario } = useAuth();
  const esDocente = usuario?.rol === 'Docente';

  return (
    <Tab.Navigator>
      <Tab.Screen name="Recursos" options={{ tabBarIcon: icono('book-open-variant') }}>
        {() => <ListaRecursos modo="todos" />}
      </Tab.Screen>
      {esDocente ? (
        <Tab.Screen name="Gestión" options={{ tabBarIcon: icono('cog-outline') }}>
          {() => <ListaRecursos modo="gestion" />}
        </Tab.Screen>
      ) : (
        <Tab.Screen name="Favoritos" options={{ tabBarIcon: icono('heart') }}>
          {() => <ListaRecursos modo="favoritos" />}
        </Tab.Screen>
      )}
      <Tab.Screen name="Perfil" component={PerfilScreen} options={{ tabBarIcon: icono('account') }} />
    </Tab.Navigator>
  );
}

export default function Navegacion() {
  const { usuario, cargando } = useAuth();
  if (cargando) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {usuario ? (
          <>
            <Stack.Screen name="Principal" component={Principal} options={{ headerShown: false }} />
            <Stack.Screen name="Detalle" component={DetalleScreen} options={{ title: 'Detalle del recurso' }} />
            {usuario.rol === 'Docente' && (
              <Stack.Screen
                name="Formulario"
                component={FormularioScreen}
                options={({ route }) => ({ title: route.params?.recurso ? 'Editar recurso' : 'Nuevo recurso' })}
              />
            )}
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Registro" component={RegisterScreen} options={{ title: 'Crear cuenta' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 1️⃣7️⃣ `App.tsx`

```tsx
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { ToastProvider } from './src/context/ToastContext';
import Navegacion from './src/navigation/Navegacion';

const tema = {
  ...MD3LightTheme,
  colors: { ...MD3LightTheme.colors, primary: '#1565c0', secondary: '#00897b' },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={tema}>
        <ToastProvider>
          <AuthProvider>
            <FavoritesProvider>
              <Navegacion />
              <StatusBar style="auto" />
            </FavoritesProvider>
          </AuthProvider>
        </ToastProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
```

---

## 🚀 Instalación local

1. Clonar el repositorio:
   ```bash
   git clone PEGA_AQUI_LA_URL_DEL_REPOSITORIO
   cd desafio3
   ```

2. Instalar las dependencias:
   ```bash
   npm install
   ```

3. Si se parte de un proyecto nuevo, instalar las librerías del proyecto:
   ```bash
   npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs \
     react-native-screens react-native-safe-area-context react-native-paper \
     @react-native-async-storage/async-storage expo-crypto @expo/vector-icons
   ```

4. Verificar que `API_URL` en `src/config.ts` apunte a la API de mockapi.io.

5. Ejecutar en modo desarrollo:
   ```bash
   npx expo start
   ```

6. Escanear el código QR con la app **Expo Go**, o presionar `a` para abrirlo en el emulador de Android.

## 👤 Cuentas de prueba

La aplicación permite registrarse desde la pantalla de inicio, eligiendo el tipo de cuenta:

- **Docente:** crea, edita y elimina recursos desde la pestaña *Gestión*. 
- **Estudiante:** explora el catálogo, marca favoritos y califica recursos. 

## 👤 Autor

**Joaquín Eduardo Morán Mejía** — Carné: MM230272
Universidad Don Bosco