import test from 'node:test';
import assert from 'node:assert/strict';
import { parseStudySet } from '../server/schema.js';

const good = {
  title: 'Physics fundamentals', summary: 'A compact review of introductory physics concepts.',
  flashcards: Array.from({ length: 3 }, (_, i) => ({ front: `What is concept ${i}?`, back: `A definition of concept ${i}.` })),
  questions: Array.from({ length: 3 }, (_, i) => ({ question: `Which answer is right for question ${i}?`, options: ['Alpha', 'Beta', 'Gamma', 'Delta'], answerIndex: i % 4, explanation: 'This is why the correct answer is correct.' })),
};
test('accepts correctly structured material', () => assert.deepEqual(parseStudySet(JSON.stringify(good)), good));
test('accepts JSON wrapped in code fences', () => assert.deepEqual(parseStudySet('```json\n' + JSON.stringify(good) + '\n```'), good));
test('rejects empty content', () => assert.throws(() => parseStudySet(''), /empty response/));
test('rejects malformed JSON', () => assert.throws(() => parseStudySet('{"title":'), /malformed JSON/));
test('rejects missing quiz content', () => assert.throws(() => parseStudySet(JSON.stringify({ ...good, questions: [] })), /incomplete/));
test('rejects out-of-range correct choice', () => assert.throws(() => parseStudySet(JSON.stringify({ ...good, questions: [{ ...good.questions[0], answerIndex: 4 }, ...good.questions.slice(1)] })), /incomplete/));
test('rejects identical options', () => assert.throws(() => parseStudySet(JSON.stringify({ ...good, questions: [{ ...good.questions[0], options: ['A', 'A', 'C', 'D'] }, ...good.questions.slice(1)] })), /incomplete/));
