import { HeroSection } from "../components/HeroSection";
import { MotorUnitExperience } from "../components/MotorUnitExperience";
import { SOURCES, STRUCTURES } from "../lib/content";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to the visualization</a>

      <HeroSection />

      <main id="main-content">
        <div id="experience" className="anchor-target">
          <MotorUnitExperience />
        </div>

        <section className="key-lesson" id="lesson" aria-labelledby="lesson-title">
          <div className="lesson-index" aria-hidden="true">01</div>
          <div>
            <p className="kicker">Key lesson</p>
            <h2 id="lesson-title">The disease affects a connected system</h2>
            <blockquote>
              “In ALS, the muscle may initially be structurally capable of contracting, but it progressively loses effective communication with the lower motor neurons that activate and maintain it. The disease affects the entire motor unit: the neuron, its long axon, the neuromuscular junction, and the connected muscle fibers.”
            </blockquote>
          </div>
        </section>

        <section className="science-section" aria-labelledby="science-title">
          <header className="section-heading">
            <p className="kicker">Scientific guardrails</p>
            <h2 id="science-title">What this model does—and does not—mean</h2>
          </header>
          <div className="guardrail-grid">
            <article>
              <span aria-hidden="true">01</span>
              <h3>Not one universal pathway</h3>
              <p>Protein homeostasis, RNA biology, mitochondria, oxidative stress, transport, excitability, glia, and other processes can interact differently across ALS types and individuals.</p>
            </article>
            <article>
              <span aria-hidden="true">02</span>
              <h3>Not ordinary muscle aging</h3>
              <p>ALS is not caused by weak muscles, aging alone, or one lifestyle behavior. Atrophy here is mainly a downstream consequence of lost nerve input and differs from sarcopenia.</p>
            </article>
            <article>
              <span aria-hidden="true">03</span>
              <h3>Not a demyelinating-disease model</h3>
              <p>Schwann-cell myelin supports peripheral conduction, but ALS is represented by motor-neuron, axonal, terminal, and motor-unit degeneration—not primary demyelination.</p>
            </article>
            <article>
              <span aria-hidden="true">04</span>
              <h3>Not a diagnostic test</h3>
              <p>Fasciculation, weakness, atrophy, or any single visible feature has many possible causes and cannot diagnose ALS. This illustration does not evaluate symptoms or provide a diagnosis.</p>
            </article>
          </div>
        </section>

        <section className="glossary-section" id="glossary" aria-labelledby="glossary-title">
          <header className="section-heading">
            <p className="kicker">Glossary</p>
            <h2 id="glossary-title">Anatomy and process terms</h2>
            <p>Open any term for a concise definition. Use the matching label in the 3D model for a guided view.</p>
          </header>
          <div className="glossary-grid">
            {STRUCTURES.map((structure) => (
              <details key={structure.id}>
                <summary>
                  <span>{structure.label}</span>
                  <i aria-hidden="true">＋</i>
                </summary>
                <div className="glossary-definition">
                  {structure.definition ? (
                    <>
                      <p><strong>Definition</strong>{structure.definition}</p>
                      <p><strong>ALS context</strong>{structure.als}</p>
                    </>
                  ) : (
                    <p>{structure.normal}</p>
                  )}
                </div>
              </details>
            ))}
          </div>
        </section>

        <section className="sources-section" id="sources" aria-labelledby="sources-title">
          <header className="section-heading">
            <p className="kicker">Medical sources</p>
            <h2 id="sources-title">Evidence behind the experience</h2>
            <p>Authoritative overviews and peer-reviewed reviews used to calibrate the anatomy, mechanisms, and diagnostic cautions.</p>
          </header>
          <ol>
            {SOURCES.map((source) => (
              <li key={source.href}>
                <a href={source.href} target="_blank" rel="noreferrer">
                  <span className="source-copy">
                    <strong>{source.label}</strong>
                    <small>Supports: {source.supports}</small>
                  </span>
                  <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="site-footer">
        <p>
          <strong>Educational disclaimer:</strong> This site simplifies complex and still-evolving science. It is an educational illustration, not medical advice, not a diagnostic tool, and not treatment guidance. The schematic is not to scale, and its illustrative states are not clinical stages or a patient timeline.
        </p>
        <span>Lower motor-unit teaching model · 2026</span>
      </footer>
    </>
  );
}
