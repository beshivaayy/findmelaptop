# Security Policy

## Reporting a vulnerability

Please do not publish API keys, tokens, passwords, or exploit details in public issues. Contact the repository maintainer privately through GitHub.

## Secret handling

- Never commit real API keys or credentials.
- Store Gemini credentials in Vercel Project Environment Variables or a local `.env.local` file.
- Keep secrets server-side. Do not expose them through browser JavaScript or public build-time variables.
- Restrict provider keys to the minimum required API and monitor usage.
- Revoke and rotate any credential suspected of exposure.

## Known remediation

The original prototype included a Gemini credential in client-side source. That credential must be considered compromised and revoked. The current implementation uses a server-side Vercel Function and reads `GEMINI_API_KEY` from the deployment environment. A code change does not erase secrets from prior Git commits; revoke the exposed credential regardless of history cleanup.
