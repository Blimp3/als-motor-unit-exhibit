export type Stage = {
  id: number;
  short: string;
  eyebrow: string;
  title: string;
  summary: string;
  connection: string;
  signal: string;
  unit: string;
};

export type Structure = {
  id: string;
  label: string;
  category: string;
  definition?: string;
  normal: string;
  als: string;
};

export const STAGES: Stage[] = [
  {
    id: 0,
    short: "Healthy",
    eyebrow: "Healthy motor unit",
    title: "Stable communication from spinal cord to muscle",
    summary:
      "The lower motor neuron conducts an action potential, supplies its distant terminals through bidirectional axonal transport, releases acetylcholine, and recruits every connected muscle fiber.",
    connection: "Stable",
    signal: "Reliable",
    unit: "Preserved",
  },
  {
    id: 1,
    short: "Cell stress",
    eyebrow: "Illustrative state 1 · Cellular stress",
    title: "Several stress mechanisms may overlap",
    summary:
      "Altered protein handling, mitochondrial function, RNA processing, oxidative balance, and axonal transport are all implicated. Their order and relative importance vary among people.",
    connection: "Largely intact",
    signal: "Often reaches muscle",
    unit: "Cellularly stressed",
  },
  {
    id: 2,
    short: "NMJ instability",
    eyebrow: "Illustrative state 2 · Junction instability",
    title: "Some terminals withdraw from muscle endplates",
    summary:
      "Selected neuromuscular junctions lose effective contact—a process called denervation. The neuron may still fire, but fewer muscle fibers respond together.",
    connection: "Partly denervated",
    signal: "Patchy activation",
    unit: "Fewer active fibers",
  },
  {
    id: 3,
    short: "Axon loss",
    eyebrow: "Illustrative state 3 · Axonal degeneration",
    title: "The distal route thins and fragments",
    summary:
      "Cargo movement slows further, distal axonal segments and branches degenerate, and the electrical command no longer reaches every fiber in the motor unit.",
    connection: "Branches failing",
    signal: "Reduced reach",
    unit: "Reduced recruitment",
  },
  {
    id: 4,
    short: "Compensation",
    eyebrow: "Illustrative state 4 · Compensation",
    title: "A surviving neuron sprouts collateral branches",
    summary:
      "A neighboring motor axon can reinnervate some abandoned fibers. This enlarges the surviving motor unit and may temporarily preserve strength, but compensation is finite.",
    connection: "Partly reinnervated",
    signal: "Partial rescue",
    unit: "Survivor enlarged",
  },
  {
    id: 5,
    short: "Neuron loss",
    eyebrow: "Illustrative state 5 · Progressive motor-neuron loss",
    title: "Motor units are lost as compensation is exceeded",
    summary:
      "When a lower motor neuron and its axon are lost, that motor unit ceases to exist. Surviving motor neurons may temporarily reinnervate additional fibers, but as denervation outpaces reinnervation, fewer fibers are recruited; weakness and neurogenic atrophy increase.",
    connection: "Widespread loss",
    signal: "Route can fail",
    unit: "Fewer viable units",
  },
];

export const STRUCTURES: Structure[] = [
  {
    id: "anterior-horn",
    label: "Anterior horn (spinal cord)",
    category: "Spinal cord context",
    normal:
      "The anterior, or ventral, horn is the gray-matter region that contains lower motor-neuron cell bodies. Their axons leave through ventral roots and continue into peripheral nerves.",
    als:
      "ALS can damage lower motor neurons in the anterior horn as well as upper motor neurons in the brain. This model isolates the lower motor-unit part of that wider disease.",
  },
  {
    id: "cell-body",
    label: "Motor-neuron cell body",
    category: "Neuron",
    normal:
      "The soma lies in the anterior horn of the spinal cord. It integrates synaptic input and houses the machinery needed to maintain an exceptionally long axon.",
    als:
      "Lower motor-neuron somas can develop overlapping disturbances in protein homeostasis, RNA biology, mitochondria, excitability, and stress responses before losing function.",
  },
  {
    id: "nucleus",
    label: "Nucleus & organelles",
    category: "Cell biology",
    normal:
      "The nucleus regulates gene expression. RNA is processed for use in the soma and axon, while the endoplasmic reticulum and Golgi make, fold, and route proteins and membranes.",
    als:
      "Abnormal RNA processing, nucleocytoplasmic transport, protein folding, and protein clearance are implicated in many—though not all—forms of ALS.",
  },
  {
    id: "dendrites",
    label: "Dendrites",
    category: "Input",
    normal:
      "Dendrites receive descending voluntary commands plus local spinal and sensory-circuit input. The soma combines these signals to determine whether the neuron fires.",
    als:
      "Neuron-wide disease can alter dendritic structure, excitability, and synaptic input. A visible dendritic change alone is neither specific to ALS nor diagnostic.",
  },
  {
    id: "axon-hillock",
    label: "Axon hillock",
    category: "Electrical trigger",
    normal:
      "The hillock and adjacent initial segment form the trigger zone where summed membrane signals can initiate an all-or-none action potential.",
    als:
      "Motor-neuron excitability can be altered in ALS, but findings vary with disease stage, motor-neuron subtype, and individual.",
  },
  {
    id: "axon",
    label: "Axon",
    category: "Output pathway",
    normal:
      "The axon rapidly conducts an electrical action potential from the spinal cord to muscle. A human lower motor axon can extend roughly a metre.",
    als:
      "Motor axons and especially distal branches can thin, retract, or fragment, disconnecting muscle even while some proximal neuron remains.",
  },
  {
    id: "myelin",
    label: "Myelin sheath",
    category: "Conduction support",
    normal:
      "Layered Schwann-cell membrane insulates the peripheral axon so impulses jump between nodes of Ranvier, making conduction fast and energy-efficient.",
    als:
      "Myelin can change secondarily when an axon degenerates, but primary demyelination is not the central defining mechanism of ALS.",
  },
  {
    id: "schwann-cell",
    label: "Schwann cell",
    category: "Peripheral glia",
    normal:
      "Myelinating Schwann cells wrap peripheral axons. Specialized terminal Schwann cells also help maintain and remodel the neuromuscular junction.",
    als:
      "Schwann-cell and terminal-glial responses may influence axon support, denervation, and repair, but ALS is not primarily a Schwann-cell disorder.",
  },
  {
    id: "mitochondria",
    label: "Mitochondria",
    category: "Energy & calcium",
    normal:
      "Mitochondria produce ATP, help buffer calcium, and are positioned where energy demand is high—including the axon and motor terminal.",
    als:
      "Mitochondrial dysfunction, altered shape or positioning, and impaired transport are implicated in ALS models and patient tissue, with variable contribution among patients.",
  },
  {
    id: "transport",
    label: "Axonal transport",
    category: "Cellular logistics",
    normal:
      "Motor proteins carry mitochondria, proteins, vesicles, and RNA along microtubules. Kinesins generally move cargo outward; dynein returns signals and worn material toward the soma.",
    als:
      "Cargo movement can slow or stall, depriving distant terminals of supplies and delaying return of damaged components. This is distinct from electrical impulse conduction.",
  },
  {
    id: "terminal",
    label: "Motor axon terminal",
    category: "Presynaptic ending",
    normal:
      "The terminal contains mitochondria and acetylcholine-filled vesicles. An arriving action potential triggers calcium-dependent transmitter release.",
    als:
      "Terminals may become unstable, withdraw from endplates, or degenerate. Distal change can occur early in some ALS models, but this is not a universal patient sequence.",
  },
  {
    id: "nmj",
    label: "Neuromuscular junction",
    category: "Nerve–muscle synapse",
    normal:
      "The NMJ is the specialized chemical synapse between a motor terminal and one skeletal-muscle fiber. It converts a nerve impulse into a muscle action potential.",
    als:
      "NMJs can become unstable and denervated, so otherwise contractile muscle fibers stop receiving effective commands and maintenance signals.",
  },
  {
    id: "acetylcholine",
    label: "Acetylcholine",
    category: "Neurotransmitter",
    normal:
      "Acetylcholine crosses the synaptic cleft and binds nicotinic receptors on the muscle endplate, depolarizing the fiber before being rapidly cleared.",
    als:
      "When a motor terminal retracts or degenerates, acetylcholine is no longer released effectively at that endplate. ALS is not a primary acetylcholine-deficiency disorder.",
  },
  {
    id: "muscle",
    label: "Muscle fiber",
    category: "Contractile target",
    normal:
      "A mature skeletal-muscle fiber is usually innervated by one alpha motor neuron. Electrical activation releases intracellular calcium so sarcomeres shorten and generate force.",
    als:
      "A newly denervated fiber may initially retain contractile machinery, but without stable nerve input it is not recruited normally and can progressively shrink.",
  },
  {
    id: "motor-unit",
    label: "Motor unit",
    category: "Whole system",
    normal:
      "One alpha motor neuron, its axon and neuromuscular junctions, and every skeletal-muscle fiber it innervates form a motor unit—the smallest independently recruited unit of force.",
    als:
      "As motor neurons and terminals are lost, motor units disappear. Surviving units may temporarily enlarge through reinnervation before compensation is exceeded.",
  },
  {
    id: "denervation",
    label: "Denervation",
    category: "Disease process",
    definition:
      "Loss of effective motor-nerve contact with a muscle endplate. Sustained denervation reduces recruitment and produces neurogenic atrophy. It has many causes and is not specific to ALS.",
    normal:
      "An intact motor terminal remains aligned with its muscle endplate and activates that fiber whenever the motor neuron fires.",
    als:
      "In ALS, denervation can follow withdrawal or degeneration of motor terminals and axons, leaving otherwise contractile fibers without effective motor input.",
  },
  {
    id: "reinnervation",
    label: "Reinnervation",
    category: "Compensation",
    definition:
      "Collateral sprouting from a surviving motor axon can reconnect denervated muscle fibers, enlarging that surviving motor unit and temporarily preserving force.",
    normal:
      "Motor units are normally stable, although peripheral motor axons retain some capacity to sprout and remodel after loss of neighboring input.",
    als:
      "This compensation may temporarily restore input to selected fibers, but it is finite and can be exceeded as additional motor neurons and axons are lost.",
  },
  {
    id: "atrophy",
    label: "Muscle atrophy",
    category: "Downstream consequence",
    definition:
      "Reduction in muscle-fiber size. In ALS, much of the displayed atrophy is neurogenic and follows sustained loss of motor input; it is not equivalent to age-related sarcopenia and is not diagnostic by itself.",
    normal:
      "Regular neural activation and trophic support help maintain muscle-fiber size, structure, metabolism, and coordinated recruitment.",
    als:
      "The model shows atrophy mainly as a downstream consequence of sustained denervation, not as the cause of motor-neuron degeneration.",
  },
];

export const SOURCES = [
  {
    label: "NINDS — Focus on Amyotrophic Lateral Sclerosis",
    href: "https://www.ninds.nih.gov/current-research/focus-disorders/focus-amyotrophic-lateral-sclerosis",
    supports: "ALS scope, motor-neuron degeneration, and heterogeneous disease mechanisms",
  },
  {
    label: "NINDS — Amyotrophic Lateral Sclerosis booklet (2025)",
    href: "https://www.ninds.nih.gov/sites/default/files/2025-05/NINDS_ALS_Booklet_Digital-508c.pdf",
    supports: "Upper- and lower-motor-neuron involvement, symptoms, evaluation, and diagnostic cautions",
  },
  {
    label: "The ALS Association — What is ALS?",
    href: "https://www.als.org/understanding-als/what-is-als",
    supports: "Patient-facing disease overview and progressive loss of motor function",
  },
  {
    label: "The ALS Association — Symptoms and diagnosis",
    href: "https://www.als.org/understanding-als/symptoms-diagnosis",
    supports: "Symptoms are not individually diagnostic and require clinical evaluation",
  },
  {
    label: "NCBI Bookshelf — The Motor Unit",
    href: "https://www.ncbi.nlm.nih.gov/books/NBK10874/",
    supports: "Motor-unit anatomy: one alpha motor neuron, its axon, junctions, and innervated fibers",
  },
  {
    label: "Molecular and Cellular Mechanisms Affected in ALS",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7564998/",
    supports: "Overlapping protein, RNA, mitochondrial, oxidative, and transport mechanisms",
  },
  {
    label: "Skeletal muscle in amyotrophic lateral sclerosis",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10629757/",
    supports: "Dynamic denervation–reinnervation at endplates and compensatory muscle responses",
  },
  {
    label: "Review of the Pathology of Muscle in ALS",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC13026879/",
    supports: "Neurogenic atrophy, fasciculations, motor-unit decline, and limits of individual findings",
  },
];
