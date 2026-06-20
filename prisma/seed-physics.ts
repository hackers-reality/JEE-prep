import "dotenv/config";
import { PrismaSqlite } from "prisma-adapter-sqlite";
import { PrismaClient } from "../src/generated/prisma/client";
import type { Difficulty, PrismaClient as PrismaClientType } from "../src/generated/prisma/client";

const _adapter = new PrismaSqlite({
  url: process.env["DATABASE_URL"] ?? "file:./prisma/dev.db",
});
let prisma: PrismaClientType = new PrismaClient({ adapter: _adapter });

export async function seedPhysics(p?: PrismaClientType) {
  if (p) prisma = p;
  const subject = await prisma.subject.upsert({
    where: { name: "PHYSICS" },
    update: {},
    create: { name: "PHYSICS" },
  });
  console.log("Physics subject ready");

  const books: { id: string; title: string; classLevel: "CLASS_11" | "CLASS_12" | "JEE_ADVANCED_ONLY"; isPrimary: boolean; referenceNote?: string }[] = [
    { id: "book-phys-ncert-11", title: "NCERT Physics Part 1", classLevel: "CLASS_11", isPrimary: true },
    { id: "book-phys-ncert-12", title: "NCERT Physics Part 2", classLevel: "CLASS_12", isPrimary: true },
    { id: "book-phys-hcv-1", title: "HC Verma Concepts of Physics Vol 1", classLevel: "CLASS_11", isPrimary: false, referenceNote: "Best for concept clarity and problem-solving depth" },
    { id: "book-phys-hcv-2", title: "HC Verma Concepts of Physics Vol 2", classLevel: "CLASS_12", isPrimary: false, referenceNote: "Best for concept clarity and problem-solving depth" },
    { id: "book-phys-irodov", title: "IE Irodov Problems in General Physics", classLevel: "JEE_ADVANCED_ONLY", isPrimary: false, referenceNote: "Best for JEE Advanced problem difficulty" },
  ];

  for (const b of books) {
    await prisma.book.upsert({
      where: { id: b.id },
      update: {},
      create: { ...b, subjectId: subject.id },
    });
  }
  console.log("Physics books created");

  const chapters: {
    id: string; bookId: string; title: string; orderIndex: number;
    topics: {
      id: string; title: string; orderIndex: number;
      theory: string;
      sourceReference: string;
      formulas: { name: string; expression: string; derivation: string }[];
      examples: { question: string; solution: string; difficulty: "EASY" | "MEDIUM" | "HARD" | "JEE_ADVANCED" }[];
      mistakes: string[];
    }[];
  }[] = [
    {
      id: "ch-phys-11-units", bookId: "book-phys-ncert-11", title: "Units and Measurements", orderIndex: 1,
      topics: [
        {
          id: "topic-phys-units", title: "Units and Dimensions", orderIndex: 1,
          theory: `Physical quantities are measured using standard units. The SI system defines seven base units: meter (length), kilogram (mass), second (time), ampere (current), kelvin (temperature), mole (amount of substance), and candela (luminous intensity).

Dimensional analysis is a powerful tool:
• Dimensions of a physical quantity represent its dependence on base quantities
• Expressed as [M^a L^b T^c] for mass, length, time
• Used to check equation consistency and derive relations

Principle of homogeneity: In a valid physical equation, all terms must have the same dimensions.

Significant figures indicate the precision of a measurement. Rules:
• All non-zero digits are significant
• Zeros between non-zero digits are significant
• Leading zeros are not significant
• Trailing zeros after decimal are significant`,
          sourceReference: "NCERT Physics Part 1, Chapter 1",
          formulas: [
            { name: "Dimensional Formula", expression: "[Physical Quantity] = M^a L^b T^c", derivation: "Any physical quantity Q can be expressed as Q = M^a L^b T^c where a, b, c are integers/fractions determined by the definition of Q. For example, velocity = length/time, so [v] = [L]/[T] = M^0 L^1 T^{-1}" },
            { name: "Percentage Error", expression: "Percentage Error = |True Value - Measured Value| / True Value × 100%", derivation: "Absolute error Δa = |a₀ - a| where a₀ is true value and a is measured value. Relative error = Δa/a₀. Percentage error = (Δa/a₀) × 100%" },
          ],
          examples: [
            { question: "Find the dimensions of force.", solution: "Force = mass × acceleration = mass × (velocity/time) = mass × (length/time²) = M L T^{-2}\nSo [F] = M^1 L^1 T^{-2}", difficulty: "EASY" },
            { question: "Check the correctness of the equation T = 2π√(L/g) using dimensional analysis, where T is time period, L is length, g is acceleration due to gravity.", solution: "LHS: [T] = T (time)\nRHS: [2π] = dimensionless, [√(L/g)] = √(L/LT^{-2}) = √(T²) = T\nBoth sides have dimension T, so the equation is dimensionally correct.", difficulty: "MEDIUM" },
            { question: "Using dimensional analysis, derive the relation for the period of a simple pendulum. Assume T depends on mass m, length l, and acceleration due to gravity g.", solution: "Assume T = k × m^a × l^b × g^c\n[T] = M^0 L^0 T^1, [m] = M, [l] = L, [g] = L T^{-2}\nM: a = 0\nL: b + c = 0\nT: -2c = 1\nSolving: a = 0, c = -½, b = ½\nT = k × m^0 × l^½ × g^{-½} = k√(l/g)\nExperiment gives k = 2π, so T = 2π√(l/g)", difficulty: "HARD" },
          ],
          mistakes: ["Students often confuse dimensions with units. Dimensions are qualitative (what base quantities), units are quantitative (specific standards).", "When checking dimensional consistency, dimensionless constants and trigonometric functions have no dimensions — don't assign dimensions to them."],
        },
        {
          id: "topic-phys-significant", title: "Significant Figures and Errors", orderIndex: 2,
          theory: `In measurements, significant figures represent the precision of the instrument.

Rules for arithmetic operations:
• Addition/Subtraction: result has same decimal places as the least precise measurement
• Multiplication/Division: result has same significant figures as the measurement with fewest SF

Error propagation:
• For sum/difference: absolute errors add: ΔZ = ΔA + ΔB
• For product/quotient: relative errors add: ΔZ/Z = ΔA/A + ΔB/B
• For powers: ΔZ/Z = n(ΔA/A) for Z = Aⁿ`,
          sourceReference: "NCERT Physics Part 1, Chapter 1",
          formulas: [
            { name: "Error in Product", expression: "ΔZ/Z = ΔA/A + ΔB/B (for Z = A × B or Z = A/B)", derivation: "For Z = AB: Z + ΔZ = (A + ΔA)(B + ΔB) = AB + AΔB + BΔA + ΔAΔB. Neglecting ΔAΔB: ΔZ = AΔB + BΔA. Dividing by Z = AB: ΔZ/Z = ΔA/A + ΔB/B." },
          ],
          examples: [
            { question: "The length and breadth of a rectangle are measured as l = 5.7 ± 0.1 cm and b = 3.4 ± 0.1 cm. Find the area with error limits.", solution: "Area A = l × b = 5.7 × 3.4 = 19.38 cm²\nΔA/A = Δl/l + Δb/b = 0.1/5.7 + 0.1/3.4 = 0.018 + 0.029 = 0.047\nΔA = 0.047 × 19.38 = 0.91 cm²\nArea = 19.4 ± 0.9 cm²", difficulty: "EASY" },
          ],
          mistakes: ["When multiplying/ dividing, don't round intermediate results. Round only the final answer to the correct significant figures."],
        },
      ],
    },
    {
      id: "ch-phys-11-motion-straight", bookId: "book-phys-ncert-11", title: "Motion in a Straight Line", orderIndex: 2,
      topics: [
        {
          id: "topic-distance-displacement", title: "Distance and Displacement", orderIndex: 1,
          theory: `Distance is the total length of the actual path. Scalar quantity. Always positive. Depends on path.

Displacement is the shortest straight-line distance between initial and final positions. Vector quantity. Can be positive, negative, or zero. Depends only on endpoints.

Distance ≥ |Displacement| always.
For a closed path, displacement = 0, distance > 0.`,
          sourceReference: "NCERT Physics Part 1, Chapter 2",
          formulas: [
            { name: "Displacement", expression: "Δx = x₂ - x₁", derivation: "Displacement is the change in position. In one dimension, if a particle moves from x₁ to x₂, displacement Δx = x₂ - x₁." },
          ],
          examples: [
            { question: "A car travels 40 km east, then 30 km north. Find total distance and displacement.", solution: "Distance = 40 + 30 = 70 km\nDisplacement = √(40² + 30²) = 50 km at θ = tan⁻¹(30/40) = 36.87° north of east", difficulty: "EASY" },
            { question: "A person walks along a circular track of radius 100 m from A to the diametrically opposite point B. Find distance and displacement.", solution: "Distance = πR = 100π = 314.16 m\nDisplacement = 2R = 200 m (diameter)", difficulty: "MEDIUM" },
          ],
          mistakes: ["Using distance instead of displacement in velocity calculations. Velocity = displacement/time, NOT distance/time."],
        },
        {
          id: "topic-speed-velocity", title: "Speed and Velocity", orderIndex: 2,
          theory: `Speed = distance/time (scalar). Velocity = displacement/time (vector).

Average speed = total distance / total time
Average velocity = total displacement / total time

Instantaneous velocity v = dx/dt (rate of change of position)

For motion in a straight line:
• If velocity is constant: x = x₀ + vt
• Speed is always ≥ 0
• |Velocity| ≤ Speed`,
          sourceReference: "NCERT Physics Part 1, Chapter 2",
          formulas: [
            { name: "Average Speed", expression: "v_avg = Total distance / Total time", derivation: "By definition, average speed is the ratio of total path length to total time interval." },
            { name: "Instantaneous Velocity", expression: "v = lim(Δt→0) Δx/Δt = dx/dt", derivation: "As the time interval approaches zero, the average velocity approaches the instantaneous velocity, which is the derivative of position with respect to time." },
          ],
          examples: [
            { question: "A car travels A→B (120 km) at 60 km/h, returns at 40 km/h. Find average speed and velocity.", solution: "Average speed = 240/5 = 48 km/h\nAverage velocity = 0 km/h (displacement = 0)", difficulty: "EASY" },
            { question: "Position x(t) = 2t² - 4t + 3. Find average velocity between t=1s and t=3s, and instantaneous velocity at t=2s.", solution: "x(1)=1, x(3)=9, avg v = 8/2 = 4 m/s\nv(t)=4t-4, v(2)=4 m/s", difficulty: "MEDIUM" },
          ],
          mistakes: ["Average speed ≠ average of speeds. Average speed = total distance/total time, not (v₁+v₂)/2."],
        },
        {
          id: "topic-acceleration", title: "Acceleration", orderIndex: 3,
          theory: `Acceleration = rate of change of velocity = dv/dt = d²x/dt².

Equations of motion (constant acceleration):
1. v = u + at
2. s = ut + ½at²
3. v² = u² + 2as

For non-uniform acceleration, use calculus:
v = ∫a dt, x = ∫v dt`,
          sourceReference: "NCERT Physics Part 1, Chapter 2",
          formulas: [
            { name: "First Equation of Motion", expression: "v = u + at", derivation: "a = dv/dt. For constant a: ∫dv = a∫dt → v - u = a(t - 0) → v = u + at" },
            { name: "Second Equation of Motion", expression: "s = ut + ½at²", derivation: "s = (u+v)t/2 = (u+u+at)t/2 = ut + ½at²" },
          ],
          examples: [
            { question: "Car starts from rest, accelerates at 2 m/s² for 10 s. Find final velocity and distance.", solution: "v = 0 + 2(10) = 20 m/s\ns = 0 + ½(2)(100) = 100 m", difficulty: "EASY" },
            { question: "Particle at 10 m/s comes to rest in 50 m with uniform deceleration. Find a and t.", solution: "v² = u² + 2as → 0 = 100 + 100a → a = -1 m/s²\nv = u + at → 0 = 10 - t → t = 10 s", difficulty: "MEDIUM" },
          ],
          mistakes: ["Equations of motion ONLY work for constant acceleration. Don't use them for variable acceleration — use calculus instead."],
        },
      ],
    },
    {
      id: "ch-phys-11-motion-plane", bookId: "book-phys-ncert-11", title: "Motion in a Plane", orderIndex: 3,
      topics: [
        {
          id: "topic-vectors", title: "Vectors and Projectile Motion", orderIndex: 1,
          theory: `Vectors have magnitude and direction. Represented as A = Aₓî + Aᵧĵ.

Vector operations:
• Addition: R = A + B (parallelogram law)
• Dot product: A·B = AB cosθ = AₓBₓ + AᵧBᵧ
• Cross product: |A×B| = AB sinθ (direction: perpendicular to both)

Projectile motion: object launched at angle θ with velocity u.
• Horizontal: x = u cosθ × t (constant velocity)
• Vertical: y = u sinθ × t - ½gt² (constant acceleration g)
• Range R = u²sin2θ/g
• Max height H = u²sin²θ/2g
• Time of flight T = 2u sinθ/g
• Maximum range at θ = 45°`,
          sourceReference: "NCERT Physics Part 1, Chapter 3",
          formulas: [
            { name: "Projectile Range", expression: "R = u²sin2θ/g", derivation: "Time of flight T = 2u sinθ/g. Range = horizontal velocity × time = u cosθ × 2u sinθ/g = u²(2sinθcosθ)/g = u²sin2θ/g" },
            { name: "Maximum Height", expression: "H = u²sin²θ/2g", derivation: "At max height, vᵧ = 0. vᵧ² = u²sin²θ - 2gH. Setting vᵧ = 0: H = u²sin²θ/2g" },
          ],
          examples: [
            { question: "A ball is thrown at 20 m/s at 30° to horizontal. Find range and max height. (g=10 m/s²)", solution: "R = u²sin2θ/g = 400×sin60°/10 = 400×0.866/10 = 34.64 m\nH = u²sin²θ/2g = 400×0.25/20 = 5 m", difficulty: "EASY" },
            { question: "Prove that maximum range occurs at θ = 45°. Derive the expression for maximum range.", solution: "R = u²sin2θ/g. For given u, R is max when sin2θ = 1, i.e., 2θ = 90°, θ = 45°.\nR_max = u²/g", difficulty: "MEDIUM" },
          ],
          mistakes: ["Don't forget that range formula R = u²sin2θ/g assumes launch and landing at same height. For different heights, use full projectile equations."],
        },
      ],
    },
    {
      id: "ch-phys-11-laws-motion", bookId: "book-phys-ncert-11", title: "Laws of Motion", orderIndex: 4,
      topics: [
        {
          id: "topic-newton-laws", title: "Newton's Laws and Friction", orderIndex: 1,
          theory: `Newton's First Law: An object at rest stays at rest, an object in motion stays in motion with constant velocity, unless acted upon by an unbalanced external force. (Law of Inertia)

Newton's Second Law: F = ma = dp/dt. The net force on an object equals its mass times acceleration.

Newton's Third Law: For every action, there is an equal and opposite reaction. Action-reaction pairs act on DIFFERENT bodies.

Friction: f ≤ μN (static), f = μₖN (kinetic)
• μₛ > μₖ typically
• Friction opposes relative motion
• Angle of repose: tanθ = μₛ`,
          sourceReference: "NCERT Physics Part 1, Chapter 4",
          formulas: [
            { name: "Newton's Second Law", expression: "F_net = ma = dp/dt", derivation: "Momentum p = mv. Rate of change of momentum dp/dt = d(mv)/dt = m(dv/dt) = ma (for constant mass). So F = dp/dt = ma." },
            { name: "Friction Force", expression: "fₛ ≤ μₛN, fₖ = μₖN", derivation: "Experimental: friction force is proportional to normal reaction N. Static friction increases up to a maximum μₛN. Once motion starts, kinetic friction μₖN takes over, where μₖ < μₛ." },
          ],
          examples: [
            { question: "A 5 kg block is pulled with 20 N on a frictionless surface. Find acceleration.", solution: "F = ma → a = 20/5 = 4 m/s²", difficulty: "EASY" },
            { question: "A 10 kg block is on a rough horizontal surface (μₛ = 0.4, μₖ = 0.3). A force of 30 N is applied. Will it move? If yes, find acceleration. (g = 10 m/s²)", solution: "N = mg = 100 N\nMax static friction f_max = μₛN = 0.4×100 = 40 N\nApplied 30 N < 40 N, so it does NOT move. a = 0.", difficulty: "MEDIUM" },
          ],
          mistakes: ["Action-reaction pairs act on DIFFERENT bodies, not the same body. A book on a table: Earth pulls book down (gravity), table pushes book up (normal). These are NOT action-reaction pairs — they act on the SAME body."],
        },
      ],
    },
    {
      id: "ch-phys-11-work-energy", bookId: "book-phys-ncert-11", title: "Work, Energy and Power", orderIndex: 5,
      topics: [
        {
          id: "topic-work-energy", title: "Work-Energy Theorem", orderIndex: 1,
          theory: `Work done by a constant force: W = F·s = Fs cosθ

Kinetic energy: KE = ½mv²
Potential energy (gravitational): PE = mgh
Potential energy (spring): PE = ½kx²

Work-Energy Theorem: Net work = Change in KE = ½mv² - ½mu²

Conservative forces: work done is path-independent (gravity, spring)
Non-conservative forces: work depends on path (friction)

Law of Conservation of Mechanical Energy: For conservative forces only, KE + PE = constant.

Power: P = W/t = F·v (instantaneous: P = F·v cosθ)`,
          sourceReference: "NCERT Physics Part 1, Chapter 5",
          formulas: [
            { name: "Work-Energy Theorem", expression: "W_net = ΔKE = ½mv² - ½mu²", derivation: "W = ∫F·dx = ∫ma·dx = ∫m(dv/dt)·dx = ∫mv·dv = ½mv² - ½mu²" },
            { name: "Power", expression: "P = F·v = Fv cosθ", derivation: "P = dW/dt = F·dx/dt = F·v" },
          ],
          examples: [
            { question: "A 2 kg object is dropped from height 10 m. Find its velocity just before hitting ground. (g = 10 m/s²)", solution: "By conservation of energy: mgh = ½mv²\nv = √(2gh) = √(2×10×10) = √200 = 14.14 m/s", difficulty: "EASY" },
            { question: "A block of mass 5 kg slides down a rough incline (θ = 30°, μₖ = 0.2) of length 10 m. Find velocity at bottom. (g = 10 m/s²)", solution: "Net force along incline = mg sinθ - μₖmg cosθ = 5×10×0.5 - 0.2×5×10×0.866 = 25 - 8.66 = 16.34 N\na = 16.34/5 = 3.27 m/s²\nv² = 2as = 2×3.27×10 = 65.4, v = 8.09 m/s", difficulty: "HARD" },
          ],
          mistakes: ["Work is done by a force only when there is displacement IN THE DIRECTION of the force. Carrying a heavy bag while walking horizontally: vertical force of bag does no work on horizontal displacement."],
        },
      ],
    },
    {
      id: "ch-phys-11-gravitation", bookId: "book-phys-ncert-11", title: "Gravitation", orderIndex: 6,
      topics: [
        {
          id: "topic-gravitation", title: "Universal Law of Gravitation", orderIndex: 1,
          theory: `Newton's Universal Law of Gravitation: F = Gm₁m₂/r²

G = 6.67×10⁻¹¹ N·m²/kg² (universal gravitational constant)

Acceleration due to gravity: g = GM/R² (at Earth's surface)
Variation with height: g(h) = g(1 - 2h/R) for h << R
Variation with depth: g(d) = g(1 - d/R)

Kepler's Laws:
1. Planets move in elliptical orbits with Sun at one focus
2. Areal velocity is constant (sweeps equal areas in equal times)
3. T² ∝ a³ (T = period, a = semi-major axis)

Escape velocity: vₑ = √(2GM/R) = √(2gR) ≈ 11.2 km/s for Earth`,
          sourceReference: "NCERT Physics Part 1, Chapter 7",
          formulas: [
            { name: "Gravitational Force", expression: "F = Gm₁m₂/r²", derivation: "Newton postulated that the force between masses follows an inverse-square law, verified by celestial mechanics and terrestrial experiments. The constant G was measured by Cavendish." },
            { name: "Escape Velocity", expression: "vₑ = √(2GM/R)", derivation: "For a body to escape, its KE must equal the magnitude of gravitational PE: ½mv² = GMm/R. Solving: v = √(2GM/R) = √(2gR)." },
          ],
          examples: [
            { question: "Calculate the force between Earth (6×10²⁴ kg) and Moon (7.4×10²² kg) at distance 3.84×10⁸ m. G = 6.67×10⁻¹¹.", solution: "F = Gm₁m₂/r² = 6.67×10⁻¹¹ × 6×10²⁴ × 7.4×10²² / (3.84×10⁸)²\n= 6.67×6×7.4 × 10³⁵ / 14.75×10¹⁶\n= 296.15 × 10¹⁸ = 2.02 × 10²⁰ N", difficulty: "MEDIUM" },
          ],
          mistakes: ["Don't confuse g (acceleration due to gravity ≈ 9.8 m/s²) with G (universal gravitational constant = 6.67×10⁻¹¹). They are fundamentally different — g varies by location, G is universal."],
        },
      ],
    },
  ];

  // ─── Class 12 Physics ───
  const class12Chapters = [
    {
      id: "ch-phys-12-electrostatics", bookId: "book-phys-ncert-12", title: "Electrostatics", orderIndex: 1,
      topics: [
        {
          id: "topic-phys-coulomb", title: "Coulomb's Law and Electric Field", orderIndex: 1,
          theory: `Coulomb's Law: F = kq₁q₂/r² where k = 1/(4πε₀) = 9×10⁹ N·m²/C²

Electric field E = F/q₀ = kQ/r² (for a point charge)
Principle of superposition: net E = vector sum of individual fields

Electric field lines:
• Start at positive charges, end at negative charges
• Never cross each other
• Density of lines indicates field strength

Electric dipole: two equal and opposite charges separated by distance 2a.
• Dipole moment p = q(2a) (direction from -q to +q)
• Field on axial line: E = 2kp/r³
• Field on equatorial line: E = kp/r³`,
          sourceReference: "NCERT Physics Part 2, Chapter 1",
          formulas: [
            { name: "Coulomb's Law", expression: "F = kq₁q₂/r² = q₁q₂/4πε₀r²", derivation: "Coulomb experimentally established that force between two charges is proportional to product of charges and inversely proportional to square of distance. The constant k = 9×10⁹ N·m²/C² = 1/4πε₀." },
            { name: "Electric Field of Point Charge", expression: "E = kQ/r²", derivation: "E = F/q₀ = (kQq₀/r²)/q₀ = kQ/r². Direction is radially outward for +Q, inward for -Q." },
          ],
          examples: [
            { question: "Two charges +2μC and -3μC are placed 10 cm apart. Find the force between them.", solution: "F = 9×10⁹ × (2×10⁻⁶)(-3×10⁻⁶)/(0.1)² = 9×10⁹ × (-6×10⁻¹²)/0.01 = -5.4 N (attractive)", difficulty: "EASY" },
            { question: "Find electric field at the midpoint of a dipole with charges ±2μC separated by 4 cm.", solution: "On axial line: E = 2kp/r³. p = 2×10⁻⁶ × 0.04 = 8×10⁻⁸ C·m. r = 0.02 m.\nE = 2 × 9×10⁹ × 8×10⁻⁸ / (0.02)³ = 144×10¹ / 8×10⁻⁶ = 1.8×10⁷ N/C", difficulty: "MEDIUM" },
          ],
          mistakes: ["Coulomb's law applies only to point charges at rest. For moving charges, magnetic forces also come into play."],
        },
        {
          id: "topic-phys-gauss", title: "Gauss's Law and Applications", orderIndex: 2,
          theory: `Gauss's Law: Electric flux through a closed surface = q_enclosed/ε₀

Φ_E = ∮E·dA = q/ε₀

Applications:
1. Field of an infinite line charge: E = λ/2πε₀r
2. Field of an infinite plane: E = σ/2ε₀
3. Field of a spherical shell: E = 0 inside, E = kQ/r² outside
4. Field of a solid sphere: E = kQr/R³ inside, E = kQ/r² outside

Electric potential: V = kQ/r (for point charge)
V = -∫E·dr (relation between field and potential)
Equipotential surfaces: surfaces where V is constant; E ⟂ equipotential surfaces`,
          sourceReference: "NCERT Physics Part 2, Chapter 2",
          formulas: [
            { name: "Gauss's Law", expression: "∮E·dA = q_enclosed/ε₀", derivation: "Gauss's law is derived from Coulomb's law and the principle of superposition. The flux through a closed surface depends only on the charge enclosed, not on the charge distribution." },
          ],
          examples: [
            { question: "A point charge Q is placed at the center of a cube. Find flux through one face.", solution: "Total flux through cube = Q/ε₀. By symmetry, flux through each face = Q/6ε₀.", difficulty: "MEDIUM" },
          ],
          mistakes: ["Gauss's law is always true but is only useful for calculating fields when charge distribution has sufficient symmetry (spherical, cylindrical, planar)."],
        },
      ],
    },
    {
      id: "ch-phys-12-current", bookId: "book-phys-ncert-12", title: "Current Electricity", orderIndex: 2,
      topics: [
        {
          id: "topic-phys-ohm", title: "Ohm's Law and Circuits", orderIndex: 1,
          theory: `Electric current: I = dq/dt (rate of flow of charge)
Ohm's Law: V = IR (at constant temperature)

Resistance: R = ρL/A (ρ = resistivity)
Conductance: G = 1/R
Conductivity: σ = 1/ρ

Resistivity varies with temperature: ρ = ρ₀[1 + α(T - T₀)]

Kirchhoff's Laws:
1. Junction Rule: ΣI_in = ΣI_out (charge conservation)
2. Loop Rule: ΣV = 0 (energy conservation)

Series: R_eq = R₁ + R₂ + R₃ + ...
Parallel: 1/R_eq = 1/R₁ + 1/R₂ + 1/R₃ + ...`,
          sourceReference: "NCERT Physics Part 2, Chapter 3",
          formulas: [
            { name: "Ohm's Law", expression: "V = IR", derivation: "Ohm experimentally found that current through most conductors is proportional to potential difference across them, at constant temperature. R is a constant for a given conductor." },
            { name: "Resistance in terms of resistivity", expression: "R = ρL/A", derivation: "Resistance is directly proportional to length L and inversely proportional to cross-sectional area A. The proportionality constant ρ is resistivity, a material property." },
          ],
          examples: [
            { question: "Three resistors 2Ω, 3Ω, 6Ω are connected in parallel. Find equivalent resistance.", solution: "1/R_p = 1/2 + 1/3 + 1/6 = 3/6 + 2/6 + 1/6 = 6/6 = 1. R_p = 1Ω", difficulty: "EASY" },
            { question: "A wire of resistance R is stretched to double its length. Find new resistance.", solution: "Volume constant: A₁L₁ = A₂L₂. If L₂ = 2L₁, then A₂ = A₁/2.\nR₂ = ρL₂/A₂ = ρ(2L₁)/(A₁/2) = 4ρL₁/A₁ = 4R", difficulty: "MEDIUM" },
          ],
          mistakes: ["Ohm's law is NOT a universal law. It applies only to ohmic conductors at constant temperature. Semiconductors, diodes, and electrolytes do NOT follow Ohm's law."],
        },
      ],
    },
    {
      id: "ch-phys-12-magnetism", bookId: "book-phys-ncert-12", title: "Magnetism and Matter", orderIndex: 3,
      topics: [
        {
          id: "topic-phys-magnetism", title: "Magnetic Effects of Current", orderIndex: 1,
          theory: `Biot-Savart Law: dB = (μ₀/4π) Idl×r̂/r²

Magnetic field due to:
• Long straight wire: B = μ₀I/2πr
• Circular loop at center: B = μ₀I/2R
• Solenoid: B = μ₀nI (n = turns per unit length)

Force on a moving charge: F = q(v×B) (Lorentz force)
Force on a current-carrying conductor: F = I(L×B)

Ampere's Circuital Law: ∮B·dl = μ₀I_enclosed

Moving coil galvanometer: current sensitivity depends on N, B, A, and k (torsion constant)`,
          sourceReference: "NCERT Physics Part 2, Chapter 4",
          formulas: [
            { name: "Biot-Savart Law", expression: "dB = (μ₀/4π) I dl×r̂/r²", derivation: "Derived experimentally. The magnetic field contribution from a small current element dl is proportional to I, dl, sinθ, and inversely proportional to r²." },
            { name: "Lorentz Force", expression: "F = q(E + v×B)", derivation: "The total electromagnetic force on a charged particle. For E=0: F = qvB sinθ, direction given by right-hand rule." },
          ],
          examples: [
            { question: "A long straight wire carries 5 A current. Find magnetic field at 2 cm from the wire. μ₀ = 4π×10⁻⁷", solution: "B = μ₀I/2πr = 4π×10⁻⁷×5/(2π×0.02) = 10⁻⁶×5/0.02 = 5×10⁻⁶/0.02 = 2.5×10⁻⁴ T", difficulty: "EASY" },
          ],
          mistakes: ["The Biot-Savart law gives dB for a current element. To find total B, you must INTEGRATE over the entire current path, not just multiply."],
        },
      ],
    },
    {
      id: "ch-phys-12-em-waves", bookId: "book-phys-ncert-12", title: "Electromagnetic Waves", orderIndex: 6,
      topics: [
        {
          id: "topic-phys-emwaves", title: "EM Waves and Spectrum", orderIndex: 1,
          theory: `Maxwell's equations:
1. Gauss (Electric): ∮E·dA = q/ε₀
2. Gauss (Magnetic): ∮B·dA = 0
3. Faraday: ∮E·dl = -dΦ_B/dt
4. Ampere-Maxwell: ∮B·dl = μ₀I + μ₀ε₀dΦ_E/dt

Maxwell predicted EM waves with speed c = 1/√(μ₀ε₀) ≈ 3×10⁸ m/s

Properties of EM waves:
• Transverse (E and B perpendicular to propagation direction)
• E/B = c
• Carry energy and momentum
• Do not require a medium

EM Spectrum: Radio → Microwave → IR → Visible → UV → X-ray → Gamma
• Energy ∝ frequency, Wavelength ∝ 1/frequency
• c = fλ`,
          sourceReference: "NCERT Physics Part 2, Chapter 8",
          formulas: [
            { name: "Speed of EM Waves", expression: "c = 1/√(μ₀ε₀)", derivation: "From Maxwell's equations, both E and B satisfy the wave equation ∇²E = μ₀ε₀∂²E/∂t². Comparing with standard wave equation, wave speed v = 1/√(μ₀ε₀)." },
          ],
          examples: [
            { question: "An EM wave has frequency 10⁶ Hz. Find its wavelength.", solution: "λ = c/f = 3×10⁸/10⁶ = 300 m (radio wave)", difficulty: "EASY" },
          ],
          mistakes: ["EM waves do NOT need a medium. Sound waves do. This confusion is common. EM waves can travel through vacuum; sound cannot."],
        },
      ],
    },
    {
      id: "ch-phys-12-optics", bookId: "book-phys-ncert-12", title: "Ray Optics and Optical Instruments", orderIndex: 7,
      topics: [
        {
          id: "topic-phys-ray-optics", title: "Reflection and Refraction", orderIndex: 1,
          theory: `Reflection: angle of incidence = angle of reflection
Refraction: n₁ sinθ₁ = n₂ sinθ₂ (Snell's Law)

Refractive index: n = c/v = speed in vacuum / speed in medium

Lens Maker's Formula: 1/f = (n-1)(1/R₁ - 1/R₂)

Magnification for lenses: m = -v/u
Lens equation: 1/f = 1/v - 1/u (sign convention: u is negative for real objects)

Total Internal Reflection: occurs when sin i ≥ n₂/n₁ (light traveling from denser to rarer medium)
Critical angle: sin C = n₂/n₁`,
          sourceReference: "NCERT Physics Part 2, Chapter 9",
          formulas: [
            { name: "Lens Maker's Formula", expression: "1/f = (n-1)(1/R₁ - 1/R₂)", derivation: "Derived by considering refraction at both surfaces of a thin lens and using the formula for refraction at a spherical surface." },
            { name: "Snell's Law", expression: "n₁ sinθ₁ = n₂ sinθ₂", derivation: "From Fermat's principle of least time. Light takes the path that minimizes travel time between two points." },
          ],
          examples: [
            { question: "A convex lens has focal length 20 cm. Where should an object be placed to get a real image twice the size?", solution: "m = -v/u = -2 (real image, inverted), so v = 2u\n1/f = 1/v + 1/u → 1/20 = 1/(2u) + 1/u = 3/2u\nu = 30 cm, so object at 30 cm from lens.", difficulty: "MEDIUM" },
          ],
          mistakes: ["Sign conventions matter! In the lens formula 1/f = 1/v - 1/u (Cartesian sign convention), u is negative for real objects. Using wrong signs is the most common error in optics problems."],
        },
      ],
    },
    {
      id: "ch-phys-12-modern", bookId: "book-phys-ncert-12", title: "Dual Nature of Radiation and Matter", orderIndex: 10,
      topics: [
        {
          id: "topic-phys-photoelectric", title: "Photoelectric Effect", orderIndex: 1,
          theory: `Einstein's photoelectric equation: K_max = hf - φ = hf - hf₀

Key observations (contradicting wave theory):
1. No time lag between light incidence and electron emission
2. K_max depends on frequency, NOT intensity
3. Threshold frequency exists below which no emission occurs
4. Photocurrent is proportional to intensity

Electron energy: E = hf = hc/λ
Planck's constant h = 6.63×10⁻³⁴ J·s

Stopping potential: V₀ = (h/e)f - φ/e = (h/e)(f - f₀)

de Broglie wavelength: λ = h/p = h/mv (matter waves)`,
          sourceReference: "NCERT Physics Part 2, Chapter 11",
          formulas: [
            { name: "Photoelectric Equation", expression: "K_max = hf - φ = hf - hf₀", derivation: "Einstein proposed light consists of photons of energy hf. An electron absorbs one photon. Some energy φ (work function) is used to escape, rest becomes KE. K_max = hf - φ." },
            { name: "de Broglie Wavelength", expression: "λ = h/p = h/mv", derivation: "de Broglie extended wave-particle duality to matter. A particle of momentum p has a wavelength λ = h/p." },
          ],
          examples: [
            { question: "Light of wavelength 400 nm falls on a metal with work function 2.0 eV. Find max KE of photoelectrons. (h = 6.63×10⁻³⁴, c = 3×10⁸, e = 1.6×10⁻¹⁹)", solution: "E = hf = hc/λ = 6.63×10⁻³⁴×3×10⁸/(400×10⁻⁹) = 4.97×10⁻¹⁹ J = 3.1 eV\nK_max = 3.1 - 2.0 = 1.1 eV", difficulty: "MEDIUM" },
          ],
          mistakes: ["Increasing light intensity increases the NUMBER of photoelectrons but NOT their kinetic energy. K_max depends only on frequency (and work function), not intensity."],
        },
      ],
    },
    {
      id: "ch-phys-12-atoms", bookId: "book-phys-ncert-12", title: "Atoms and Nuclei", orderIndex: 11,
      topics: [
        {
          id: "topic-phys-bohr", title: "Bohr's Model of Atom", orderIndex: 1,
          theory: `Bohr's postulates:
1. Electrons orbit in allowed stationary states without radiating
2. Angular momentum is quantized: mvr = nh/2π
3. Electron transitions between states emit/absorb photons: hf = E_i - E_f

Energy levels: E_n = -13.6/n² eV (for hydrogen atom)
Radius: r_n = n²r₀ where r₀ = 0.529 Å (Bohr radius)
Velocity: v_n = v₀/n where v₀ = c/137 ≈ 2.2×10⁶ m/s

Spectral series:
• Lyman (UV): n_f = 1
• Balmer (visible): n_f = 2
• Paschen (IR): n_f = 3

Rydberg formula: 1/λ = R(1/n_f² - 1/n_i²), R = 1.097×10⁷ m⁻¹

Nuclear physics:
• Mass defect: Δm = Zm_p + Nm_n - M_nucleus
• Binding energy: BE = Δm·c²`,
          sourceReference: "NCERT Physics Part 2, Chapter 12",
          formulas: [
            { name: "Bohr's Quantization", expression: "mvr = nh/2π", derivation: "Bohr postulated that electron angular momentum is quantized in multiples of h/2π. Combined with Coulomb force providing centripetal force: mv²/r = ke²/r², giving discrete orbits." },
            { name: "Energy Levels", expression: "E_n = -13.6/n² eV", derivation: "E_n = -ke²/2r_n. Substituting r_n = n²h²ε₀/πme² gives E_n = -13.6/n² eV." },
          ],
          examples: [
            { question: "Find the wavelength of the first line of the Balmer series for hydrogen. (R = 1.097×10⁷ m⁻¹)", solution: "Balmer series: n_f = 2, n_i = 3 for first line\n1/λ = R(1/2² - 1/3²) = 1.097×10⁷(1/4 - 1/9) = 1.097×10⁷(5/36) = 1.524×10⁶\nλ = 656.3 nm", difficulty: "MEDIUM" },
          ],
          mistakes: ["Bohr's model works well for single-electron systems (H, He⁺, Li²⁺) but fails for multi-electron atoms. It also cannot explain the relative intensities of spectral lines."],
        },
      ],
    },
    {
      id: "ch-phys-12-semiconductors", bookId: "book-phys-ncert-12", title: "Semiconductor Electronics", orderIndex: 13,
      topics: [
        {
          id: "topic-phys-semiconductors", title: "Diodes and Transistors", orderIndex: 1,
          theory: `Semiconductors: conductivity between conductors and insulators.
• Intrinsic: pure semiconductor (Si, Ge)
• Extrinsic: doped with impurities
  - n-type (donor impurities: P, As, Sb)
  - p-type (acceptor impurities: B, Al, In)

p-n Junction: forward bias (p positive, n negative) → current flows
Reverse bias → negligible current (except breakdown)

Rectifier: converts AC to DC
• Half-wave: uses one diode, efficiency = 40.6%
• Full-wave: uses two diodes, efficiency = 81.2%

Transistor: npn or pnp
• Common emitter: current gain β = I_C/I_B
• I_E = I_B + I_C
• Used as amplifier and switch

Logic gates: AND, OR, NOT, NAND, NOR, XOR`,
          sourceReference: "NCERT Physics Part 2, Chapter 14",
          formulas: [
            { name: "Transistor Current Gain", expression: "β = I_C/I_B", derivation: "β (or h_fE) is the ratio of collector current to base current. Since I_E = I_B + I_C and α = I_C/I_E, we get β = α/(1-α)." },
          ],
          examples: [
            { question: "A transistor has α = 0.98. Find β and I_C if I_B = 50 μA.", solution: "β = α/(1-α) = 0.98/0.02 = 49\nI_C = β×I_B = 49×50 = 2450 μA = 2.45 mA", difficulty: "EASY" },
          ],
          mistakes: ["In a transistor, I_E = I_B + I_C, NOT I_C = I_E + I_B. The emitter current is the sum, being split into base and collector currents."],
        },
      ],
    },
  ];

  const allChapters = [...chapters, ...class12Chapters];

  for (const ch of allChapters) {
    await prisma.chapter.upsert({
      where: { id: ch.id },
      update: {},
      create: { id: ch.id, title: ch.title, bookId: ch.bookId, orderIndex: ch.orderIndex },
    });

    for (const t of ch.topics) {
      await prisma.topic.upsert({
        where: { id: t.id },
        update: {},
        create: {
          id: t.id,
          title: t.title,
          chapterId: ch.id,
          orderIndex: t.orderIndex,
          theory: t.theory,
          sourceReference: t.sourceReference,
          needsReview: true,
        },
      });

      for (const f of t.formulas) {
        await prisma.formula.upsert({
          where: { id: `f-${t.id}-${t.formulas.indexOf(f)}` },
          update: {},
          create: {
            id: `f-${t.id}-${t.formulas.indexOf(f)}`,
            topicId: t.id,
            name: f.name,
            expression: f.expression,
            derivation: f.derivation,
            orderIndex: t.formulas.indexOf(f),
          },
        });
      }

      for (const e of t.examples) {
        await prisma.solvedExample.upsert({
          where: { id: `ex-${t.id}-${t.examples.indexOf(e)}` },
          update: {},
          create: {
            id: `ex-${t.id}-${t.examples.indexOf(e)}`,
            topicId: t.id,
            question: e.question,
            solution: e.solution,
            difficulty: e.difficulty as Difficulty,
            orderIndex: t.examples.indexOf(e),
          },
        });
      }

      for (const m of t.mistakes) {
        await prisma.commonMistake.upsert({
          where: { id: `mist-${t.id}-${t.mistakes.indexOf(m)}` },
          update: {},
          create: {
            id: `mist-${t.id}-${t.mistakes.indexOf(m)}`,
            topicId: t.id,
            description: m,
          },
        });
      }
    }
  }

  console.log(`Physics seed complete — ${allChapters.length} chapters across Class 11, Class 12`);
}

if (process.argv[1]?.endsWith("seed-physics.ts")) {
  seedPhysics()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
}
