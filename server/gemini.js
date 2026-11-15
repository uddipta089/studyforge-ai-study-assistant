// Retry transient Gemini service overload without retrying bad requests or quota failures.
// Inject fetch/sleep in tests so no API key or network is required.
export async function requestGemini({ url, headers, body, signal, fetchFn = fetch, sleep = delay }) {
  const backoffs = [700, 1400]; // max 3 attempts (original + 2 retries)
  for (let attempt = 0; ; attempt += 1) {
    const response = await fetchFn(url, { method: 'POST', headers, body, signal });
    if (response.status !== 503 || attempt >= backoffs.length) return response;
    console.warn(`Gemini temporarily unavailable (503); retry ${attempt + 1}/${backoffs.length}`);
    await sleep(backoffs[attempt], signal);
  }
}

export function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
    const timer = setTimeout(done, ms);
    function done() { cleanup(); resolve(); }
    function abort() { clearTimeout(timer); cleanup(); reject(signal.reason ?? new DOMException('Aborted', 'AbortError')); }
    function cleanup() { signal?.removeEventListener('abort', abort); }
    signal?.addEventListener('abort', abort, { once: true });
  });
}
