import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(): T {
  const js = ts.transpileModule(leer('utils', 'fotoPerfil.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}
const u = cargar<{ iniciales: (n: string | null | undefined) => string; urlDeFoto: (b: string, id: string | null | undefined) => string | null; LADO_FOTO: number }>();

describe('Foto de perfil opcional (frontend)', () => {
  it('sin foto se ven las iniciales', () => {
    expect(u.iniciales('Laura Martínez Petro')).toBe('LM');
    expect(u.iniciales('  camila  ')).toBe('C');
    expect(u.iniciales('')).toBe('?');
    expect(u.iniciales(undefined)).toBe('?');
  });

  it('la foto solo se pide a /media/<uuid> de la API; cualquier otro valor no se usa', () => {
    const id = '0b6f4f1e-3c2a-4d5e-9f00-112233445566';
    expect(u.urlDeFoto('https://stire-unicor.duckdns.org/', id)).toBe(`https://stire-unicor.duckdns.org/media/${id}`);
    for (const malo of [null, undefined, '', '../users', 'https://evil.com/x.png']) expect(u.urlDeFoto('https://api', malo)).toBeNull();
  });

  it('se recorta y reduce a 256 px en JPEG antes de subirla', () => {
    expect(u.LADO_FOTO).toBe(256);
    const util = leer('utils', 'fotoPerfil.ts');
    expect(util).toContain("'image/jpeg', 0.85");
    const form = leer('components', 'perfil', 'Form.vue');
    expect(form).toContain("datos.append('archivo', await reducirFoto(archivo), 'foto.jpg')");
    expect(form).toContain("api.put<{ fotoId: string }>('/users/me/foto', datos)");
    expect(form).toContain('(opcional)');
  });

  it('el avatar se usa en la cabecera y en las listas de estudiantes del docente', () => {
    expect(leer('components', 'layout', 'HeaderNav.vue')).toContain('<AvatarUsuario :nombre="authStore.user?.fullName" :foto-id="authStore.user?.fotoId"');
    expect(leer('pages', 'docente', 'clase', '[classId]', 'ajustes.vue')).toContain(':foto-id="enrollment.student?.fotoId"');
    expect(leer('pages', 'docente', 'clase', '[classId]', 'index.vue')).toContain(':foto-id="s.student?.fotoId"');
    expect(leer('components', 'AvatarUsuario.vue')).toContain('@error="fallo = true"');
  });
});
