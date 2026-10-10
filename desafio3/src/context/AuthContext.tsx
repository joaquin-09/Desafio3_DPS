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
