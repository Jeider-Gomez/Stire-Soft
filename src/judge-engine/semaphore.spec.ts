import { Semaphore } from './semaphore';

describe('Semaphore', () => {
  const tick = () => new Promise((r) => setTimeout(r, 5));

  it('nunca corre más tareas a la vez que el máximo y las demás esperan su turno', async () => {
    const sem = new Semaphore(2);
    let running = 0;
    let peak = 0;
    const task = async () => {
      running++;
      peak = Math.max(peak, running);
      await tick();
      running--;
      return 1;
    };
    const results = await Promise.all(Array.from({ length: 8 }, () => sem.run(task)));
    expect(results).toHaveLength(8);
    expect(peak).toBe(2);
  });

  it('libera el cupo aunque la tarea falle', async () => {
    const sem = new Semaphore(1);
    await expect(sem.run(async () => { throw new Error('x'); })).rejects.toThrow('x');
    await expect(sem.run(async () => 'ok')).resolves.toBe('ok');
  });

  it('atiende en orden de llegada', async () => {
    const sem = new Semaphore(1);
    const order: number[] = [];
    await Promise.all([1, 2, 3].map((n) => sem.run(async () => { await tick(); order.push(n); })));
    expect(order).toEqual([1, 2, 3]);
  });
});
