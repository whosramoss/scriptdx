# Security Policy

## Supported versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

Security fixes are released as patch versions (e.g. `1.0.1`) when applicable.

## Reporting a vulnerability

**Do not** open a public GitHub issue for security vulnerabilities.

1. Use [GitHub Security Advisories](https://github.com/whosramoss/scriptdx/security/advisories/new) (preferred), or contact the maintainer privately via GitHub.
2. Include: affected version, steps to reproduce, and impact (e.g. code execution, data exposure).
3. Avoid posting exploit details, payloads, or live attack demos in public channels until a fix is available.

We aim to acknowledge reports within a reasonable timeframe and coordinate disclosure after a fix or mitigation is ready.

## Scope

| In scope | Out of scope |
| -------- | ------------ |
| The `scriptdx` library code shipped in the npm package (`dist/`) | The static demo under `www/` (hosting, CDN, third-party assets) |
| Documented public API in [docs/API.md](./docs/API.md) | Applications that depend on `scriptdx` (consumer CLI scripts, CI pipelines) |
| Build/tooling in this repo only if it affects published artifacts | Social engineering, npm account compromise, misconfigured `.env` in consumer projects |

`scriptdx` writes ANSI-colored output to `stdout`/`stderr` and does not open network sockets or read arbitrary files by design. Reports about terminal escape sequences in untrusted **input strings** passed to logging helpers are welcome if you believe they enable misleading UI or terminal abuse in realistic CLI usage.

## Best practices for consumers

- Pin semver ranges in `package.json` and review changelogs on upgrades.
- Do not pass untrusted user input directly into terminal output without sanitization if your threat model requires it.
- Keep Node.js and dependencies updated in applications that embed this library.
