import assert from "node:assert/strict";
import { test } from "node:test";
import { SOURCES, STAGES, STRUCTURES } from "../lib/content.ts";

const expectedDefinitions = new Map([
  [
    "Denervation",
    "Loss of effective motor-nerve contact with a muscle endplate. Sustained denervation reduces recruitment and produces neurogenic atrophy. It has many causes and is not specific to ALS.",
  ],
  [
    "Reinnervation",
    "Collateral sprouting from a surviving motor axon can reconnect denervated muscle fibers, enlarging that surviving motor unit and temporarily preserving force.",
  ],
  [
    "Muscle atrophy",
    "Reduction in muscle-fiber size. In ALS, much of the displayed atrophy is neurogenic and follows sustained loss of motor input; it is not equivalent to age-related sarcopenia and is not diagnostic by itself.",
  ],
]);

test("every glossary label maps to explicit displayed definition text", () => {
  for (const structure of STRUCTURES) {
    const displayedDefinition = structure.definition ?? structure.normal;
    assert.ok(displayedDefinition.trim(), `${structure.label} must have glossary text`);
    assert.notEqual(displayedDefinition, structure.label, `${structure.label} must not map to its label alone`);
  }
});

test("process glossary terms use the corrected definitions rather than normal-role text", () => {
  for (const [label, definition] of expectedDefinitions) {
    const entry = STRUCTURES.find((structure) => structure.label === label);
    assert.ok(entry, `${label} entry is missing`);
    assert.equal(entry.definition, definition);
    assert.notEqual(entry.definition, entry.normal);
  }
});

test("illustrative states avoid clinical stage framing and accurately describe motor-unit loss", () => {
  for (const state of STAGES.slice(1)) {
    assert.match(state.eyebrow, /^Illustrative state \d/);
    assert.doesNotMatch(state.eyebrow, /\bStage\b/);
  }
  assert.equal(STAGES[5].title, "Motor units are lost as compensation is exceeded");
  assert.equal(STAGES[5].unit, "Fewer viable units");
  assert.match(STAGES[5].summary, /that motor unit ceases to exist/);
});

test("authoritative sources explicitly map the claims they support", () => {
  assert.ok(SOURCES.every((source) => source.supports.length > 20));
  assert.ok(SOURCES.some((source) => /NINDS/.test(source.label) && /motor-neuron|Upper-/.test(source.supports)));
  assert.ok(SOURCES.some((source) => /The Motor Unit/.test(source.label) && /alpha motor neuron/.test(source.supports)));
  assert.ok(SOURCES.some((source) => /Skeletal muscle in/.test(source.label) && /denervation–reinnervation/.test(source.supports)));
});

