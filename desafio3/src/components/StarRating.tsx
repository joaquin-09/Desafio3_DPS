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
