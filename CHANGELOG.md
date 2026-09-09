# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Fixed

## [1.2.0] - 2026-09-08

### Added

- Optional `stream` parameter on `logColor`, `logSuccess`, `logError`, `logSection`, `simpleLoading`, and `linearLoading` for custom output redirection.
- Lazy loading for `FONT_MAP` to reduce startup time when fonts are unused.
- `scriptdx/font` subpath export for explicit font module import.
- `TableOptions` type with `columnWidth` and `minWidth` options for `showTable`.
- `columnWidth: "auto"` option for dynamic column width based on content.
- `NO_COLOR` environment variable support per [no-color.org](https://no-color.org/) standard.
- `FORCE_COLOR` environment variable support for CI environments.
- Automatic TTY detection to disable colors when output is redirected.
- `isColorEnabled()` function to check current color state.
- `setColorEnabled(enabled: boolean)` function for programmatic color control.

### Changed

- `showTable` now accepts optional `TableOptions` third parameter (backward-compatible).

## [1.1.0] - 2026-07-24

### Added

- JSDoc documentation on all public API exports for better IDE hints and typedocs.
- Runtime input validation for logger, loading, menu, and table helpers (invalid arguments throw `TypeError`).
- Expanded asynchronous test coverage for spinner and loading flows.

### Changed

- Modularized the public entry point into focused modules (`colors`, `logger`, `loading`, `spinner`, `menu`, `table`, `system`, `validations`, `font`) while keeping the same public exports.
- Simplified the internal `ColorChain` implementation.

## [1.0.0] - 2026-05-28

### Added

- Initial public release of `scriptdx`.
- Logger helpers: `logInfo`, `logSuccess`, `logWarning`, `logError`, `logColor`, `logSection`, `logTopic`, `logQuestion`, and `color.*` chains with `.bold`.
- Backward-compatible aliases: `success`, `info`, `warning`, `error`, `debug`.
- Loading animations: `simpleLoading`, `linearLoading`.
- Step runner with spinner: `runStep`; manual spinner via `createSpinner`.
- Terminal tables: `showTable`, `showTableWithBorders`.
- CLI menu helper: `runMenuByIndex`.
- Tool validation: `hasTool`, `summarizeToolValidation`.
- System helpers: `isLinux`, `isWindows`.
- ASCII banner: `showScriptTitle`.
- Dual ESM/CJS build with TypeScript declarations (`dist/`).
- Documentation in `docs/` (examples and API reference).

[1.2.0]: https://github.com/whosramoss/scriptdx/releases/tag/v1.2.0
[1.1.0]: https://github.com/whosramoss/scriptdx/releases/tag/v1.1.0
[1.0.0]: https://github.com/whosramoss/scriptdx/releases/tag/v1.0.0
