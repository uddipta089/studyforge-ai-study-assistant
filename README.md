# StudyForge — AI Study Assistant

A responsive React application that transforms free-form notes or topics into **interactive flashcards and a scored multiple-choice quiz**. It is an implementation of the **Study assistant** option in the Frontend Internship Assignment.

## Features

- Paste notes or describe a topic; generate a validated study set from the **real Gemini API**.
- Flip flashcards, navigate back/forward, and mark cards as known.
- Answer multiple-choice questions with instant feedback, see final results, and **retest only missed questions**.
- Clear **loading, empty, success, and error** states; cancel or retry generation.
- Reject malformed JSON, wrong-shaped data, empty output, and invalid question options without crashing.
- Avoid stale responses overwriting newer results through `AbortController` and a monotonically increasing request ID.
- API key is stored **server-side** (never in the React bundle).
- Responsive layout for desktop and mobile; accessible button labels, progress indicators, and keyboard-focus styles.
- An explicitly marked **sample deck** works even without an API key, for evaluating UI interactions.

## Requirements

- Node.js **20+** (Node 22 recommended)
- A free or paid **Gemini API key** from [Google AI Studio](https://aistudio.google.com/app/apikey) for live generation.

## Setup and running

```bash
npm install
cp .env.example .env
```

Edit `.env` and replace `replace_with_your_key` with a **new, private** Gemini API key. The included `.env.example` uses `gemini-3.8-flash` as a suggested starting model; availability, free-tier access and capacity vary by account. Confirm your model in [Gemini models documentation](https://ai.google.dev/gemini-api/docs/models). If your account supports another model, change `GEMINI_MODEL` in `.env`. Do not put a real key in `.env.example` or GitHub. If a key appeared in a screenshot or commit, revoke it and create a new one.

**Windows PowerShell:** if `npm` is blocked by execution policy, use `npm.cmd install` and `npm.cmd start`. To create the env file, use `Copy-Item .env.example .env` instead of `cp` if preferred.

```bash
npm start
```

- Open **http://localhost:5173**.
- Vite serves the frontend and proxies `/api/*` to Express on port **3001**.
- Paste notes (15–12,000 characters) and select **Generate study set**.
- Or select **Explore sample deck** to test flashcards and quizzes without an API key.

Other commands:

```bash
npm test        # schema validation tests
npm run build  # production frontend build
npm run dev    # frontend only (API must be running separately)
npm run server # backend only
```

For hosting, deploy the Vite `dist/` as a static site and deploy the Express API separately, proxying `/api` to it. Do not put `GEMINI_API_KEY` in client environment variables or commit `.env`.

## Implementation and reliability decisions

1. **Structured data, not chat:** the model is instructed to return JSON with `title`, `summary`, `flashcards[]`, and `questions[]`. React renders the returned data as stateful components, not a chatbot transcript.
2. **Validation boundary:** `server/schema.js` uses explicit runtime checks to validate the exact expected shape, minimum card counts, distinct choices, and a zero-based answer index. It strips harmless extra keys, removes optional markdown fences, and rejects unusable data.
3. **Graceful errors:** no API key (503), bad input (400), rate-limit (429), invalid model output (502), Gemini 503 overload (502 after up to 2 retries), other upstream failure (502), and timeout (504) all return sanitized JSON errors. The UI shows a retry path and retains any previously generated deck.
4. **Cancellation and races:** the frontend aborts a prior request when a new generation begins, when loading a sample, when starting over, or on unmount. A unique request ID also prevents late responses from overwriting more recent ones. The backend has a 25-second overall upstream deadline (including up to two 503 retries, after 700 ms and 1,400 ms); the frontend allows 30 seconds. Retries do not apply to invalid requests, quota errors, or bad credentials.
5. **Simple composable state:** app-level state manages generation, the deck and the selected mode. `Flashcards` manages flip/known state. `Quiz` manages selections, scoring, and missed-question retests. When a new deck arrives, these components reset their local state.

## Test failure cases

- Disconnect the network or enter an invalid API key → readable error; no crash.
- Remove `GEMINI_API_KEY` → config error and working sample mode.
- Generate a second request before the first finishes (or cancel) → previous response cannot overwrite the new result.
- Unit tests in `tests/schema.test.js` cover malformed JSON, empty responses, missing arrays, invalid answer indexes, duplicate choices, and valid fenced JSON. `tests/gemini.test.js` covers bounded 503 retries, non-retryable errors, and cancellation without contacting Gemini.

## Known limitations / next steps

- AI content may contain factual mistakes even when JSON is structurally valid; users should double-check important material.
- No authentication, database, sharing, or persisted study history.
- Quiz assumes one correct answer and four options per question; no difficulty settings or spaced repetition algorithm.
- **Live Gemini generation has not been verified end to end.** During local testing the API returned HTTP 503. The app now retries twice with backoff and shows a safe error if overload persists; this cannot guarantee Gemini will respond.
- Provider-specific capacity, free-tier access, rate limits, and model availability vary. You may need to update `GEMINI_MODEL` in `.env` and retry after overload subsides.
- Future improvements: saved sessions, true spaced-repetition scheduling, automated accessibility tests, and streaming validation.

## AI usage note

ChatGPT was used to help draft the initial React components, UI styles, server integration, schema validation and tests. **Review, run, customize, and understand the code before submitting; accurately describe what you personally changed.** The assignment permits AI assistance but requires that you can explain your implementation live.

## Time spent

**Action required before submission:** replace this text with your real time log (for example, planning: __ min; implementing and adapting: __ min; testing/debugging: __ min; documentation: __ min; total: __ hours). Do not invent time. The assignment asks that actual work stay within 8 hours.

## Submission checklist

- [ ] Run `npm install`, `npm test`, and `npm run build`.
- [ ] Use a NEW Gemini key (revoke any previously exposed key), configure `.env`, and verify a live generation (still pending due to 503).
- [ ] Try the flashcards, quiz, missed-question retest, error, cancel, and mobile layouts.
- [ ] Make a few meaningful commits to **your** repository.
- [ ] Record a short demo of the working application.
- [ ] Update the AI usage note to accurately describe your personal changes; fill in your actual time spent (required before submission).
- [ ] Share the GitHub repository and local setup instructions.

## Troubleshooting Gemini failures

- Start the full app with `npm.cmd start` (Windows PowerShell) or `npm start` and check `http://localhost:3001/api/health`: `configured: true` only confirms the key is loaded, **not** that the key works.
- `503` means Gemini is unavailable or overloaded. StudyForge will retry at most two times (three total attempts). If the error persists, try again later or consult Gemini's current model availability. Repeated 503 is **not proof** of a bad key.
- `404` means the configured model may be unavailable to your account. Use a model listed for your key/project; update `.env`, then restart.
- `429` may mean rate limit or quota exhaustion; don't repeatedly retry automatically.
- `401`/`403` typically means an authentication or permissions problem; verify the key and project. Never paste keys into support messages.
- The application needs the **backend**, not just Vite; `npm run dev` starts only the frontend.

References: [Gemini API errors](https://ai.google.dev/gemini-api/docs/api-errors) · [Gemini models](https://ai.google.dev/gemini-api/docs/models).
