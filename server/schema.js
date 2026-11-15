// Explicit runtime validation at the trust boundary: never render untrusted AI output as-is.
function validText(value, min, max) {
  return typeof value === 'string' && value.trim().length >= min && value.trim().length <= max;
}
function fail(path) { throw new Error(`The AI returned incomplete study material (${path}). Try again.`); }

export function parseStudySet(raw) {
  if (typeof raw !== 'string' || !raw.trim()) throw new Error('The AI returned an empty response. Please retry.');
  let text = raw.trim().replace(/^\uFEFF/, '');
  if (text.startsWith('```')) text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('The AI returned malformed JSON. Please try generating again.'); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) fail('root');
  if (!validText(data.title, 3, 100)) fail('title');
  if (!validText(data.summary, 10, 500)) fail('summary');
  if (!Array.isArray(data.flashcards) || data.flashcards.length < 3 || data.flashcards.length > 12) fail('flashcards');
  if (!Array.isArray(data.questions) || data.questions.length < 3 || data.questions.length > 10) fail('questions');
  const flashcards = data.flashcards.map((card, index) => {
    if (!card || !validText(card.front, 3, 600) || !validText(card.back, 3, 600)) fail(`flashcards.${index}`);
    return { front: card.front.trim(), back: card.back.trim() };
  });
  const questions = data.questions.map((q, index) => {
    if (!q || !validText(q.question, 3, 600) || !validText(q.explanation, 3, 600)) fail(`questions.${index}`);
    if (!Array.isArray(q.options) || q.options.length !== 4 || !q.options.every((s) => validText(s, 1, 300))) fail(`questions.${index}.options`);
    if (new Set(q.options.map((s) => s.trim().toLowerCase())).size !== 4) fail(`questions.${index}.options`);
    if (!Number.isInteger(q.answerIndex) || q.answerIndex < 0 || q.answerIndex > 3) fail(`questions.${index}.answerIndex`);
    return { question: q.question.trim(), options: q.options.map((s) => s.trim()), answerIndex: q.answerIndex, explanation: q.explanation.trim() };
  });
  return { title: data.title.trim(), summary: data.summary.trim(), flashcards, questions };
}
