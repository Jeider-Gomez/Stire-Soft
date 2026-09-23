import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { JoinClassDto } from './join-class.dto';

const errorsFor = async (plain: object) =>
  (await validate(plainToInstance(JoinClassDto, plain))).flatMap((e) => Object.keys(e.constraints ?? {}));

// Regresión de la simulación del 23/09: `POST /enrollment/join` sin `code`
// (o con otra clave, p. ej. `classCode`) llegaba al servicio como undefined y
// TypeORM devolvía la primera clase de la tabla — el estudiante quedaba
// matriculado sin conocer ningún código.
describe('JoinClassDto', () => {
  it('acepta un código de texto', async () => {
    expect(await errorsFor({ code: 'DEMO-STIRE-01' })).toEqual([]);
  });

  it('rechaza cuerpo sin code, code vacío, no-texto o demasiado largo', async () => {
    expect(await errorsFor({})).not.toEqual([]);
    expect(await errorsFor({ classCode: 'DEMO-STIRE-01' })).not.toEqual([]);
    expect(await errorsFor({ code: '' })).not.toEqual([]);
    expect(await errorsFor({ code: 123 })).not.toEqual([]);
    expect(await errorsFor({ code: 'x'.repeat(51) })).not.toEqual([]);
  });
});
