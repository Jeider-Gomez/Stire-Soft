import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { TutorController } from './tutor.controller';
import { SaveApiKeyDto } from './dto/api-key.dto';

const USER: any = { id: 11, role: 'estudiante' };

describe('TutorController — historial y clave de Google AI Studio', () => {
  let tutorService: any;
  let credentialService: any;
  let controller: TutorController;

  beforeEach(() => {
    tutorService = { getHistory: jest.fn().mockResolvedValue([]) };
    credentialService = {
      getStatus: jest.fn().mockResolvedValue({ hasKey: true, last4: 'Z9x2' }),
      save: jest.fn().mockResolvedValue({ hasKey: true, last4: 'Z9x2' }),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    controller = new TutorController(tutorService, credentialService);
  });

  it('el historial siempre es el del usuario autenticado y el límite se interpreta como número', async () => {
    await controller.history(USER, '15');
    await controller.history(USER, undefined);
    await controller.history(USER, 'abc');

    expect(tutorService.getHistory).toHaveBeenNthCalledWith(1, 11, 15);
    expect(tutorService.getHistory).toHaveBeenNthCalledWith(2, 11, undefined);
    expect(tutorService.getHistory).toHaveBeenNthCalledWith(3, 11, undefined);
  });

  it('el estado de la clave y su borrado operan solo sobre el usuario autenticado', async () => {
    await expect(controller.apiKeyStatus(USER)).resolves.toEqual({ success: true, hasKey: true, last4: 'Z9x2' });
    await expect(controller.deleteApiKey(USER)).resolves.toEqual({ success: true, hasKey: false, last4: null });
    expect(credentialService.remove).toHaveBeenCalledWith(11);
  });

  it('guardar la clave delega en el servicio con el id del usuario autenticado y nunca devuelve la clave', async () => {
    const dto = Object.assign(new SaveApiKeyDto(), { apiKey: 'AIzaSyFAKE-KEY_1234567890abcdefghijklmnoZ9x2' });

    const res = await controller.saveApiKey(dto, USER);

    expect(credentialService.save).toHaveBeenCalledWith(11, dto.apiKey);
    expect(JSON.stringify(res)).not.toContain(dto.apiKey);
  });
});

describe('SaveApiKeyDto', () => {
  const check = (apiKey: unknown) => validate(plainToInstance(SaveApiKeyDto, { apiKey }));

  it('acepta una clave con formato de Google y recorta espacios', async () => {
    const dto = plainToInstance(SaveApiKeyDto, { apiKey: '  AIzaSyFAKE-KEY_1234567890abcdefghijklmnoZ9x2  ' });
    expect(await validate(dto)).toHaveLength(0);
    expect(dto.apiKey).toBe('AIzaSyFAKE-KEY_1234567890abcdefghijklmnoZ9x2');
  });

  it.each([
    ['muy corta', 'AIza123'],
    ['con espacios internos', 'AIzaSyFAKE KEY 1234567890abcdefghijklmno'],
    ['con caracteres raros', 'AIzaSyFAKE<script>1234567890abcdefghijk'],
    ['vacía', ''],
    ['no es texto', 12345678901234567890],
  ])('rechaza una clave %s', async (_name, value) => {
    expect((await check(value)).length).toBeGreaterThan(0);
  });
});
