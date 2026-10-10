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
