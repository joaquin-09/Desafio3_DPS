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

//Un estudiante solo tiene una calificación por recurso: si vuelve a calificar, se reemplaza
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
