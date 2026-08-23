# API reference

Base URL `http://localhost:8000/api`. Interactive docs at `/docs`.

Authentication is a Clerk session JWT in `Authorization: Bearer <token>`.
When `CLERK_ISSUER` is unset, every request runs as a development user and the
header is ignored.

## Health

### `GET /health`
Reports which integrations are wired, which is the quickest way to tell whether
a machine is configured.

```json
{ "status": "ok", "environment": "development", "auth": false,
  "storage": false, "ai_provider": "rule-based" }
```

## Documents

### `GET /documents`
Every document for the signed-in user. Seeds the four sample notices into a
brand new account, so the app is never an empty shell on first open.

Returns an array in exactly the shape of the frontend `SahayakDocument`:

```json
[{
  "id": "pension", "cat": "pension", "status": "action", "seeded": true,
  "title":  { "en": "Pension Renewal Notice", "hi": "...", "te": "..." },
  "issuer": { "en": "...", "hi": "...", "te": "..." },
  "refNo": "PDA/RNW/2026/44871",
  "received": "2026-08-02", "deadline": "2026-09-30",
  "what": {...}, "why": {...}, "where": {...}, "ifNot": {...}, "explain": {...},
  "steps": [{ "en": "...", "hi": "...", "te": "..." }],
  "need":  [{ "en": "...", "hi": "...", "te": "..." }],
  "needDone": [false, false],
  "gov": { "what": "...", "why": "...", "doIt": "...", "where": "..." },
  "original": "OFFICE OF THE PENSION DISBURSING AUTHORITY\n...",
  "pairs": [{ "gov": "...", "simple": { "en": "...", "hi": "...", "te": "..." } }],
  "elig": { "minAge": 60, "work": ["retired"], "note": {...} }
}]
```

`gov` and `original` are plain strings, not trilingual: that is the wording
printed on the paper, and it is what the reader must quote at the counter.

### `GET /documents/{slug}`
One document. 404 if it is not this user's.

### `POST /documents/analyze`
```json
{ "sampleId": "pension" }
```
Adds a bundled demo notice. `pension` is not pre-seeded because it is the one
you "receive" through the scan flow. Passing a `fileId` is where a real OCR and
model pipeline would run; until that is connected the request falls back to a
sample, clearly flagged, rather than pretending an analysis happened.

### `DELETE /documents/{slug}` · `DELETE /documents`
Remove one, or clear all. Both return `204`.

### `GET /documents/checklists`
```json
{ "pension": { "steps": { "0": true }, "need": {} } }
```

### `PATCH /documents/checklists`
```json
{ "documentId": "pension", "kind": "steps", "index": 0, "done": true }
```
Returns the whole updated map. The frontend applies this optimistically.

### `PATCH /documents/reminders`
```json
{ "documentId": "pension", "enabled": true }
```

## Assistant

### `POST /assistant/ask`
```json
{ "question": "Which papers do I need?", "lang": "en",
  "documentId": "pension", "modelId": "anthropic" }
```
```json
{ "text": "You need these papers:",
  "list": ["Aadhaar card", "Bank passbook"],
  "docRefs": null, "setLang": null }
```

`list` is a bullet list, already localised. `docRefs` carries document ids when
the answer refers to documents, which the UI renders as tappable cards.
`setLang` is set when the reader asked to be answered in another language, and
the app switches to it.

`modelId` is optional; without it the configured default is used. An
unavailable or failing provider falls back to the rule-based engine rather than
erroring.

### `POST /assistant/eligibility`
```json
{ "documentId": "pension", "lang": "en",
  "profile": { "age": "67", "state": "", "income": "i1", "work": "retired" } }
```
```json
{ "verdict": "likely",
  "reasons": [{ "k": "ok", "t": "Your age is 67. The document asks for 60 years or more." }],
  "note": "Confirm at the office named in your document." }
```

`verdict` is `likely`, `maybe` or `no`. Anything unanswered yields `maybe` with
an `unknown` reason naming the condition that could not be checked. This is
never an official decision and the copy says so.

## Files

### `POST /files` (multipart)
`file`, plus optional `original_size_bytes` and `document_id`.

Bytes arrive **already compressed by the browser**; `original_size_bytes` is
what the file weighed before that, which is what makes the savings reportable.

### `GET /files` · `DELETE /files/{id}`

## Settings

### `GET /settings` · `PATCH /settings`
```json
{ "language": "te", "textSize": "large", "readAloud": false,
  "autoShrink": true, "displayName": "" }
```

## Other

- `GET /users/me`
- `GET /ai-models` — the catalogue with an `isAvailable` flag per provider
- `GET|POST /chats`, `GET|DELETE /chats/{id}`, `GET /chats/{id}/messages`
- `GET|POST /projects`, `DELETE /projects/{id}`

## Errors

FastAPI's standard shape:

```json
{ "detail": "Document not found" }
```

`401` missing or invalid session · `404` not found or not yours · `422`
validation. The frontend surfaces these through `ApiRequestError`.
