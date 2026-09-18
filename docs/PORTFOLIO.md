# ALS educational visualization: one portfolio case study

This application is the planned primary ALS code example. It demonstrates
TypeScript, React/Next.js, procedural Three.js geometry, a Canvas fallback,
responsive controls, and deterministic animation-state tests. It is an
educational illustration and schematic, not medical advice, treatment guidance,
a biological simulation validated against patient data, a diagnostic tool, or a
clinical staging system.

The preparation base is publication PR #2 at
`62fb2f293ed12d9b15e48bcfa1399501d8356eb0`. A local preparation diff or a passing
test run does not establish a released, deployed, or owner-accepted version.
See [the release guide](RELEASE.md) for remaining publication gates.

## Guided demo

Follow the [README setup](../README.md). No account, backend or cloud resources
are required.

1. In the hero, compare Normal and ALS, change the illustrative state and use
   the chapter buttons to inspect the cell body, axon, junction and muscle.
2. Choose **Explore the full atlas**, then **Compare**. Explain that the
   numbered views are teaching states rather than a patient timeline.
3. Open the anatomy index and select **Neuromuscular junction**. Use
   **Signal journey**, pause, resume and replay to show the control flow.
4. Choose **Use simplified 2D view**, or reopen `/?fallback=1`, to demonstrate
   the Canvas alternative. Operate the mode buttons and timeline by keyboard.
5. Enable reduced motion in the browser/OS and reload. The hero should show
   a static composition; inspect the source links and educational disclaimer.

An application recording should identify the source commit, any uncommitted
diff, viewport, browser and capture date. Related design renders are not
recordings of this application.

## Related work

| Item | Role in this case study | Evidence boundary |
| --- | --- | --- |
| `lower-motor-unit-als-exhibit` | Primary application | This source and its tests; publication review remains open |
| [als-website](https://github.com/Blimp3/als-website) | Smaller companion implementation | Separate HTML/CSS/JavaScript application with SVG and Three.js; its own review and license decisions apply |
| Claude Design animation exports | Possible related-media companion | Project records were found; original runnable source was not recovered; no MP4 selected |
| Remotion explainer | Optional source prototype | Separate 60-second composition; not the source of the 73/125-second exports |
| Healthy-neuron Vite/Three.js loop | Optional healthy-baseline prototype | Separate 52-second loop; intentionally does not depict ALS degeneration |

These are related implementations and experiments, not separate proven ALS
achievements. The [media record](MEDIA_PROVENANCE.md) tracks their identities.
The separate corticospinal concept clip is omitted from the minimum demo.

## Existing PR overlap

PR #1 at `c6d4d33198aa3b2e16c13805a218ca40c5bf06e7` remains separate. Compared
with this candidate, it has a 2,500 ms journey phase, seek/inspection state,
different cancellation/replay semantics, fallback annotation layout helpers,
and a different visual test suite. PR #2 uses 1,700 ms phases and its existing
hero, fallback and browser tests. Those differences span the animation model,
renderers and tests; they are not a documentation-only merge.

No PR #1 changes were transferred in this preparation. A demonstrated behavior
failure should be reproduced on PR #2 before selecting a minimal fix; visual
redesigns and timing preferences remain separate work.
