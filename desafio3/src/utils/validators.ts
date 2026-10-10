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
