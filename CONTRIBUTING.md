# Contributing to scriptdx

Thank you for your interest in contributing. This guide covers local setup, workflow, and what belongs in the npm package versus the repository only.

## Prerequisites

- Node.js **18+**
- npm (or a compatible package manager)

## Local setup

```bash
git clone https://github.com/whosramoss/scriptdx.git
cd scriptdx
npm install
npm run build
npm test
```

### Interactive tutorial

```bash
npm run tutorial
```

Runs `docs/example.ts` — a terminal menu with one scenario per feature category.

### Demo site (`www/`)

The `www/` folder is a static demo for [scriptdx.whosramoss.com](https://scriptdx.whosramoss.com). It stays in Git for local preview but is **not** published to npm (see `.npmignore` and `"files"` in `package.json`).

## Development scripts

| Script            | Purpose                          |
| ----------------- | -------------------------------- |
| `npm run build`   | Produce `dist/` via tsup         |
| `npm run dev`     | Watch mode build                 |
| `npm run test`    | Vitest unit tests                |
| `npm run lint`    | ESLint                           |
| `npm run typecheck` | `tsc --noEmit`                 |

Before opening a PR, run:

```bash
npm run build && npm run typecheck && npm run lint && npm test
```

## Branch and pull requests

1. Fork the repository and create a branch from `main` (e.g. `fix/spinner-cleanup`, `feat/new-helper`).
2. Keep changes focused — one logical change per PR when possible.
3. Update tests when behavior changes.
4. Update [CHANGELOG.md](./CHANGELOG.md) under `[Unreleased]` for user-visible changes (English, Keep a Changelog categories).
5. Open a PR against `main` with a clear description and steps to verify.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/) in **English**:

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `chore:` — tooling, deps, release prep
- `test:` — tests only
- `refactor:` — code change without feature/fix

Examples:

```
feat: add bordered table padding option
fix: clear spinner line on stop
docs: document createSpinner options in API.md
```

## What **not** to publish

These stay in the repo (GitHub) but are excluded from the npm tarball:

| Path / file        | Reason                                      |
| ------------------ | ------------------------------------------- |
| `www/`             | Static demo site only                       |
| `tests/`, `src/`   | Source and tests; consumers use `dist/`     |
| `CONTRIBUTING.md`  | Contributor guide (this file)               |
| `SECURITY.md`      | Security policy for the GitHub repo         |
| Config files       | Build/test tooling                          |

Only paths listed in `"files"` in `package.json` (plus `README.md`, `LICENSE`, `package.json`) ship to npm.

## Releases

1. Bump `version` in `package.json` and add `## [x.y.z]` to `CHANGELOG.md`.
2. `git commit -m "chore: release vX.Y.Z"`.
3. `git tag -a vX.Y.Z -m "Release vX.Y.Z"`.
4. `npm publish` (same version as the tag; enable npm 2FA for publish).
5. `git push origin main` and `git push origin vX.Y.Z`.
6. Create a GitHub Release from the tag (stable releases: label **None**; copy notes from `CHANGELOG.md`).

## Questions

Open a [GitHub issue](https://github.com/whosramoss/scriptdx/issues) for bugs or feature discussions before large refactors.
