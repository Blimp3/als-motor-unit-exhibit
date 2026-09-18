# Asset and content rights manifest

This manifest separates code, original educational material, linked sources,
and assets whose provenance still needs confirmation. Original in-repository
code and owner-created educational material use the licenses stated below.
External media and any material marked “confirmation required” remain excluded
from the publishable source snapshot unless separately cleared.

| Material | Path or reference | Origin | Release treatment |
| --- | --- | --- | --- |
| Application source | `app/`, `components/`, `lib/`, tests, and configuration retained for the production Next.js app | Repository owner | MIT |
| Educational prose and labels | `lib/content.ts`, `app/page.tsx`, and owner-authored documentation | Repository owner | CC BY 4.0 |
| Procedural 2D/3D scene output | Runtime rendering produced by repository code | Repository owner | CC BY 4.0 when captured as a screenshot |
| Release demo screenshot | `docs/release-demo.png` | Captured from this repository's procedural 2D fallback on 2026-07-20; no account, user data, or third-party artwork | CC BY 4.0 |
| Favicon | `public/favicon.svg` | Original LMU wordmark drawn in this cleanup branch on 2026-07-20 | MIT as source; CC BY 4.0 when rendered |
| Social-preview images | `public/og.png`, `public/og-monochrome.png` | Deterministic screenshots captured from this repository's production build on 2026-07-20; no account, user data, or third-party artwork | CC BY 4.0 |
| Cinematic hero | `components/CinematicMotorUnitHero.tsx`, `components/HeroSection.tsx`, `lib/cinematic-loop.ts` | Generated entirely from deterministic procedural Three.js code written for this project (2026-07-23); no stock, generated-AI, or third-party media assets were added | MIT as source; CC BY 4.0 when rendered |
| Art-direction references | Dribbble case study (https://dribbble.com/shots/27217188-Web-Design-for-a-Biotech-AI-Driven-Platform), its portfolio clip, and https://www.deeppiction.com/ | Respective owners | Consulted as art-direction references only (2026-07-23); no assets, copy, layout measurements, typefaces, or footage were copied, hotlinked, or shipped |
| Medical references | Links listed in `lib/content.ts` | NINDS/NIH, NCBI Bookshelf, The ALS Association, and cited journal authors/publishers | Linked and cited only; third-party text and figures are not redistributed |
| Product and organization names | Next.js, React, Three.js, Vercel, ALS Association, NIH/NINDS, and other names in documentation | Respective owners | Nominative reference only; no endorsement claimed |

The original in-repository code and owner-created content are covered by the
root `LICENSE` and `CONTENT_LICENSE.md` under the scope selected for this
prepared candidate. These licenses do not extend to the external animation
files listed in `docs/MEDIA_PROVENANCE.md` or to linked third-party material.

## Contributor checklist

Before adding an image, font, icon, audio file, dataset, quotation, or copied
diagram:

1. record its creator and source;
2. record the exact license or written permission;
3. preserve required attribution and notices; and
4. do not add it when redistribution or derivative rights are unclear.
