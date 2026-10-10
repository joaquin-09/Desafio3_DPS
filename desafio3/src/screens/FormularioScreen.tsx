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
