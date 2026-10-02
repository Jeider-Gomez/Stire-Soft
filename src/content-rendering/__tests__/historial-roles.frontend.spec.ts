import { readFileSync } from 'fs';
import * as path from 'path';

const raizNuxt = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');

describe('Administración: pestaña «Cambios de rol»', () => {
  const pagina = readFileSync(path.join(raizNuxt, 'pages', 'admin', 'index.vue'), 'utf8');
  const componente = readFileSync(path.join(raizNuxt, 'components', 'admin', 'HistorialRoles.vue'), 'utf8');

  it('la página del admin tiene la pestaña y muestra el historial dentro de la cadena de pestañas', () => {
    expect(pagina).toContain("@click=\"activeTab = 'roles'\"");
    expect(pagina).toContain("<AdminHistorialRoles v-else-if=\"activeTab === 'roles'\" />");
  });

  it('el historial lee GET /users/cambios-de-rol y dice quién hizo el cambio y por dónde', () => {
    expect(componente).toContain("api.get<CambioDeRol[]>('/users/cambios-de-rol')");
    expect(componente).toContain("c.origen === 'solicitud_docente' ? 'Aprobó la solicitud' : 'Lo cambió'");
  });

  it('las pestañas usan iconos de lucide, no emojis', () => {
    const nav = /<nav[\s\S]*?<\/nav>/.exec(pagina)?.[0] ?? '';
    expect(nav).not.toMatch(/\p{Extended_Pictographic}/u);
    expect(nav).toContain('<History');
  });
});
