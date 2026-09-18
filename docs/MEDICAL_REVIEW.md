# Medical-content review

Review date: 2026-07-20

This is an editorial evidence review of an educational visualization, not an
independent clinical or peer review. It does not certify medical accuracy for
diagnosis, prognosis, or treatment. The project is presented as an illustration
and does not provide medical advice, diagnosis, or treatment guidance. Material
changes to the disease narrative require another source review before release.

## Conclusions

- The motor-unit definition, one-neuron-to-many-fibers relationship, and
  smallest-recruited-unit framing follow the NCBI Bookshelf anatomy source.
- ALS is described as heterogeneous and involving both upper and lower motor
  neurons; the display explicitly limits itself to one spinal lower motor unit.
- Protein homeostasis, RNA biology, mitochondrial function, oxidative stress,
  excitability, and axonal transport are presented as overlapping implicated
  mechanisms, not one universal causal sequence.
- Denervation, terminal instability, collateral reinnervation, motor-unit
  enlargement, and neurogenic atrophy are presented as variable processes.
  The numbered interface states are repeatedly labeled illustrative and not
  clinical stages.
- Myelin and Schwann-cell changes are framed as supporting or secondary rather
  than ALS being a primary demyelinating disorder.
- Symptoms and visible findings are not presented as diagnostic. The page has
  a persistent educational disclaimer and does not provide medical advice,
  diagnosis, or treatment guidance.

## Evidence map

| Claim group | Sources used | Release limitation |
| --- | --- | --- |
| Motor-unit anatomy and recruitment | [NCBI Bookshelf — The Motor Unit](https://www.ncbi.nlm.nih.gov/books/NBK10874/) | Schematic is simplified and not to scale. |
| ALS scope, heterogeneity, and diagnostic caution | [NINDS ALS focus](https://www.ninds.nih.gov/current-research/focus-disorders/focus-amyotrophic-lateral-sclerosis), [NINDS ALS booklet (2025)](https://www.ninds.nih.gov/sites/default/files/2025-05/NINDS_ALS_Booklet_Digital-508c.pdf), [ALS Association overview](https://www.als.org/understanding-als/what-is-als), and [symptoms and diagnosis](https://www.als.org/understanding-als/symptoms-diagnosis) | Patient-facing summaries supplement, but do not replace, primary literature or clinical guidance. |
| Cellular and axonal mechanisms | [Molecular and Cellular Mechanisms Affected in ALS](https://pmc.ncbi.nlm.nih.gov/articles/PMC7564998/) | Mechanisms are implicated with variable contribution; no single sequence is asserted. |
| Denervation, reinnervation, and muscle response | [Skeletal muscle in amyotrophic lateral sclerosis](https://pmc.ncbi.nlm.nih.gov/articles/PMC10629757/) | Model states are teaching views, not patient trajectories. |
| Neurogenic muscle pathology and limits of findings | [Review of the Pathology of Muscle in ALS](https://pmc.ncbi.nlm.nih.gov/articles/PMC13026879/) | Findings such as fasciculation or atrophy are nonspecific and not diagnostic alone. |

## Checks encoded in the repository

`tests/scientific-content.test.ts` verifies that the illustrative states avoid
clinical-stage language, glossary terms retain their corrected definitions,
and every listed source states what it supports. Browser and rendered-output
tests verify that the scope language, source links, and disclaimer remain
visible in the shipped page.

## Remaining release checks

- This is an editorial source review, not clinical validation or accuracy
  certification; the project is published only as an educational illustration
  with the visible scope disclaimer.
- Link reachability and source currency should be rechecked for each release.
- Any future external asset added to `THIRD_PARTY_RIGHTS.md` needs its own
  rights record; excluded media remain outside the release.

## Link-check attempt — 17 September 2026

The ALS Association overview and symptoms/diagnosis pages and the NCBI
Bookshelf motor-unit page returned their expected page content through the
web reader. Both NINDS links returned HTTP 403. All three PMC article links
returned a browser-check page instead of the article. These are unresolved
access checks, not evidence that the references are missing or medically
invalid. Recheck the blocked sources in an ordinary browser before release.

This pass did not revise or clinically validate the source mapping above.
Source reachability and third-party rights remain separate review items; no
clinical accuracy certification is claimed.
