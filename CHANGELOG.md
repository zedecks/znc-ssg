# Changelog - znc-ssg

## [1.0.0-alpha.1] - 2026-09-24

### Added
- Initialized physical directory skeleton (`bin/`, `src/commands/`, `src/core/`, `src/utils/`, `templates/`, `docs/`).
- Created `package.json` with Apache 2.0 open-source license.
- Added dependencies: `chalk`, `commander`, `fs-extra`, `html-minifier-terser`, `clean-css`, `terser`, `fluent-ffmpeg`, and `sharp`.
- Created Git ignore rules (`.gitignore`, `.geminiignore`).
- Scaffolded core CLI executable entrypoint in `bin/znc.js`.
- Extracted and generalized core components into `src/core/compiler.js` and `src/core/pages.js`.
- Created generic agnostic config mechanism in `src/core/config.js` with fallback to `znc.config.js`.
- Integrated SEO utilities in `src/utils/optimizer.js`.
- Configured file system utilities in `src/utils/file-system.js`.
