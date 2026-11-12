# Security Policy

## Reporting a vulnerability

Please do not publish API keys, tokens, passwords, or exploit details in public issues. Contact the repository maintainer privately through GitHub.

## Secret handling

- Never commit real API keys or credentials.
- Store the OpenRouter API key in Vercel Project Environment Variables or a local `.env.local` file.
- Keep secrets server-side. Do not expose them through browser JavaScript or public build-time variables.
- Use the minimum provider permissions available and monitor usage and rate limits.
- Revoke and rotate any credential suspected of exposure.

## Known remediation

The original prototype included a Gemini credential in client-side source. The repository maintainer has confirmed that credential was deleted/revoked. The current implementation uses a server-side Vercel Function and reads `OPENROUTER_API_KEY` from the deployment environment. A code change does not erase secrets from prior Git commits; ensure the exposed credential remains revoked. History cleanup can be considered separately after confirming revocation.
