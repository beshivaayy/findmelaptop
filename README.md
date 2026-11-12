# FindMeLaptop

An AI-assisted laptop recommendation app. Users answer a short questionnaire and receive a shortlist based on their workload, budget, portability priorities, and operating-system preference.

## Stack

- Static frontend: HTML, CSS, and browser JavaScript
- Backend: Vercel Node.js Function at `/api/recommend`
- AI provider: Google Gemini API
- No frontend API key and no client-side secret

## Run locally

1. Install Node.js 20 or later.
2. Clone this repository.
3. Copy `.env.example` to `.env.local`.
4. Set your own Gemini API key in `.env.local`.
5. Run the project with Vercel CLI:

```bash
npm install --global vercel
vercel dev
```

Open the local URL printed by Vercel CLI.

> Do not open `index.html` directly with file://. The app calls the server endpoint at `/api/recommend`, which must be served by Vercel or a compatible local server.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes | Private Gemini API key. Server-side only. |
| `GEMINI_MODEL` | No | Model ID. Defaults to `gemini-3.8-flash`. |

Never use a `NEXT_PUBLIC_` prefix for secrets. Never commit `.env.local`, `.env`, or any file containing real credentials.

## Deploy to Vercel

1. Import this GitHub repository into Vercel.
2. In Project → Settings → Environment Variables, add `GEMINI_API_KEY` with the newly generated key.
3. Add `GEMINI_MODEL` only if you want to override the default model.
4. Apply the variables to Production and Preview as appropriate.
5. Redeploy after adding or changing environment variables.

The Gemini key is read only by the serverless function. The browser calls your own `/api/recommend` endpoint and never receives the key.

## Security notes

- API credentials are never embedded in frontend source.
- The backend validates questionnaire values against fixed allow-lists.
- The backend rejects non-POST methods and unexpected request origins.
- Requests have a 30-second upstream timeout and bounded output-token setting.
- Model output is rendered as text, not injected as HTML.
- The endpoint is public. Add platform-level rate limiting / abuse protection before promoting it for high-traffic public use. Origin checks are not authentication and do not replace rate limiting.
- If a key was ever committed to a public repository, revoke it. Removing it from the latest file does not remove it from Git history.

## Project structure

```
.
├── api/
│   └── recommend.js
├── index.html
├── .env.example
├── .gitignore
├── SECURITY.md
└── README.md
```

## License

No license is currently declared. Add a license before accepting external contributions or reuse.
