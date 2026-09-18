# Dependency and license review

Review date: 2026-09-17

## Security result

- Before the update, `npm audit` reported 10 affected dependency entries:
  1 critical, 6 high, and 3 moderate. The direct Next.js finding included
  unauthenticated remote-code-execution advisories; affected transitives
  included Sharp, `brace-expansion`, Browserslist, `js-yaml`, Nano ID,
  `baseline-browser-mapping`, and PostCSS.
- Next.js and its matching ESLint configuration moved from 16.2.10 to 16.3.5.
- Existing security overrides moved `js-yaml` from 4.2.0 to 4.3.2 and PostCSS
  from 8.5.20 to 8.5.23. The existing `@babel/core` 7.29.6 override remains.
- The lockfile now resolves Sharp 0.35.4, `brace-expansion` 1.1.21 and 5.0.12,
  Browserslist 4.29.0, Nano ID 3.3.19, and
  `baseline-browser-mapping` 2.11.24. These updates stay within the dependency
  ranges already declared by Next.js, ESLint, PostCSS, and their transitives.
- A clean `npm ci` and a fresh full `npm audit` completed with zero findings.
- Lint, strict TypeScript checking, unit/scientific tests, rendered-output
  tests, the production build, and browser tests pass with the resulting
  lockfile. `npm ls --all` exits zero; npm 10.9.8 still labels the optional
  Sharp WASM packages `@img/sharp-wasm32` and `@emnapi/runtime` as extraneous
  after a clean install. They are recorded in the lockfile through Sharp's
  platform-specific optional metadata and did not affect the audit or build.

The npm advisory result is a point-in-time registry check, not a guarantee
against future advisories or a penetration test. OSV-Scanner was not rerun for
this refresh, so the earlier 2026-07-20 OSV result is not current evidence.
Refresh both advisory sources before each release. This dependency review is
not medical or scientific clearance, runtime deployment verification, or
release approval.

## License result

The lockfile contains license metadata for every resolved package. The
declared identifiers are MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC,
0BSD, BlueOak-1.0.0, CC0-1.0, CC-BY-4.0, Python-2.0, MPL-2.0, and the
LGPL-3.0-or-later combinations used by optional Sharp/libvips platform
packages.

No dependency source or binary is copied into this repository. npm-installed
packages retain their own notices. A distributor that ships a container,
desktop bundle, or other artifact containing Sharp/libvips or MPL-covered
files must preserve the applicable notices, corresponding-source and
replacement/relinking rights, and any file-level modification obligations.
This repository's MIT license does not replace third-party licenses.

GitHub Actions are pinned to immutable commits. The SBOM scanner does not infer
their licenses from workflow references, so release operators should preserve
the official action repositories' notices when redistributing the actions
themselves.

## Artifacts

The private release audit retains the full SPDX 2.3 SBOM and machine-readable
OSV report. They are deliberately not committed because they include local
scan metadata and should be regenerated for each release.
