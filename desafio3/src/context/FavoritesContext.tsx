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
