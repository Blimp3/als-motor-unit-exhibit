# Related ALS media: provenance and comparison

Recorded 17 September 2026 from Codex's local file inspection. No external
media is included in this repository or selected for publication. Local paths,
private account exports and MP4 masters are deliberately absent from this
document. The repository's code/content licenses do not license these files.

## Claude-associated exports

Two project-specific records identify **ALS Lower Motor Neuron Animation**
and name `als-scenes-3d.jsx` and `ALS Lower Motor Neuron 3D.dc.html`. A bounded
local search did not recover either source file. Export names and durations
support the association; an exact historical source-to-render linkage is
unverified. No whole-account export is needed for further source recovery.

All three MP4s have one H.264 video stream, 1920 × 1080 pixels at 30 fps, and
no audio stream according to `ffprobe`.

| File | Duration | Exact bytes | SHA-256 |
| --- | --- | ---: | --- |
| `ALS Lower Motor Neuron 3D.mp4` | 73 s | 42,296,122 | `3287d63ae6fe130b2f69e08c2b0dbeea56465a7356a4026b2437b04ff0b6e9b1` |
| `ALS Lower Motor Neuron 3D (1).mp4` | 125 s | 70,726,520 | `cab08062796d5cc8a709810eb3701c37387eca9302852a730dc9e4d053b3970e` |
| `ALS Lower Motor Neuron 3D (2).mp4` | 125 s | 67,024,313 | `c03351065c0ec2d60087f81270a96de3a86d59e500b910d45d7c0f180e117d04` |

The full-duration sampling pass covered 323 one-second frames and 1,292
quarter-second title frames, with OCR and visual review of stable text and
paired scenes. It does not mean every decoded frame was manually inspected.
The short version has eight scenes; both longer versions have ten, adding
upper-motor-neuron and fasciculation scenes. All include a final treatment
illustration titled **Riluzole · anti-glutamatergic action**; that explanation
has not been medically validated in this review.

**Correction to the initial sample note:** both `(1)` and `(2)` visibly show
**Upper motor neuron degeneration**. The previously reported shortened title
in `(2)` was not reproduced. The long versions share scene order and sampled
labels but differ in animation/camera frames around 64–84 seconds. Different
hashes do not identify a source revision.

**Comparison status:** full-duration sampled scene/text comparison complete;
the external renders remain unselected. This record does not grant rights or
provide clinical validation. File size and date are not selection criteria. Do
not describe any as a capture of either GitHub application. The complete
scene/text inventory is retained in the private preparation review packet.

If one is later approved, retain the master outside ordinary Git history and
attach the selected MP4 to an approved release/demo location. Add a reviewed
poster, accessible transcript/captions, rights record and artifact hash. Until
source is recovered, label it as a related Claude Design render with missing
runnable source, not clinically validated and not an application capture.

## Separate prototypes

| Item | Inspected source or artifact | Status / proposed use |
| --- | --- | --- |
| Remotion explainer | Composition `ALS-Lower-Motor-Neuron`, Remotion 4.0.506, 1,800 frames at 30 fps, 1920 × 1080 | Separate 60-second source prototype; build/render not verified; origin tool and rights unresolved; optional companion |
| Healthy-neuron loop | Vite 5.4.8 / Three.js 0.169, package 0.1.0, procedural 52-second loop | Healthy baseline only; no ALS degeneration; build/browser not verified; rights unresolved; optional companion |
| Corticospinal concept | 16-second H.264/AAC, 1280 × 720, 30 fps, 11,305,353 bytes | Adjacent prompt describes an upper-motor-neuron concept; exact generation/source linkage unverified; omit from minimum demo |

The Remotion archive SHA-256 is
`56c17492cf7e84fab9f86da8739e175604dad38dd102c1a0b98b6e75c63c0721`.
The corticospinal concept SHA-256 is
`fe74cfeee5de57982d1847768df45380fcb7b8ef00ccbfda10e6b1ac044f63d0`.
Neither hash establishes rights, authorship, medical validity, or a match to
the GitHub application. A fresh reconstruction/render would be a new artifact.

Recovery is limited to a supported source export for the named Claude project
or a newly identified exact source location. No such route has yet been
verified. Preserve originals; do not import separate source trees into this
application just to consolidate the portfolio.
