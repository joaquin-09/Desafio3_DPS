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
