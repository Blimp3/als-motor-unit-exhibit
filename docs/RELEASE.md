# Release and demo guide

## Local release check

Use Node.js 22.13 or newer:

```bash
npm ci
npm run lint
npm run typecheck
npm run test:unit
npm run build
node --test tests/rendered-html.test.mjs
npx playwright install chromium
npm run test:browser
npm start
```

Open `http://localhost:3000/` and verify the normal, ALS, and side-by-side
views; timeline and playback controls; structure labels; simplified view;
keyboard reset; reduced-motion behavior; mobile layout; source links; and the
educational disclaimer.

## Screenshot procedure

Release screenshots must be captured from the built application using
synthetic interaction state. Do not include browser profiles, local paths,
account data, analytics identifiers, or third-party artwork. Record the viewport
and commit in the pull request. An app screenshot produced by this procedure may
be listed as owner-created in `THIRD_PARTY_RIGHTS.md`.

The committed social-preview images were captured from the same production
build and contain only the repository's UI and procedural fallback view.

The committed `release-demo.png` was captured from the production build with a
1440 × 1000 CSS-pixel viewport, `?fallback=1`, Chromium, and no browser profile,
account, analytics, or external content. Recapture it whenever a material UI or
medical-content change makes the image stale.

## Publication checklist

- all-history secret and sensitive-data scans are complete;
- lint, type checking, unit tests, rendered-output tests, browser tests, and the
  production build pass;
- production and development dependencies have no unresolved high-severity
  advisory and their licenses are compatible; see `DEPENDENCY_REVIEW.md` for
  the point-in-time result and redistribution obligations;
- medical links are checked and every material educational statement remains
  within the cited source scope;
- the disclaimer is visible and no interface presents the teaching sequence as
  clinical staging;
- the MIT and CC BY 4.0 scopes remain distinct;
- every asset has a resolved row in `THIRD_PARTY_RIGHTS.md`; and
- included third-party assets and notices are confirmed; original in-repository
  code and owner-created content follow `LICENSE` and `CONTENT_LICENSE.md`.

## Local preparation check — 17 September 2026

Base: PR #2, `62fb2f293ed12d9b15e48bcfa1399501d8356eb0`, with an uncommitted
documentation and dependency preparation diff. No PR #1 code was transferred. These
results are local execution evidence, not a new GitHub CI run or release.

Node.js 22.22.3 / npm 10.9.8: `npm ci`, lint, strict type checking, 20 unit
tests, production build, two rendered-output tests, four Chromium browser
tests, `npm ls --all`, and `git diff --check` passed. The browser tests exercise
the forced Canvas view, controls, scope/source text, hero controls and widths
from 320 to 1366 pixels; they do not establish owner acceptance in every
browser or clinical validity.

Next.js and its matching ESLint configuration were updated to 16.3.5; vulnerable
overrides and transitive dependencies were refreshed. The final full `npm audit`
reports zero findings, and all application checks above passed after the update.
See [the dependency review](DEPENDENCY_REVIEW.md) for exact versions, hashes,
the unrefreshed OSV scope and npm's optional Sharp WASM tree-reporting limitation.

**17 September snapshot:** the current source and reachable remote-head history
passed the local secret scan. No clinical accuracy certification is claimed; the
[source-link check](MEDICAL_REVIEW.md#link-check-attempt--17-september-2026)
was incomplete. A clean dependency audit does not resolve that source-review
item. The original in-repository code and content licenses are recorded, while
external animation files remain excluded and unlicensed here.
The [related media inventory](MEDIA_PROVENANCE.md) does not select an MP4 or
extend this repository's licenses to external material.

## Scope clarification — 18 September 2026

The prepared source snapshot is an educational illustration. Its original
in-repository code is MIT-licensed and identified owner-created educational
content is CC BY 4.0 under the linked notices. The visible disclaimer states
that the work is not medical advice, diagnosis, or treatment guidance; no
clinician sign-off or clinical accuracy certification is claimed as part of
this software release. The 17 September source-link results are documented
access limitations, not findings that the cited sources are absent or invalid.
External MP4 files remain excluded and are not licensed by this repository.
