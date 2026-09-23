import { StudentQuestionDto } from './student-question.dto';
import { QuestionType } from '../../common/enums/question-type.enum';
import { ActivityQuestion } from '../entities/activity-question.entity';

function makeQuestion(type: QuestionType, config: any): ActivityQuestion {
  return { id: 1, activityId: 1, type, question: 'q', points: 10, order: 0, config } as any;
}

// Regresión de P0-03: un estudiante nunca debe poder reconstruir la
// respuesta correcta a partir de lo que el endpoint le sirve — ni por un
// campo explícito, ni por el orden en que llegan los elementos.
describe('StudentQuestionDto.fromEntity', () => {
  it('MCQ: quita correctAnswerId y explanation', () => {
    const q = makeQuestion(QuestionType.MCQ, {
      options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }],
      correctAnswerId: 'b',
      explanation: 'porque b es la correcta',
    });
    const dto = StudentQuestionDto.fromEntity(q);
    expect(dto.config).not.toHaveProperty('correctAnswerId');
    expect(dto.config).not.toHaveProperty('explanation');
    expect(dto.config.options).toEqual(q.config.options);
  });

  it('CODING: quita hiddenTestCases y filtra testCases a solo isPublic===true', () => {
    const q = makeQuestion(QuestionType.CODING, {
      language: 'javascript',
      hiddenTestCases: [{ input: '1', expected: '1', weight: 50 }],
      testCases: [
        { label: 'pub', input: '1', expected: '1', isPublic: true },
        { label: 'oculto-sin-flag', input: '2', expected: '2' },
        { label: 'oculto-explicito', input: '3', expected: '3', isPublic: false },
      ],
    });
    const dto = StudentQuestionDto.fromEntity(q);
    expect(dto.config).not.toHaveProperty('hiddenTestCases');
    expect(dto.config.testCases).toHaveLength(1);
    expect(dto.config.testCases[0].label).toBe('pub');
  });

  it('CODING: informa CUÁNTOS casos hay ocultos y el límite de tiempo, sin exponer su contenido', () => {
    const q = makeQuestion(QuestionType.CODING, {
      language: 'javascript',
      hiddenTestCases: [{ input: 'SECRETO', expected: 'SECRETO' }],
      testCases: [
        { input: '1', expected: '1', isPublic: true },
        { input: '2', expected: '2' },
        { input: '3', expected: '3', isPublic: false },
      ],
    });
    const dto = StudentQuestionDto.fromEntity(q);
    expect(dto.config.hiddenTestCaseCount).toBe(3);
    expect(dto.config.timeLimitMs).toBe(2000);
    expect(JSON.stringify(dto.config)).not.toContain('SECRETO');
  });

  it('FILL_CODE: quita answer de cada blank, conserva id', () => {
    const q = makeQuestion(QuestionType.FILL_CODE, {
      codeTemplate: 'for i in ___:',
      blanks: [{ id: 'b1', answer: 'range(10)', regexMode: false }],
    });
    const dto = StudentQuestionDto.fromEntity(q);
    expect(dto.config.blanks[0]).not.toHaveProperty('answer');
    expect(dto.config.blanks[0].id).toBe('b1');
  });

  it('DRAG_DROP: quita mappings y baraja items/targets sin perder ningún id', () => {
    const items = Array.from({ length: 8 }, (_, i) => ({ id: `i${i}`, content: `item${i}` }));
    const targets = Array.from({ length: 8 }, (_, i) => ({ id: `t${i}`, label: `target${i}` }));
    const q = makeQuestion(QuestionType.DRAG_DROP, {
      items,
      targets,
      mappings: { i0: 't0', i1: 't1' },
    });
    const dto = StudentQuestionDto.fromEntity(q);
    expect(dto.config).not.toHaveProperty('mappings');
    expect(dto.config.items.map((i: any) => i.id).sort()).toEqual(items.map((i) => i.id).sort());
    expect(dto.config.targets.map((t: any) => t.id).sort()).toEqual(targets.map((t) => t.id).sort());
  });

  it('MATCHING: quita pairs y baraja rightColumn sin perder ningún id', () => {
    const leftColumn = [{ id: 'l0', content: 'L0' }, { id: 'l1', content: 'L1' }];
    const rightColumn = Array.from({ length: 8 }, (_, i) => ({ id: `r${i}`, content: `R${i}` }));
    const q = makeQuestion(QuestionType.MATCHING, {
      leftColumn,
      rightColumn,
      pairs: { l0: 'r0', l1: 'r1' },
    });
    const dto = StudentQuestionDto.fromEntity(q);
    expect(dto.config).not.toHaveProperty('pairs');
    expect(dto.config.rightColumn.map((r: any) => r.id).sort()).toEqual(
      rightColumn.map((r) => r.id).sort(),
    );
  });

  it('ORDERING: quita correctOrder y baraja blocks sin perder ningún id', () => {
    const blocks = Array.from({ length: 8 }, (_, i) => ({ id: `b${i}`, content: `B${i}` }));
    const q = makeQuestion(QuestionType.ORDERING, {
      blocks,
      correctOrder: blocks.map((b) => b.id),
    });
    const dto = StudentQuestionDto.fromEntity(q);
    expect(dto.config).not.toHaveProperty('correctOrder');
    expect(dto.config.blocks.map((b: any) => b.id).sort()).toEqual(blocks.map((b) => b.id).sort());
  });

  it('DRAG_DROP/MATCHING/ORDERING: el barajado realmente cambia el orden (no es un no-op)', () => {
    // Prueba estadística: con 12 elementos, la probabilidad de que un
    // shuffle real produzca el mismo orden es ~1/12! — si falla alguna vez
    // por mala suerte, es indicativo real de que shuffle() no baraja.
    const blocks = Array.from({ length: 12 }, (_, i) => ({ id: `b${i}` }));
    const q = makeQuestion(QuestionType.ORDERING, { blocks, correctOrder: blocks.map((b) => b.id) });
    const dto = StudentQuestionDto.fromEntity(q);
    const originalOrder = blocks.map((b) => b.id).join(',');
    const shuffledOrder = dto.config.blocks.map((b: any) => b.id).join(',');
    expect(shuffledOrder).not.toBe(originalOrder);
  });
});
