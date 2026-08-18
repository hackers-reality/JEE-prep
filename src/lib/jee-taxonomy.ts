export const JEE_TAXONOMY = {
  PHYSICS: [
    "Units and Measurements", "Kinematics", "Laws of Motion", "Work Energy and Power",
    "Rotational Motion", "Gravitation", "Properties of Solids and Liquids", "Thermodynamics",
    "Kinetic Theory", "Oscillations and Waves", "Electrostatics", "Current Electricity",
    "Magnetic Effects of Current and Magnetism", "Electromagnetic Induction and Alternating Current",
    "Electromagnetic Waves", "Optics", "Dual Nature of Matter and Radiation", "Atoms and Nuclei",
    "Electronic Devices", "Experimental Skills",
  ],
  CHEMISTRY: [
    "Some Basic Concepts of Chemistry", "Atomic Structure", "Chemical Bonding and Molecular Structure",
    "Chemical Thermodynamics", "Solutions", "Equilibrium", "Redox Reactions and Electrochemistry",
    "Chemical Kinetics", "Classification of Elements and Periodicity", "p-Block Elements", "d- and f-Block Elements",
    "Coordination Compounds", "Organic Chemistry — Basic Principles", "Hydrocarbons", "Haloalkanes and Haloarenes",
    "Alcohols Phenols and Ethers", "Aldehydes Ketones and Carboxylic Acids", "Amines", "Biomolecules",
    "Practical Chemistry",
  ],
  MATHEMATICS: [
    "Sets Relations and Functions", "Complex Numbers and Quadratic Equations", "Matrices and Determinants",
    "Permutations and Combinations", "Binomial Theorem", "Sequence and Series", "Limits Continuity and Differentiability",
    "Integral Calculus", "Differential Equations", "Coordinate Geometry", "Three Dimensional Geometry",
    "Vector Algebra", "Statistics and Probability", "Trigonometry", "Mathematical Reasoning",
  ],
} as const;

export type JEESubject = keyof typeof JEE_TAXONOMY;
export function isJEESubject(value: string): value is JEESubject {
  return value in JEE_TAXONOMY;
}
