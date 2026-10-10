export type Rol = 'Estudiante' | 'Docente';

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  password: string;
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
