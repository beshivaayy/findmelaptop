# FindMeLaptop

An AI-assisted laptop recommendation app. Users answer a short questionnaire and receive a shortlist based on workload, budget, portability, and operating-system preference.

## Stack
- Static frontend: HTML, CSS, browser JavaScript
- Backend: Vercel Node.js Function at `/api/recommend`
- AI provider: OpenRouter free-model router (`openrouter/free` by default)
- No frontend API key or client-side secret

## Run locally
1. Install Node.js 20 or later.
2. Clone this repository.
3. Copy `.env.example` to `.env.local`.
4. Create an OpenRouter API key and set `OPENROUTER_API_KEY` in `.env.local`.
5. Run:

```bash
npm install --global vercel
vercel dev
```

Do not open `index.html` directly with file://; the API route must be served by Vercel or a compatible server.

## Environment variables
| Variable | Required | Description |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | Yes | Private OpenRouter key; server-side only. |
| `OPENROUTER_MODEL` | No | Defaults to `openrouter/free`, routing to an available free model. |
| `APP_URL` | No | Public app URL sent as OpenRouter's HTTP-Referer header. |

Never use a `NEXT_PUBLIC_` prefix for secrets. Never commit real credentials or `.env.local`.

## Deploy to Vercel
1. Import this GitHub repository into Vercel.
2. In Project → Settings → Environment Variables, add `OPENROUTER_API_KEY`.
3. Optionally set `APP_URL` to your production URL.
4. Apply variables to Production and Preview as appropriate.
5. Redeploy after adding or changing environment variables.

The key is read only by the serverless function; the browser never receives it.

## Free-tier limits
OpenRouter free model variants are rate-limited and availability can change. The `openrouter/free` router may choose among available free models, so output quality and latency can vary. This tier is suitable for demos and low-volume testing, not a production uptime guarantee. Check current limits in the OpenRouter dashboard and documentation.

## Security
- Credentials are not embedded in frontend source.
- Questionnaire values are validated against fixed allow-lists.
- Non-POST methods and unexpected request origins are rejected.
- Requests have a 30-second upstream timeout and bounded output tokens.
- Model output is rendered as text, not injected as HTML.
- The endpoint is public. Add platform-level rate limiting / abuse protection before high-traffic release. Origin checks are not authentication.
- If a key was committed publicly, revoke it; removing it from current files does not erase Git history.

## Project structure
```
.
├── api/recommend.js
├── index.html
├── .env.example
├── .gitignore
├── SECURITY.md
└── README.md
```

## License
No license is currently declared. Add one before accepting external contributions or reuse.
