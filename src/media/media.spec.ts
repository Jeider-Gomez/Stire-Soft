import 'reflect-metadata';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { detectarTipoImagen, ImagenRechazadaError, MAX_BYTES_IMAGEN, MAX_BYTES_POR_DOCENTE, validarImagen } from './imagen-subida';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { IS_PUBLIC_KEY } from '../auth/decorators/public.decorator';
import { User, UserRole } from '../user/entities/user.entity';

// Imágenes de las lecciones (paso 6): 1 MB cada una, 50 MB por docente, tipo decidido por los bytes del archivo.
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(100)]);
const JPG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(100)]);
const GIF = Buffer.concat([Buffer.from('GIF89a', 'latin1'), Buffer.alloc(100)]);
const WEBP = Buffer.concat([Buffer.from('RIFF', 'latin1'), Buffer.alloc(4), Buffer.from('WEBP', 'latin1'), Buffer.alloc(100)]);

describe('detectarTipoImagen / validarImagen', () => {
  it('reconoce PNG, JPG, GIF y WebP por su firma', () => {
    expect([PNG, JPG, GIF, WEBP].map(detectarTipoImagen)).toEqual(['image/png', 'image/jpeg', 'image/gif', 'image/webp']);
  });

  it('un HTML o un SVG con nombre de imagen no es una imagen (el SVG puede llevar scripts)', () => {
    expect(detectarTipoImagen(Buffer.from('<html><script>alert(1)</script></html>'))).toBeNull();
    expect(detectarTipoImagen(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script/></svg>'))).toBeNull();
  });

  it('más de 1 MB, vacío o por encima de los 50 MB del docente: se rechaza con el motivo', () => {
    expect(() => validarImagen(Buffer.concat([PNG, Buffer.alloc(MAX_BYTES_IMAGEN)]), 0)).toThrow('1 MB');
    expect(() => validarImagen(Buffer.alloc(0), 0)).toThrow(ImagenRechazadaError);
    expect(() => validarImagen(PNG, MAX_BYTES_POR_DOCENTE - 10)).toThrow('50 MB');
    expect(validarImagen(PNG, 0)).toBe('image/png');
  });
});

describe('MediaService', () => {
  type Deps = ConstructorParameters<typeof MediaService>;
  const docente = { id: 9, role: UserRole.DOCENTE } as User;

  function crear(opciones: { usado?: number; archivo?: object | null } = {}) {
    const qb = {
      select: () => qb, addSelect: () => qb, where: () => qb,
      getRawOne: () => Promise.resolve({ total: opciones.usado ?? 0 }),
      getOne: () => Promise.resolve(opciones.archivo ?? null),
    };
    const repo = {
      createQueryBuilder: () => qb,
      insert: jest.fn(() => Promise.resolve()),
      findOne: jest.fn(() => Promise.resolve(opciones.archivo ?? null)),
      delete: jest.fn(() => Promise.resolve()),
    };
    return { service: new MediaService(repo as unknown as Deps[0]), repo };
  }

  it('guarda la imagen con un id UUID y el tipo real, y devuelve su ruta', async () => {
    const { service, repo } = crear();
    const r = await service.subirImagen(docente, JPG);
    expect(r.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(r).toMatchObject({ path: `/media/${r.id}`, mimeType: 'image/jpeg', sizeBytes: JPG.length });
    expect(repo.insert).toHaveBeenCalledWith(expect.objectContaining({ ownerId: 9, mimeType: 'image/jpeg' }));
  });

  it('un archivo que no es imagen o que pasa la cuota es un 400 y no se guarda', async () => {
    const { service, repo } = crear({ usado: MAX_BYTES_POR_DOCENTE });
    await expect(service.subirImagen(docente, PNG)).rejects.toThrow(BadRequestException);
    await expect(crear().service.subirImagen(docente, Buffer.from('hola mundo, no soy imagen'))).rejects.toThrow('Solo se aceptan');
    await expect(crear().service.subirImagen(docente, undefined)).rejects.toThrow('Adjunta una imagen');
    expect(repo.insert).not.toHaveBeenCalled();
  });

  it('un id que no es UUID ni se busca (404)', async () => {
    const { service } = crear();
    await expect(service.obtener('1 OR 1=1')).rejects.toThrow(NotFoundException);
  });

  it('solo su dueño (o un admin) borra una imagen', async () => {
    const archivo = { id: '0f8fad5b-d9cb-469f-a165-70867728950e', ownerId: 3 };
    await expect(crear({ archivo }).service.eliminar(docente, archivo.id)).rejects.toThrow(ForbiddenException);
    const { service, repo } = crear({ archivo });
    await service.eliminar({ id: 1, role: UserRole.ADMIN } as User, archivo.id);
    expect(repo.delete).toHaveBeenCalled();
  });
});

describe('MediaController: rutas', () => {
  it('subir, ver la cuota y borrar: solo docente y admin', () => {
    for (const metodo of ['subir', 'cuota', 'eliminar'] as const) {
      expect(Reflect.getMetadata('roles', MediaController.prototype[metodo])).toEqual(['docente', 'admin']);
    }
  });

  it('ver una imagen es público (la pide una etiqueta <img>) y se sirve con cabeceras que no ejecutan nada', async () => {
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, MediaController.prototype.ver)).toBe(true);
    const media = { obtener: jest.fn(() => Promise.resolve({ mimeType: 'image/png', data: PNG })) };
    const res = { set: jest.fn(), send: jest.fn() };
    const controller = new MediaController(media as unknown as ConstructorParameters<typeof MediaController>[0]);
    await controller.ver('x', res as unknown as Parameters<MediaController['ver']>[1]);
    const cabeceras = res.set.mock.calls[0][0] as Record<string, string>;
    expect(cabeceras).toMatchObject({
      'Content-Type': 'image/png',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
      'Cross-Origin-Resource-Policy': 'cross-origin',
    });
    expect(res.send).toHaveBeenCalledWith(PNG);
  });
});
