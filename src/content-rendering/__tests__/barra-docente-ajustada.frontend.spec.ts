import { readFileSync } from 'fs';
import * as path from 'path';

const barra = readFileSync(path.join(__dirname, '..', '..', '..', 'frontend-nuxt', 'components', 'layout', 'HeaderNav.vue'), 'utf8').replace(
  /\r\n/g,
  '\n',
);

describe('Barra superior del docente en pantallas medianas', () => {
  it('el docente (que tiene además el botón «Asistente») lleva la barra ajustada', () => {
    expect(barra).toContain(`'barra-ajustada': authStore.currentRole === 'docente'`);
  });

  it('por debajo de 1280 px los botones quedan solo con icono, y su nombre sigue para el lector de pantalla', () => {
    const regla = barra.slice(barra.indexOf('@media (max-width: 1279px)'));
    expect(regla).toContain(String.raw`.barra-ajustada :deep(.lg\:not-sr-only), .barra-ajustada .nombre-cuenta`);
    expect(regla).toContain('clip: rect(0, 0, 0, 0)');
    expect(regla).not.toContain('display: none; }\n  .barra-ajustada .nombre-cuenta');
  });
});
