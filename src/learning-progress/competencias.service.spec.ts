import { CompetenciasService } from './competencias.service';
import { SubmissionStatus } from '../common/enums/submission-status.enum';

describe('CompetenciasService: qué intentos cuentan', () => {
  it('solo las entregas calificadas: una que espera al juez no cuenta como fallada', async () => {
    const query = jest.fn().mockResolvedValue([]);
    const service = new CompetenciasService({ query } as never, {} as never);
    const intentosDe = (service as unknown as { intentosDe: (s: number[], a: number[]) => Promise<unknown> }).intentosDe.bind(service);
    await intentosDe([7], [1, 2]);
    const [sql, params] = query.mock.calls[0] as [string, unknown[]];
    expect(sql).toContain('s.status = ?');
    expect(params).toEqual([[7], [1, 2], SubmissionStatus.GRADED]);
  });
});
