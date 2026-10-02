import { ArgumentsHost, Logger, NotFoundException } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

function host() {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const h = { switchToHttp: () => ({ getResponse: () => ({ status }), getRequest: () => ({ method: 'PATCH', url: '/users/10' }) }) };
  return { h: h as unknown as ArgumentsHost, status, json };
}

describe('HttpExceptionFilter', () => {
  const original = process.env.NODE_ENV;
  afterEach(() => { process.env.NODE_ENV = original; jest.restoreAllMocks(); });

  it('un error desconocido responde 500 sin detalles en producción, pero queda en el registro (antes se perdía)', () => {
    process.env.NODE_ENV = 'production';
    const registro = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const { h, status, json } = host();
    new HttpExceptionFilter().catch(new Error("Field 'rolNuevo' doesn't have a default value"), h);
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Internal server error' }));
    expect(registro).toHaveBeenCalledWith(expect.stringContaining("PATCH /users/10: Field 'rolNuevo'"), expect.any(String));
  });

  it('un error HTTP conocido no se registra como error', () => {
    const registro = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const { h, status } = host();
    new HttpExceptionFilter().catch(new NotFoundException('No está'), h);
    expect(status).toHaveBeenCalledWith(404);
    expect(registro).not.toHaveBeenCalled();
  });
});
