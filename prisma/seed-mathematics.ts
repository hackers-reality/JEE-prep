import "dotenv/config";
import { PrismaSqlite } from "prisma-adapter-sqlite";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaSqlite({
  url: process.env["DATABASE_URL"] ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function seedMath() {
  const subject = await prisma.subject.upsert({
    where: { name: "MATHEMATICS" },
    update: {},
    create: { name: "MATHEMATICS" },
  });
  console.log("Mathematics subject ready");

  const books = [
    { id: "book-math-ncert-11", title: "NCERT Mathematics Part 1", classLevel: "CLASS_11" as const, isPrimary: true },
    { id: "book-math-ncert-12", title: "NCERT Mathematics Part 2", classLevel: "CLASS_12" as const, isPrimary: true },
    { id: "book-math-rd-sharma", title: "RD Sharma Mathematics", classLevel: "JEE_ADVANCED_ONLY" as const, isPrimary: false, referenceNote: "Best for problem-solving practice" },
  ];

  for (const b of books) {
    await prisma.book.upsert({
      where: { id: b.id },
      update: {},
      create: { ...b, subjectId: subject.id },
    });
  }
  console.log("Mathematics books created");

  const chapters = [
    {
      id: "ch-math-11-sets", bookId: "book-math-ncert-11", title: "Sets and Functions", orderIndex: 1,
      topics: [
        {
          id: "topic-math-sets", title: "Sets, Relations and Functions", orderIndex: 1,
          theory: `Sets: well-defined collection of objects
• Roster form: {a, b, c}
• Set-builder form: {x | condition(x)}

Operations: ∪ (union), ∩ (intersection), - (difference), ' (complement)
n(A∪B) = n(A) + n(B) - n(A∩B)

Relations: subset of A×B
• Reflexive: aRa for all a
• Symmetric: aRb → bRa
• Transitive: aRb, bRc → aRc
• Equivalence: reflexive + symmetric + transitive

Functions (mappings): each input has exactly one output
• Domain, codomain, range
• Injective (one-one): f(a) = f(b) → a = b
• Surjective (onto): every element in codomain is mapped to
• Bijective: both injective and surjective

Types: constant, identity, polynomial, rational, modulus, signum, greatest integer`,
          sourceReference: "NCERT Mathematics Part 1, Chapters 1-2",
          formulas: [
            { name: "Union Cardinality", expression: "n(A∪B) = n(A) + n(B) - n(A∩B)", derivation: "When counting elements in A∪B, elements in A∩B are counted twice. Subtract once to avoid double-counting." },
          ],
          examples: [
            { question: "If A = {1,2,3}, B = {2,3,4}, find A∪B and A∩B.", solution: "A∪B = {1,2,3,4}\nA∩B = {2,3}", difficulty: "EASY" },
            { question: "Check if f(x) = 2x + 3 is bijective from R to R.", solution: "Injective: f(a) = f(b) → 2a+3 = 2b+3 → a=b ✓\nSurjective: For any y ∈ R, x = (y-3)/2 exists in R ✓\nTherefore f is bijective.", difficulty: "MEDIUM" },
          ],
          mistakes: ["Don't confuse range with codomain. Codomain is the set of all possible outputs (declared). Range is the set of actual outputs from the function."],
        },
      ],
    },
    {
      id: "ch-math-11-trig", bookId: "book-math-ncert-11", title: "Trigonometric Functions", orderIndex: 2,
      topics: [
        {
          id: "topic-math-trig", title: "Trigonometric Functions and Identities", orderIndex: 1,
          theory: `Angle measurement: degrees, radians (π rad = 180°)
Arc length: s = rθ

Trigonometric ratios: sinθ, cosθ, tanθ, cotθ, secθ, cosecθ
Standard values: 0°, 30°, 45°, 60°, 90°

Fundamental identities:
• sin²θ + cos²θ = 1
• 1 + tan²θ = sec²θ
• 1 + cot²θ = cosec²θ

Compound angles:
• sin(A+B) = sinA cosB + cosA sinB
• cos(A+B) = cosA cosB - sinA sinB
• tan(A+B) = (tanA + tanB)/(1 - tanA tanB)

Multiple angles:
• sin2θ = 2 sinθ cosθ
• cos2θ = cos²θ - sin²θ = 2cos²θ - 1 = 1 - 2sin²θ
• sin3θ = 3sinθ - 4sin³θ
• cos3θ = 4cos³θ - 3cosθ

Transformation:
• 2sinA cosB = sin(A+B) + sin(A-B)
• 2cosA sinB = sin(A+B) - sin(A-B)
• 2cosA cosB = cos(A+B) + cos(A-B)
• 2sinA sinB = cos(A-B) - cos(A+B)`,
          sourceReference: "NCERT Mathematics Part 1, Chapter 3",
          formulas: [
            { name: "sin(A+B)", expression: "sin(A+B) = sinA cosB + cosA sinB", derivation: "Using Euler's formula: e^(i(A+B)) = e^(iA)·e^(iB) = (cosA + i sinA)(cosB + i sinB). Taking imaginary parts: sin(A+B) = sinA cosB + cosA sinB." },
            { name: "cos2θ", expression: "cos2θ = cos²θ - sin²θ = 2cos²θ - 1 = 1 - 2sin²θ", derivation: "From cos(A+B) with A=B: cos2θ = cos²θ - sin²θ. Using cos²θ + sin²θ = 1, we get alternative forms." },
          ],
          examples: [
            { question: "If sinθ = 3/5 and θ is in first quadrant, find cosθ and tanθ.", solution: "cosθ = √(1 - 9/25) = √(16/25) = 4/5\ntanθ = sinθ/cosθ = (3/5)/(4/5) = 3/4", difficulty: "EASY" },
            { question: "Prove that (sinθ + cosθ)² = 1 + sin2θ.", solution: "LHS = sin²θ + cos²θ + 2 sinθ cosθ = 1 + 2 sinθ cosθ = 1 + sin2θ", difficulty: "EASY" },
          ],
          mistakes: ["When taking square roots like √(1 - sin²θ), the sign depends on the quadrant. In Q1 and Q2, sin is positive; in Q3 and Q4, sin is negative. Always check the quadrant."],
        },
      ],
    },
    {
      id: "ch-math-11-complex", bookId: "book-math-ncert-11", title: "Complex Numbers and Quadratic Equations", orderIndex: 4,
      topics: [
        {
          id: "topic-math-complex", title: "Complex Numbers", orderIndex: 1,
          theory: `Complex numbers: z = a + ib, i² = -1
• Real part Re(z) = a, Imaginary part Im(z) = b

Operations: addition, subtraction, multiplication, division

Modulus: |z| = √(a² + b²)
Argument: arg(z) = tan⁻¹(b/a)

Polar form: z = r(cosθ + i sinθ) = r·e^(iθ)

De Moivre's Theorem: (cosθ + i sinθ)ⁿ = cos(nθ) + i sin(nθ)

Quadratic equations: ax² + bx + c = 0
• Discriminant D = b² - 4ac
• Roots: x = (-b ± √D)/(2a)
• Nature of roots: D > 0 (real, distinct), D = 0 (real, equal), D < 0 (complex, conjugate)

For complex roots: α + iβ and α - iβ
Sum of roots = -b/a, Product = c/a`,
          sourceReference: "NCERT Mathematics Part 1, Chapter 5",
          formulas: [
            { name: "De Moivre's Theorem", expression: "(cosθ + i sinθ)ⁿ = cos(nθ) + i sin(nθ)", derivation: "Proved by induction. For n=1: trivial. Assume true for n, multiply by (cosθ + i sinθ) and use trig identities to prove for n+1." },
            { name: "Quadratic Formula", expression: "x = (-b ± √(b² - 4ac))/2a", derivation: "ax² + bx + c = 0 → x² + (b/a)x = -c/a → (x + b/2a)² = (b² - 4ac)/4a² → x = (-b ± √(b² - 4ac))/2a" },
          ],
          examples: [
            { question: "Find the modulus and argument of z = 1 + i.", solution: "|z| = √(1² + 1²) = √2\narg(z) = tan⁻¹(1/1) = 45° = π/4", difficulty: "EASY" },
            { question: "Solve x² + 2x + 5 = 0.", solution: "D = 4 - 20 = -16 = 16i²\nx = (-2 ± 4i)/2 = -1 ± 2i", difficulty: "EASY" },
          ],
          mistakes: ["When solving quadratic equations, if D < 0, roots are complex conjugates. Don't forget the ± in front of √D — there are always two roots."],
        },
      ],
    },
    {
      id: "ch-math-11-sequences", bookId: "book-math-ncert-11", title: "Sequences and Series", orderIndex: 6,
      topics: [
        {
          id: "topic-math-ap-gp", title: "Arithmetic and Geometric Progressions", orderIndex: 1,
          theory: `Arithmetic Progression (AP): a, a+d, a+2d, ...
• nth term: a_n = a + (n-1)d
• Sum of n terms: S_n = n/2[2a + (n-1)d] = n/2(a₁ + a_n)
• Arithmetic mean of a and b: (a+b)/2

Geometric Progression (GP): a, ar, ar², ...
• nth term: a_n = ar^(n-1)
• Sum of n terms: S_n = a(rⁿ - 1)/(r - 1) for r≠1
• Sum to infinity (|r|<1): S_∞ = a/(1-r)
• Geometric mean of a and b: √(ab)

Harmonic Progression (HP): reciprocals form an AP
• nth term: 1/(a + (n-1)d)
• Harmonic mean of a and b: 2ab/(a+b)

Relationship: AM ≥ GM ≥ HM (for positive numbers, equality when a=b)

Special sums:
• Σn = n(n+1)/2
• Σn² = n(n+1)(2n+1)/6
• Σn³ = [n(n+1)/2]²`,
          sourceReference: "NCERT Mathematics Part 1, Chapter 9",
          formulas: [
            { name: "Sum of n terms in AP", expression: "S_n = n/2[2a + (n-1)d]", derivation: "S = a + (a+d) + ... + (a+(n-1)d). Reverse: S = (a+(n-1)d) + ... + a. Adding: 2S = n[2a + (n-1)d]. Hence S = n/2[2a + (n-1)d]." },
            { name: "AM ≥ GM ≥ HM", expression: "(a+b)/2 ≥ √(ab) ≥ 2ab/(a+b)", derivation: "From (√a - √b)² ≥ 0, we get a + b ≥ 2√(ab) → AM ≥ GM. Since GM² = AM×HM, GM ≥ HM." },
          ],
          examples: [
            { question: "Find the 10th term of AP: 2, 5, 8, 11, ...", solution: "a = 2, d = 3\na₁₀ = 2 + (10-1)×3 = 2 + 27 = 29", difficulty: "EASY" },
            { question: "Find the sum to infinity of GP: 1, 1/2, 1/4, 1/8, ...", solution: "a = 1, r = 1/2\nS_∞ = 1/(1 - 1/2) = 2", difficulty: "EASY" },
          ],
          mistakes: ["The sum to infinity formula S_∞ = a/(1-r) works ONLY when |r| < 1. For |r| > 1, the series diverges (no finite sum)."],
        },
      ],
    },
    {
      id: "ch-math-11-calculus", bookId: "book-math-ncert-11", title: "Limits and Derivatives", orderIndex: 10,
      topics: [
        {
          id: "topic-math-limits", title: "Limits and Continuity", orderIndex: 1,
          theory: `Limit of a function: as x approaches a, f(x) approaches L
lim_{x→a} f(x) = L

Standard limits:
• lim_{x→0} sinx/x = 1
• lim_{x→0} (1 - cosx)/x = 0
• lim_{x→0} (eˣ - 1)/x = 1
• lim_{x→0} (ln(1+x))/x = 1
• lim_{x→∞} (1 + 1/x)ˣ = e

Algebra of limits:
• lim(f+g) = lim f + lim g
• lim(fg) = (lim f)(lim g)
• lim(f/g) = (lim f)/(lim g), provided lim g ≠ 0

Continuity: f is continuous at x = a if
lim_{x→a⁻} f(x) = lim_{x→a⁺} f(x) = f(a)

Types of discontinuity: removable, jump, infinite

Derivative: f'(x) = lim_{h→0} (f(x+h) - f(x))/h
Standard derivatives:
• d/dx(xⁿ) = nxⁿ⁻¹
• d/dx(sinx) = cosx, d/dx(cosx) = -sinx
• d/dx(eˣ) = eˣ, d/dx(lnx) = 1/x`,
          sourceReference: "NCERT Mathematics Part 2, Chapter 13",
          formulas: [
            { name: "Limit Definition of Derivative", expression: "f'(x) = lim_{h→0} (f(x+h) - f(x))/h", derivation: "The derivative at x is the slope of the tangent. As h→0, the secant line approaches the tangent." },
            { name: "Product Rule", expression: "(fg)' = f'g + fg'", derivation: "Let Δ(fg) = f(x+h)g(x+h) - f(x)g(x) = [f(x+h)-f(x)]g(x+h) + f(x+h)[g(x+h)-g(x)]. Divide by h and take limit h→0." },
          ],
          examples: [
            { question: "Evaluate lim_{x→0} sin5x/x.", solution: "lim_{x→0} sin5x/x = lim_{x→0} 5(sin5x/5x) = 5×1 = 5", difficulty: "EASY" },
            { question: "Find derivative of f(x) = x² + 3x + 2 using first principles.", solution: "f'(x) = lim_{h→0} ((x+h)² + 3(x+h) + 2 - (x²+3x+2))/h\n= lim_{h→0} (2xh + h² + 3h)/h = lim_{h→0} (2x + h + 3) = 2x + 3", difficulty: "MEDIUM" },
          ],
          mistakes: ["lim_{x→0} (sinx)/x = 1 only when x is in radians, NOT degrees. In degrees, the limit would be π/180. Always use radians for trigonometric limits."],
        },
      ],
    },
    // Class 12 chapters
    {
      id: "ch-math-12-inverse-trig", bookId: "book-math-ncert-12", title: "Inverse Trigonometric Functions", orderIndex: 1,
      topics: [
        {
          id: "topic-math-inv-trig", title: "Inverse Trig Functions and Properties", orderIndex: 1,
          theory: `Inverse trigonometric functions: arcsin, arccos, arctan, etc.
Domain and range restrictions make them single-valued.

Principal value branches:
• sin⁻¹: [-1,1] → [-π/2, π/2]
• cos⁻¹: [-1,1] → [0, π]
• tan⁻¹: R → (-π/2, π/2)

Important properties:
• sin⁻¹(-x) = -sin⁻¹x
• cos⁻¹(-x) = π - cos⁻¹x
• tan⁻¹(-x) = -tan⁻¹x
• sin⁻¹x + cos⁻¹x = π/2
• tan⁻¹x + cot⁻¹x = π/2

Formulas:
• tan⁻¹x + tan⁻¹y = tan⁻¹((x+y)/(1-xy)), xy < 1
• tan⁻¹x - tan⁻¹y = tan⁻¹((x-y)/(1+xy)), xy > -1
• 2tan⁻¹x = sin⁻¹(2x/(1+x²)) = cos⁻¹((1-x²)/(1+x²))`,
          sourceReference: "NCERT Mathematics Part 2, Chapter 2",
          formulas: [
            { name: "Sum of arctan", expression: "tan⁻¹x + tan⁻¹y = tan⁻¹((x+y)/(1-xy))", derivation: "Let α = tan⁻¹x, β = tan⁻¹y. tan(α+β) = (tanα+tanβ)/(1-tanα·tanβ) = (x+y)/(1-xy). Hence α+β = tan⁻¹((x+y)/(1-xy))." },
          ],
          examples: [
            { question: "Find the value of sin⁻¹(1/2) + cos⁻¹(1/2).", solution: "sin⁻¹(1/2) = π/6, cos⁻¹(1/2) = π/3\nSum = π/6 + π/3 = π/2", difficulty: "EASY" },
          ],
          mistakes: ["Inverse trig functions return the PRINCIPAL VALUE, not all possible values. sin⁻¹(1/2) = π/6, NOT 5π/6, π/6+2π, etc."],
        },
      ],
    },
    {
      id: "ch-math-12-matrices", bookId: "book-math-ncert-12", title: "Matrices and Determinants", orderIndex: 2,
      topics: [
        {
          id: "topic-math-matrices", title: "Matrices and Determinants", orderIndex: 1,
          theory: `Matrix: rectangular array of numbers, order m×n

Types: row, column, square, diagonal, scalar, identity, zero

Matrix operations: addition, scalar multiplication, multiplication
• AB exists only if columns of A = rows of B
• AB ≠ BA generally (non-commutative)
• Transpose: (Aᵀ)ᵀ = A, (AB)ᵀ = BᵀAᵀ
• Symmetric: A = Aᵀ, Skew-symmetric: A = -Aᵀ

Determinant: scalar value for square matrices
• |A| for 2×2: ad - bc
• |A| for 3×3: expansion by minors

Properties:
• det(AB) = det(A)·det(B)
• det(Aᵀ) = det(A)
• det(kA) = kⁿdet(A) for n×n matrix
• If two rows/columns are identical, det = 0
• det(A⁻¹) = 1/det(A)

Adjoint: A·adj(A) = adj(A)·A = |A|·I
Inverse: A⁻¹ = adj(A)/|A| (provided |A| ≠ 0)

Cramer's Rule: for solving systems of linear equations`,
          sourceReference: "NCERT Mathematics Part 2, Chapters 3-4",
          formulas: [
            { name: "Matrix Inverse", expression: "A⁻¹ = adj(A)/det(A)", derivation: "From A·adj(A) = |A|·I, multiply both sides by A⁻¹: adj(A) = |A|·A⁻¹. Hence A⁻¹ = adj(A)/|A|." },
            { name: "2×2 Determinant", expression: "|A| = ad - bc for A = [[a,b],[c,d]]", derivation: "For 2×2 matrix, the determinant is the area scaling factor. ad - bc comes from the product of diagonal entries minus product of off-diagonal." },
          ],
          examples: [
            { question: "Find the inverse of A = [[2,3],[1,4]].", solution: "det(A) = 2×4 - 3×1 = 8 - 3 = 5\nadj(A) = [[4,-3],[-1,2]]\nA⁻¹ = [[4/5, -3/5],[-1/5, 2/5]]", difficulty: "MEDIUM" },
          ],
          mistakes: ["Matrix multiplication is NOT commutative. AB and BA are different in general. Always pay attention to the order of multiplication."],
        },
      ],
    },
    {
      id: "ch-math-12-calc", bookId: "book-math-ncert-12", title: "Continuity, Differentiability and Applications", orderIndex: 4,
      topics: [
        {
          id: "topic-math-differentiation", title: "Differentiation and Applications", orderIndex: 1,
          theory: `Chain rule: dy/dx = dy/du × du/dx
Implicit differentiation: differentiate both sides w.r.t. x, treating y as function of x
Parametric equations: dy/dx = (dy/dt)/(dx/dt)
Logarithmic differentiation: take ln both sides, then differentiate

Rolle's Theorem: if f continuous on [a,b], differentiable on (a,b), f(a)=f(b), then ∃c∈(a,b): f'(c)=0
Lagrange's Mean Value Theorem: ∃c∈(a,b): f'(c) = (f(b)-f(a))/(b-a)

Increasing/decreasing: f'(x) > 0 → increasing, f'(x) < 0 → decreasing

Maxima/minima:
• First derivative test: f' changes sign at critical point
• Second derivative test: f''(c) < 0 → local max, f''(c) > 0 → local min

Tangents and normals: slope of tangent = f'(x₀), slope of normal = -1/f'(x₀)

Rate of change: dy/dt = (dy/dx)(dx/dt)`,
          sourceReference: "NCERT Mathematics Part 2, Chapters 5-6",
          formulas: [
            { name: "Mean Value Theorem", expression: "f'(c) = (f(b) - f(a))/(b - a) for some c ∈ (a,b)", derivation: "Geometrically, there exists a point where tangent slope equals secant slope. The proof uses Rolle's theorem applied to an auxiliary function." },
          ],
          examples: [
            { question: "Find the equation of tangent to y = x² at (2,4).", solution: "dy/dx = 2x, slope at x=2 = 4\nTangent: y - 4 = 4(x - 2) → y = 4x - 4", difficulty: "EASY" },
            { question: "Find the local maxima/minima of f(x) = x³ - 6x² + 9x + 1.", solution: "f'(x) = 3x² - 12x + 9 = 3(x² - 4x + 3) = 3(x-1)(x-3)\nCritical points: x = 1, 3\nf''(x) = 6x - 12\nf''(1) = -6 < 0 → local max at x=1, f(1) = 5\nf''(3) = 6 > 0 → local min at x=3, f(3) = 1", difficulty: "MEDIUM" },
          ],
          mistakes: ["Critical points where f'(x) = 0 might be inflection points, not extrema. Always verify using the second derivative test or check the sign change of the first derivative."],
        },
      ],
    },
    {
      id: "ch-math-12-integration", bookId: "book-math-ncert-12", title: "Integrals", orderIndex: 5,
      topics: [
        {
          id: "topic-math-integration", title: "Integration Techniques", orderIndex: 1,
          theory: `Integration: reverse of differentiation (antiderivative)

∫xⁿ dx = xⁿ⁺¹/(n+1) + C, n≠-1
∫1/x dx = ln|x| + C
∫eˣ dx = eˣ + C
∫sinx dx = -cosx + C
∫cosx dx = sinx + C
∫sec²x dx = tanx + C
∫1/(1+x²) dx = tan⁻¹x + C
∫1/√(1-x²) dx = sin⁻¹x + C

Methods of integration:
• Substitution: ∫f(g(x))·g'(x) dx = ∫f(u) du
• Integration by parts: ∫u·dv = uv - ∫v·du (ILATE rule)
• Partial fractions: for rational functions

Definite integral: ∫_a^b f(x) dx = F(b) - F(a) (FTC Part 2)

Properties:
• ∫_a^b f = -∫_b^a f
• ∫_a^b f = ∫_a^c f + ∫_c^b f
• ∫_0^a f(x) dx = ∫_0^a f(a-x) dx (King's property)
• ∫_{-a}^a f(x) dx = 2∫_0^a f for even functions; 0 for odd

Area under curve: A = ∫_a^b |f(x)| dx`,
          sourceReference: "NCERT Mathematics Part 2, Chapter 7",
          formulas: [
            { name: "Integration by Parts", expression: "∫u·dv = uv - ∫v·du", derivation: "Product rule: d(uv)/dx = u·dv/dx + v·du/dx. Rearranging and integrating: u·dv = d(uv) - v·du → ∫u·dv = uv - ∫v·du." },
            { name: "Fundamental Theorem of Calculus", expression: "∫_a^b f(x) dx = F(b) - F(a), where F' = f", derivation: "Let F(x) = ∫_a^x f(t) dt. By definition, F'(x) = f(x). Hence F is an antiderivative of f. F(b) - F(a) = ∫_a^b f." },
          ],
          examples: [
            { question: "Evaluate ∫x² dx.", solution: "∫x² dx = x³/3 + C", difficulty: "EASY" },
            { question: "Evaluate ∫x cosx dx using integration by parts.", solution: "Let u = x, dv = cosx dx\ndu = dx, v = sinx\n∫x cosx dx = x sinx - ∫sinx dx = x sinx + cosx + C", difficulty: "MEDIUM" },
          ],
          mistakes: ["Don't forget the constant of integration C for indefinite integrals. For definite integrals, the constant cancels out automatically."],
        },
      ],
    },
    {
      id: "ch-math-12-probability", bookId: "book-math-ncert-12", title: "Probability", orderIndex: 9,
      topics: [
        {
          id: "topic-math-probability", title: "Probability and Distributions", orderIndex: 1,
          theory: `Probability: P(E) = n(E)/n(S) where S is sample space

Conditional probability: P(A|B) = P(A∩B)/P(B)
Multiplication theorem: P(A∩B) = P(A)·P(B|A)

Independent events: P(A∩B) = P(A)·P(B)
Mutually exclusive: P(A∩B) = 0

Total probability: P(B) = Σᵢ P(Aᵢ)·P(B|Aᵢ)
Bayes' Theorem: P(Aᵢ|B) = P(Aᵢ)·P(B|Aᵢ) / P(B)

Random variables: X takes values with associated probabilities
• P(X = x) = p(x)
• Σ p(x) = 1
• Mean (Expectation): μ = E(X) = Σ x·p(x)
• Variance: Var(X) = E(X²) - [E(X)]²

Probability distributions:
• Binomial: P(X=r) = ⁿCᵣ pʳ qⁿ⁻ʳ
  Mean = np, Variance = npq
• Normal: bell-shaped, symmetric about mean

Bernoulli trials: n independent trials, each with success probability p`,
          sourceReference: "NCERT Mathematics Part 2, Chapter 13",
          formulas: [
            { name: "Bayes' Theorem", expression: "P(Aᵢ|B) = P(Aᵢ)P(B|Aᵢ)/ΣP(Aⱼ)P(B|Aⱼ)", derivation: "P(Aᵢ|B) = P(Aᵢ∩B)/P(B) = P(Aᵢ)P(B|Aᵢ)/P(B). Using total probability: P(B) = ΣP(Aⱼ)P(B|Aⱼ)." },
            { name: "Binomial Distribution", expression: "P(X=r) = ⁿCᵣ pʳ qⁿ⁻ʳ", derivation: "Choose r positions for successes: ⁿCᵣ ways. Each way has probability pʳ qⁿ⁻ʳ. Summing gives the binomial formula." },
          ],
          examples: [
            { question: "Two dice are rolled. Find probability of sum = 7.", solution: "Total outcomes: 36\nFavorable: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6\nP(sum=7) = 6/36 = 1/6", difficulty: "EASY" },
            { question: "A coin is tossed 5 times. Find probability of exactly 3 heads.", solution: "n=5, p=1/2, r=3\nP = ⁵C₃ (½)³ (½)² = 10 × 1/32 = 10/32 = 5/16", difficulty: "MEDIUM" },
          ],
          mistakes: ["Don't confuse mutually exclusive (P(A∩B)=0) with independent (P(A∩B)=P(A)P(B)). Mutually exclusive events with non-zero probability are NEVER independent."],
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
          create: { id: `ex-${t.id}-${i}`, topicId: t.id, question: t.examples[i].question, solution: t.examples[i].solution,             difficulty: t.examples[i].difficulty as any, orderIndex: i },
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

  console.log(`Mathematics seed complete — ${chapters.length} chapters`);
}

seedMath()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
