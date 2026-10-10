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
