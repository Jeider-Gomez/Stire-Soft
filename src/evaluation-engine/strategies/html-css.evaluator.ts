import { IEvaluatorStrategy, EvaluationResult } from '../interfaces/evaluator-strategy.interface';
import { HtmlCssConfig } from '../../activity-questions/interfaces/question-configs.interface';
import { evaluateRules, inputSizeError } from '../html-css/html-css.checker';

/**
 * Califica una pregunta `html_css` por reglas (Fase 25, ADR 13). Nota proporcional al PESO de las reglas cumplidas
 * (públicas y ocultas) sobre los puntos de la pregunta. `isCorrect` solo si se cumplen todas.
 */
export class HtmlCssEvaluator implements IEvaluatorStrategy {
  evaluate(studentAnswer: { html?: unknown; css?: unknown }, config: HtmlCssConfig, maxPoints: number): EvaluationResult {
    if (!studentAnswer || typeof studentAnswer.html !== 'string' || !studentAnswer.html.trim()) {
      return { isCorrect: false, score: 0, feedback: 'No se envió el HTML.' };
    }
    const css = studentAnswer.css === undefined ? '' : studentAnswer.css;
    const tooBig = inputSizeError(studentAnswer.html, css);
    if (tooBig) return { isCorrect: false, score: 0, feedback: tooBig };
    // inputSizeError ya comprobó que ambos son texto.
    const cssText = typeof css === 'string' ? css : '';

    const rules = config.rules;
    const outcomes = evaluateRules(studentAnswer.html, cssText, rules);

    const totalWeight = rules.reduce((sum, rule) => sum + rule.weight, 0);
    const passedWeight = rules.reduce((sum, rule, i) => sum + (outcomes[i].passed ? rule.weight : 0), 0);
    const passedCount = outcomes.filter((o) => o.passed).length;
    const score = totalWeight > 0 ? Math.round((passedWeight / totalWeight) * maxPoints) : 0;
    const isCorrect = passedCount === rules.length;

    if (isCorrect) return { isCorrect: true, score: maxPoints, feedback: '¡Cumpliste todas las reglas!' };

    // El feedback se guarda con el saneado PLAIN (ADR 07), que codificaría «<» y «>» como entidades: se quitan de las
    // etiquetas para que el estudiante lea «Hay un h1…» y no «Hay un &lt;h1&gt;…».
    const plain = (text: string) => text.replace(/[<>]/g, '').replace(/&/g, 'y');
    const failedPublic = rules.filter((rule, i) => rule.isPublic && !outcomes[i].passed).map((rule) => `• ${plain(rule.label)}`);
    const failedHidden = rules.filter((rule, i) => !rule.isPublic && !outcomes[i].passed).length;

    const lines = [`Cumpliste ${passedCount} de ${rules.length} reglas.`];
    if (failedPublic.length > 0) lines.push(`Revisa: ${failedPublic.join(' ')}`);
    if (failedHidden > 0) lines.push(`${failedHidden} regla(s) oculta(s) no se cumplieron.`);
    return { isCorrect: false, score, feedback: lines.join(' ') };
  }
}
