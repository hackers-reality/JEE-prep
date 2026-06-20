import "dotenv/config";
import { PrismaSqlite } from "prisma-adapter-sqlite";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaSqlite({
  url: process.env["DATABASE_URL"] ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function seedChemistry() {
  const subject = await prisma.subject.upsert({
    where: { name: "CHEMISTRY" },
    update: {},
    create: { name: "CHEMISTRY" },
  });
  console.log("Chemistry subject ready");

  const books = [
    { id: "book-chem-ncert-11", title: "NCERT Chemistry Part 1", classLevel: "CLASS_11" as const, isPrimary: true },
    { id: "book-chem-ncert-12", title: "NCERT Chemistry Part 2", classLevel: "CLASS_12" as const, isPrimary: true },
    { id: "book-chem-op-tandon", title: "OP Tandon Organic Chemistry", classLevel: "JEE_ADVANCED_ONLY" as const, isPrimary: false, referenceNote: "Best for organic reaction mechanisms" },
  ];

  for (const b of books) {
    await prisma.book.upsert({
      where: { id: b.id },
      update: {},
      create: { ...b, subjectId: subject.id },
    });
  }
  console.log("Chemistry books created");

  const chapters: {
    id: string; bookId: string; title: string; orderIndex: number;
    topics: {
      id: string; title: string; orderIndex: number; theory: string; sourceReference: string;
      formulas: { name: string; expression: string; derivation: string }[];
      examples: { question: string; solution: string; difficulty: "EASY" | "MEDIUM" | "HARD" | "JEE_ADVANCED" }[];
      mistakes: string[];
    }[];
  }[] = [
    {
      id: "ch-chem-11-mole", bookId: "book-chem-ncert-11", title: "Some Basic Concepts of Chemistry", orderIndex: 1,
      topics: [
        {
          id: "topic-chem-mole", title: "Mole Concept and Stoichiometry", orderIndex: 1,
          theory: `Mole: 1 mole = 6.022×10²³ particles (Avogadro's number N_A)

Molar mass: mass of one mole of a substance (g/mol)

Important relations:
• Number of moles n = mass/molar mass = N/N_A = V/22.4 L (at STP)
• Mass percentage = (mass of element/mass of compound) × 100
• Empirical formula: simplest whole-number ratio of atoms
• Molecular formula: (empirical formula)_n where n = molecular mass/empirical formula mass

Stoichiometry: calculations based on balanced chemical equations
• Limiting reagent: reactant that gets consumed first, limiting product formation
• Theoretical yield vs actual yield: % yield = (actual/theoretical) × 100`,
          sourceReference: "NCERT Chemistry Part 1, Chapter 1",
          formulas: [
            { name: "Number of Moles", expression: "n = m/M = N/N_A = V/22.4 L (at STP)", derivation: "n = mass/molar mass from definition. Also n = number of particles/N_A. For gases at STP, n = volume in L/22.4 L per mole." },
            { name: "Mass Percentage", expression: "Mass % = (mass of element / mass of compound) × 100", derivation: "Directly from the definition of percentage composition." },
          ],
          examples: [
            { question: "How many moles are in 36 g of H₂O? (Molar mass = 18 g/mol)", solution: "n = 36/18 = 2 moles", difficulty: "EASY" },
            { question: "2 mol of H₂ reacts with 1 mol of O₂ to form H₂O. Which is the limiting reagent?", solution: "2H₂ + O₂ → 2H₂O\nH₂:O₂ ratio needed = 2:1. Available: 2:1. Neither is limiting — both exactly match the stoichiometric ratio.", difficulty: "MEDIUM" },
          ],
          mistakes: ["STP conditions: 0°C (273 K) and 1 atm pressure. At STP, 1 mole of gas occupies 22.4 L. This changes at non-STP conditions — use PV = nRT instead."],
        },
      ],
    },
    {
      id: "ch-chem-11-atomic", bookId: "book-chem-ncert-11", title: "Structure of Atom", orderIndex: 2,
      topics: [
        {
          id: "topic-chem-atomic-structure", title: "Quantum Mechanical Model", orderIndex: 1,
          theory: `Bohr's model was improved by the quantum mechanical model:
• Heisenberg's Uncertainty Principle: Δx·Δp ≥ h/4π
• de Broglie: λ = h/mv (wave nature of particles)
• Schrödinger wave equation: Ĥψ = Eψ

Quantum numbers:
• n (principal): 1, 2, 3... — energy level
• l (azimuthal): 0 to n-1 — subshell (0=s, 1=p, 2=d, 3=f)
• m_l (magnetic): -l to +l — orbital orientation
• m_s (spin): +½, -½ — electron spin

Pauli Exclusion Principle: no two electrons can have all four QN same
Hund's Rule: electrons fill degenerate orbitals singly first
Aufbau Principle: electrons fill lowest energy orbitals first

Order of filling: 1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p, 5s, 4d, 5p, 6s...
(n+l) rule for energy ordering`,
          sourceReference: "NCERT Chemistry Part 1, Chapter 2",
          formulas: [
            { name: "Uncertainty Principle", expression: "Δx·Δp ≥ h/4π", derivation: "Heisenberg showed that the position and momentum of a particle cannot be measured simultaneously with arbitrary precision. Product of uncertainties has minimum h/4π." },
            { name: "de Broglie Wavelength", expression: "λ = h/mv = h/p", derivation: "de Broglie extended wave-particle duality: a particle of mass m moving with velocity v has wavelength λ = h/mv." },
          ],
          examples: [
            { question: "Write the electronic configuration of Fe (Z=26).", solution: "Fe: 1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶\nOr in noble gas notation: [Ar] 4s² 3d⁶", difficulty: "EASY" },
          ],
          mistakes: ["Energy ordering: 4s fills before 3d (lower energy), but in ions, electrons are removed from 4s first. Fe²⁺ = [Ar] 3d⁶, not [Ar] 4s² 3d⁴."],
        },
      ],
    },
    {
      id: "ch-chem-11-periodic", bookId: "book-chem-ncert-11", title: "Classification of Elements and Periodicity", orderIndex: 3,
      topics: [
        {
          id: "topic-chem-periodic", title: "Periodic Trends", orderIndex: 1,
          theory: `Modern periodic table: 18 groups, 7 periods
• s-block: groups 1-2
• p-block: groups 13-18
• d-block: groups 3-12 (transition elements)
• f-block: inner transition elements (lanthanides, actinides)

Periodic trends:
• Atomic radius: decreases across period, increases down group
• Ionization energy: increases across period, decreases down group
• Electronegativity: increases across period, decreases down group
• Electron affinity: generally increases across period

Exceptions:
• IE of N > O (half-filled stability)
• IE of Be > B (fully-filled s-orbital)
• IE of Mg > Al

Metallic character: decreases across period, increases down group`,
          sourceReference: "NCERT Chemistry Part 1, Chapter 3",
          formulas: [
            { name: "Screening/Shielding Effect", expression: "Z_eff = Z - σ", derivation: "σ (screening constant) accounts for inner electron shielding. Effective nuclear charge Z_eff = Z - σ. More shielding → larger atomic radius." },
          ],
          examples: [
            { question: "Arrange O, F, N in increasing order of ionization energy.", solution: "IE order: N < O < F\nBut note: N (1s²2s²2p³) has half-filled p-orbitals → extra stability → IE of N > O\nCorrect: O < N < F", difficulty: "MEDIUM" },
          ],
          mistakes: ["Though IE generally increases across a period, N has higher IE than O due to half-filled p³ stability. Remember these exceptions rather than applying the rule blindly."],
        },
      ],
    },
    {
      id: "ch-chem-11-bonding", bookId: "book-chem-ncert-11", title: "Chemical Bonding and Molecular Structure", orderIndex: 4,
      topics: [
        {
          id: "topic-chem-bonding", title: "VSEPR and Hybridization", orderIndex: 1,
          theory: `Ionic bond: complete transfer of electrons (electrostatic attraction)
Covalent bond: sharing of electrons

VSEPR Theory: electron pairs (bonding + lone pairs) repel each other
• 2 electron pairs: linear (180°)
• 3 pairs: trigonal planar (120°)
• 4 pairs: tetrahedral (109.5°)
• 5 pairs: trigonal bipyramidal (90°, 120°)
• 6 pairs: octahedral (90°)

Hybridization:
• sp: linear (BeCl₂)
• sp²: trigonal planar (BF₃)
• sp³: tetrahedral (CH₄)
• sp³d: trigonal bipyramidal (PCl₅)
• sp³d²: octahedral (SF₆)

Bond parameters: bond length, bond angle, bond enthalpy, bond order
Bond order = ½(bonding e⁻ - antibonding e⁻)

Dipole moment: μ = q×d (vector quantity)
Polar molecules have net dipole moment, non-polar have μ = 0`,
          sourceReference: "NCERT Chemistry Part 1, Chapter 4",
          formulas: [
            { name: "Bond Order (MO Theory)", expression: "Bond Order = ½(N_b - N_ab)", derivation: "In molecular orbital theory, bonding electrons N_b stabilize the molecule while antibonding N_ab destabilize. Bond order = (N_b - N_ab)/2." },
          ],
          examples: [
            { question: "Predict the shape and hybridization of NH₃ using VSEPR.", solution: "NH₃: N has 5 valence electrons + 3 from H = 8 electrons = 4 pairs\n3 bond pairs, 1 lone pair → tetrahedral electron pair geometry\nWith 1 lone pair, shape = trigonal pyramidal\nHybridization: sp³\nBond angle: 107° (less than 109.5° due to lone pair repulsion)", difficulty: "MEDIUM" },
          ],
          mistakes: ["VSEPR predicts molecular shape using electron pairs, not just atoms. Lone pairs occupy more space than bonding pairs, reducing bond angles. H₂O has 104.5°, not 109.5°."],
        },
      ],
    },
    {
      id: "ch-chem-11-organic", bookId: "book-chem-ncert-11", title: "Organic Chemistry — Some Basic Principles", orderIndex: 8,
      topics: [
        {
          id: "topic-chem-organic-basics", title: "Fundamentals of Organic Chemistry", orderIndex: 1,
          theory: `Organic chemistry: study of carbon compounds

Hybridization of carbon:
• sp³: tetrahedral, 109.5° (alkanes)
• sp²: trigonal planar, 120° (alkenes)
• sp: linear, 180° (alkynes)

Functional groups:
• -OH (alcohol), -CHO (aldehyde), -CO- (ketone)
• -COOH (carboxylic acid), -NH₂ (amine)
• -X (haloalkane), -NO₂ (nitro)

IUPAC Nomenclature: Prefix + Root + Suffix
1. Longest carbon chain as parent
2. Number to give substituents lowest locants
3. Alphabetical order for substituents

Isomerism:
• Structural: chain, position, functional group, metamerism
• Stereoisomerism: geometric (cis-trans), optical (chirality)

Electron displacement:
• Inductive effect: through σ bonds (I, -I)
• Resonance/mesomeric effect: through π bonds (R, -R)
• Hyperconjugation: σ→π conjugation
• Electromeric effect: temporary polarization`,
          sourceReference: "NCERT Chemistry Part 2, Chapter 8",
          formulas: [],
          examples: [
            { question: "Give the IUPAC name of CH₃-CH(CH₃)-CH₂-COOH.", solution: "Longest chain with -COOH = 4 carbons (butanoic acid)\nMethyl substituent at C-3\nName: 3-methylbutanoic acid", difficulty: "EASY" },
          ],
          mistakes: ["In IUPAC naming, the -COOH carbon is always C-1 for carboxylic acids. Don't start numbering from the other end even if it gives lower numbers to substituents."],
        },
      ],
    },
    // Class 12 chapters
    {
      id: "ch-chem-12-solutions", bookId: "book-chem-ncert-12", title: "Solutions", orderIndex: 1,
      topics: [
        {
          id: "topic-chem-solutions", title: "Concentration and Colligative Properties", orderIndex: 1,
          theory: `Ways to express concentration:
• Mass percentage = (mass of solute/mass of solution) × 100
• Mole fraction: x_A = n_A/(n_A + n_B)
• Molarity (M) = moles of solute/L of solution
• Molality (m) = moles of solute/kg of solvent

Colligative properties (depend only on number of solute particles):
1. Relative lowering of vapor pressure: (P₀ - P)/P₀ = x₂ (Raoult's Law)
2. Elevation of boiling point: ΔT_b = K_b × m
3. Depression of freezing point: ΔT_f = K_f × m
4. Osmotic pressure: π = CRT

van't Hoff factor i = actual number of particles/formula units
For electrolytes: i > 1 (dissociation)
For association: i < 1

Real solutions may deviate from Raoult's Law:
• Positive deviation: A-B interactions weaker than A-A and B-B
• Negative deviation: A-B interactions stronger`,
          sourceReference: "NCERT Chemistry Part 2, Chapter 1",
          formulas: [
            { name: "Raoult's Law", expression: "P = P₀x_A (P = partial pressure, x_A = mole fraction of solvent)", derivation: "Raoult found that vapor pressure of a solution is proportional to mole fraction of the solvent. For non-volatile solute: P = P₀x₁, so ΔP/P₀ = x₂." },
            { name: "Osmotic Pressure", expression: "π = iCRT", derivation: "van't Hoff derived π = CRT for dilute solutions, analogous to ideal gas law PV = nRT. For electrolytes, include van't Hoff factor i." },
          ],
          examples: [
            { question: "What is the freezing point of a solution containing 18 g of glucose (C₆H₁₂O₆) in 500 g of water? K_f for water = 1.86 K·kg/mol.", solution: "n_glucose = 18/180 = 0.1 mol\nm = 0.1/0.5 = 0.2 mol/kg\nΔT_f = 1.86 × 0.2 = 0.372 K\nFreezing point = 0 - 0.372 = -0.372°C", difficulty: "MEDIUM" },
          ],
          mistakes: ["Molarity (M) changes with temperature because volume changes. Molality (m) is temperature-independent because it uses mass of solvent. Use molality for colligative property calculations."],
        },
      ],
    },
    {
      id: "ch-chem-12-electrochem", bookId: "book-chem-ncert-12", title: "Electrochemistry", orderIndex: 2,
      topics: [
        {
          id: "topic-chem-electrochem", title: "Electrochemical Cells and Nernst Equation", orderIndex: 1,
          theory: `Electrochemical cells convert chemical energy to electrical (galvanic) or vice versa (electrolytic).

Standard electrode potential E°: measured against SHE (Standard Hydrogen Electrode)

EMF of cell: E°_cell = E°_cathode - E°_anode

Nernst Equation: E = E° - (RT/nF) lnQ
At 298 K: E = E° - (0.0591/n) logQ

Faraday's Laws:
• Mass of substance deposited ∝ charge passed
• m = ZIt = (M/nF)It

Conductivity: κ = 1/ρ (ρ = resistivity)
Molar conductivity: Λ_m = κ/c
Kohlrausch's Law: Λ° = λ°_+ + λ°_- (independent migration of ions)

Batteries: primary (non-rechargeable) vs secondary (rechargeable)
Fuel cells: continuous supply of reactants`,
          sourceReference: "NCERT Chemistry Part 2, Chapter 2",
          formulas: [
            { name: "Nernst Equation", expression: "E = E° - (RT/nF) lnQ", derivation: "From thermodynamics: ΔG = ΔG° + RT lnQ. Since ΔG = -nFE, we get -nFE = -nFE° + RT lnQ. Rearranging: E = E° - (RT/nF) lnQ." },
            { name: "Faraday's First Law", expression: "m = ZIt = (M/nF)It", derivation: "Electrochemical equivalent Z = M/nF. Mass deposited m = ZQ = ZIt." },
          ],
          examples: [
            { question: "Calculate EMF of Zn(s)|Zn²⁺(0.1M)||Cu²⁺(0.01M)|Cu(s). E°_Zn²⁺/Zn = -0.76 V, E°_Cu²⁺/Cu = +0.34 V", solution: "E°_cell = 0.34 - (-0.76) = 1.10 V\nE = 1.10 - (0.0591/2) log(0.1/0.01) = 1.10 - 0.0296 × 1 = 1.07 V", difficulty: "MEDIUM" },
          ],
          mistakes: ["In the Nernst equation, Q uses concentrations of aqueous species, not solids or pure liquids. For the reaction Zn + Cu²⁺ → Zn²⁺ + Cu, Q = [Zn²⁺]/[Cu²⁺]."],
        },
      ],
    },
    {
      id: "ch-chem-12-chemical-kinetics", bookId: "book-chem-ncert-12", title: "Chemical Kinetics", orderIndex: 3,
      topics: [
        {
          id: "topic-chem-kinetics", title: "Rate Laws and Order of Reactions", orderIndex: 1,
          theory: `Rate of reaction: r = -d[R]/dt = +d[P]/dt

Rate law: r = k[A]ᵃ[B]ᵇ (a, b determined experimentally)
Order of reaction = a + b (sum of exponents)
Molecularity = number of molecules in elementary step

Zero-order: r = k, [A] = [A]₀ - kt, t_½ = [A]₀/2k
First-order: r = k[A], ln[A] = ln[A]₀ - kt, t_½ = 0.693/k
Second-order: r = k[A]², 1/[A] = 1/[A]₀ + kt

Arrhenius Equation: k = Ae^(-Ea/RT)
ln(k₂/k₁) = (Ea/R)(1/T₁ - 1/T₂)

Activation energy Eₐ: minimum energy required for reaction
Catalyst: lowers Eₐ without being consumed`,
          sourceReference: "NCERT Chemistry Part 2, Chapter 3",
          formulas: [
            { name: "Arrhenius Equation", expression: "k = Ae^(-Ea/RT)", derivation: "Derived from empirical observation and collision theory. A is frequency factor, e^(-Ea/RT) is fraction of molecules with energy ≥ Ea. ln k = ln A - Ea/RT." },
            { name: "First-Order Half-Life", expression: "t_½ = 0.693/k", derivation: "For first order: ln([A]₀/[A]) = kt. At t = t_½, [A] = [A]₀/2. ln(2) = kt_½, so t_½ = ln(2)/k = 0.693/k." },
          ],
          examples: [
            { question: "A first-order reaction has rate constant k = 0.0693 s⁻¹. Find the time for concentration to reduce to 1/16 of initial value.", solution: "For first-order: [A] = [A]₀/e^(kt)\n[A]₀/[A] = e^(kt) = 16\nkt = ln(16) = 2.773\nHalf-lives: t_½ = 0.693/0.0693 = 10 s\nNumber of half-lives for 1/16: 4 half-lives = 40 s", difficulty: "MEDIUM" },
          ],
          mistakes: ["Order of reaction MUST be determined experimentally, not from stoichiometric coefficients. For example, 2NO₂ + F₂ → 2NO₂F has rate = k[NO₂][F₂], which is first-order in each, not second in NO₂."],
        },
      ],
    },
    {
      id: "ch-chem-12-organic-compounds", bookId: "book-chem-ncert-12", title: "Organic Compounds Containing Oxygen", orderIndex: 7,
      topics: [
        {
          id: "topic-chem-carbonyl", title: "Aldehydes, Ketones and Carboxylic Acids", orderIndex: 1,
          theory: `Aldehydes (R-CHO) and Ketones (R-CO-R'): contain carbonyl group C=O
• Named: aldehydes -al, ketones -one

Nucleophilic addition: characteristic reaction of carbonyls
• With HCN: cyanohydrins (synthetic intermediates)
• With NH₂OH: oximes (derivatives for identification)
• With C₆H₅NHNH₂: phenylhydrazones
• Aldol condensation: with dil. NaOH/NaOD

Aldehydes are more reactive than ketones (less steric hindrance + more polar)

Oxidation:
• Aldehydes → Carboxylic acids (Tollens', Fehling's tests distinguish them from ketones)
• Ketones resist mild oxidation (C-C bond cleavage only with strong oxidants)

Carboxylic acids: R-COOH
• Acidity: stronger than alcohols and phenols
• Electron-withdrawing groups increase acidity
• Electron-donating groups decrease acidity`,
          sourceReference: "NCERT Chemistry Part 2, Chapter 8",
          formulas: [],
          examples: [
            { question: "How would you distinguish between acetaldehyde and acetone? Give chemical tests.", solution: "1. Tollens' test: acetaldehyde gives silver mirror, acetone does not\n2. Fehling's test: acetaldehyde gives red precipitate of Cu₂O, acetone does not\n3. Iodoform test: Both give positive (acetaldehyde gives CHI₃ with I₂/NaOH, acetone also gives iodoform)", difficulty: "MEDIUM" },
          ],
          mistakes: ["Ketones do NOT give Tollens' or Fehling's tests (mild oxidizing agents). But ketones with an adjacent methyl group (like CH₃-CO-R) do give a positive iodoform test."],
        },
      ],
    },
  ];

  for (const ch of chapters) {
    await prisma.chapter.upsert({
      where: { id: ch.id },
      update: {},
      create: { id: ch.id, title: ch.title, bookId: ch.bookId, orderIndex: ch.orderIndex },
    });
    for (const t of ch.topics) {
      await prisma.topic.upsert({
        where: { id: t.id },
        update: {},
        create: { id: t.id, title: t.title, chapterId: ch.id, orderIndex: t.orderIndex, theory: t.theory, sourceReference: t.sourceReference, needsReview: true },
      });
      for (let i = 0; i < t.formulas.length; i++) {
        await prisma.formula.upsert({
          where: { id: `f-${t.id}-${i}` }, update: {},
          create: { id: `f-${t.id}-${i}`, topicId: t.id, name: t.formulas[i].name, expression: t.formulas[i].expression, derivation: t.formulas[i].derivation, orderIndex: i },
        });
      }
      for (let i = 0; i < t.examples.length; i++) {
        await prisma.solvedExample.upsert({
          where: { id: `ex-${t.id}-${i}` }, update: {},
          create: { id: `ex-${t.id}-${i}`, topicId: t.id, question: t.examples[i].question, solution: t.examples[i].solution, difficulty: t.examples[i].difficulty, orderIndex: i },
        });
      }
      for (let i = 0; i < t.mistakes.length; i++) {
        await prisma.commonMistake.upsert({
          where: { id: `mist-${t.id}-${i}` }, update: {},
          create: { id: `mist-${t.id}-${i}`, topicId: t.id, description: t.mistakes[i] },
        });
      }
    }
  }

  console.log(`Chemistry seed complete — ${chapters.length} chapters`);
}

seedChemistry()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
