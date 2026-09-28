import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BankQueryDto } from './reuse.dto';

// El filtro llega por la URL como texto (?learningUnitId=12): debe convertirse a número y rechazar lo que no lo es.
describe('BankQueryDto', () => {
  it('convierte learningUnitId de la URL a número', async () => {
    const dto = plainToInstance(BankQueryDto, { learningUnitId: '12' });
    expect(await validate(dto)).toHaveLength(0);
    expect(dto.learningUnitId).toBe(12);
  });

  it.each(['abc', '0', '-3'])('rechaza learningUnitId=%p', async (valor) => {
    const dto = plainToInstance(BankQueryDto, { learningUnitId: valor });
    expect((await validate(dto)).length).toBeGreaterThan(0);
  });
});
