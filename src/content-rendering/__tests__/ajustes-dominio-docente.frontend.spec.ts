import { readFileSync } from 'fs';
import * as path from 'path';

// 09/10, Jeider: «estos cambios no tienen que entorpecer el trabajo del docente; que pueda seguir decidiendo lo que pesa
// más». En Ajustes → Avance: cada cuántas horas se reabre un intento (1 a 168, nunca cerrado) y si los niveles pesan más.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');

describe('el docente ajusta las reglas del dominio de su clase', () => {
  const v = leer('components', 'docente', 'ajustes', 'SeccionAvance.vue');

  it('horas para reabrir de 1 a 168, explicando que nunca se cierra para siempre', () => {
    expect(v).toContain('id="horas-reabrir"');
    expect(v).toContain('min="1" max="168"');
    expect(v).toContain('Nunca se cierra para siempre');
    expect(v).toContain('if (!Number.isFinite(h) || h < 1 || h > 168)');
  });

  it('los niveles altos pesan más es opcional, y aclara que el peso de cada ejercicio lo elige al crearlo', () => {
    expect(v).toContain('v-model="niveles" type="checkbox"');
    expect(v).toContain('El peso de cada ejercicio (práctica, examen…) se elige al crearlo');
  });

  it('se guarda con los nombres del servidor', () => {
    expect(leer('composables', 'useAjustesClase.ts')).toContain('async function guardarReglasDominio(r: { horasParaReabrir: number; nivelesPesanDistinto: boolean })');
    expect(v).toContain('props.ajustes.guardarReglasDominio({ horasParaReabrir: h, nivelesPesanDistinto: niveles.value })');
  });
});
