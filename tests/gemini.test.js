import test from 'node:test';
import assert from 'node:assert/strict';
import { requestGemini } from '../server/gemini.js';

const opts = (fetchFn, sleep = async () => {}) => ({ url: 'https://example.test', headers: {}, body: '{}', fetchFn, sleep });

test('retries a 503 and returns the successful response', async () => {
  let n = 0;
  const delays = [];
  const result = await requestGemini(opts(async () => ({ status: ++n === 1 ? 503 : 200 }), async (ms) => delays.push(ms)));
  assert.equal(result.status, 200);
  assert.equal(n, 2);
  assert.deepEqual(delays, [700]);
});

test('stops after three 503 responses', async () => {
  let n = 0;
  const result = await requestGemini(opts(async () => { n++; return { status: 503 }; }));
  assert.equal(result.status, 503);
  assert.equal(n, 3);
});

test('never retries 429, 400, or 404', async () => {
  for (const code of [429, 400, 404]) {
    let n = 0;
    const result = await requestGemini(opts(async () => { n++; return { status: code }; }));
    assert.equal(result.status, code);
    assert.equal(n, 1);
  }
});

test('aborted request cancels before later attempts', async () => {
  const controller = new AbortController();
  let n = 0;
  await assert.rejects(requestGemini({ ...opts(async () => { n++; return { status: 503 }; }, async (_ms, signal) => {
    controller.abort();
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
  }), signal: controller.signal }), { name: 'AbortError' });
  assert.equal(n, 1);
});
