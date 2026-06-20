import { prisma } from "./prisma";

type QWithSubject = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "JEE_ADVANCED";
  topicTitle: string;
  subject: string;
};

const questionBank: QWithSubject[] = [
  // PHYSICS
  { question: "What is the SI unit of force?", options: ["Newton", "Joule", "Watt", "Pascal"], correctAnswer: "Newton", explanation: "Newton (N) is the SI unit of force.", difficulty: "EASY", topicTitle: "Units and Dimensions", subject: "PHYSICS" },
  { question: "Dimensions of velocity are:", options: ["[LT⁻¹]", "[LT⁻²]", "[L²T⁻¹]", "[L⁻¹T]"], correctAnswer: "[LT⁻¹]", explanation: "Velocity = displacement/time, dimension [LT⁻¹].", difficulty: "EASY", topicTitle: "Units and Dimensions", subject: "PHYSICS" },
  { question: "Car travels 40 km east, 30 km north. Displacement?", options: ["70 km", "50 km", "10 km", "100 km"], correctAnswer: "50 km", explanation: "Displacement = √(40²+30²) = 50 km.", difficulty: "EASY", topicTitle: "Distance and Displacement", subject: "PHYSICS" },
  { question: "Which is a scalar?", options: ["Velocity", "Distance", "Acceleration", "Force"], correctAnswer: "Distance", explanation: "Distance has magnitude only — a scalar.", difficulty: "EASY", topicTitle: "Distance and Displacement", subject: "PHYSICS" },
  { question: "Equations of motion apply for:", options: ["Constant acceleration", "Variable acceleration", "All cases", "Free fall only"], correctAnswer: "Constant acceleration", explanation: "v = u + at etc. assume constant a.", difficulty: "EASY", topicTitle: "Acceleration", subject: "PHYSICS" },
  { question: "Maximum projectile range at angle:", options: ["30°", "45°", "60°", "90°"], correctAnswer: "45°", explanation: "R = u²sin2θ/g, max at θ = 45°.", difficulty: "MEDIUM", topicTitle: "Vectors and Projectile Motion", subject: "PHYSICS" },
  { question: "Newton's second law: F =", options: ["ma", "mv", "m/t", "m/a"], correctAnswer: "ma", explanation: "F = ma = rate of change of momentum.", difficulty: "EASY", topicTitle: "Newton's Laws and Friction", subject: "PHYSICS" },
  { question: "Work by conservative force is:", options: ["Path-independent", "Path-dependent", "Always zero", "Always negative"], correctAnswer: "Path-independent", explanation: "Gravity, spring force: work depends only on endpoints.", difficulty: "MEDIUM", topicTitle: "Work-Energy Theorem", subject: "PHYSICS" },
  { question: "Escape velocity from Earth ≈", options: ["7 km/s", "11.2 km/s", "15 km/s", "3 km/s"], correctAnswer: "11.2 km/s", explanation: "vₑ = √(2GM/R) = √(2gR) ≈ 11.2 km/s.", difficulty: "EASY", topicTitle: "Universal Law of Gravitation", subject: "PHYSICS" },
  { question: "Coulomb's law: F ∝", options: ["q₁q₂/r²", "q₁q₂/r", "q₁+q₂", "1/r"], correctAnswer: "q₁q₂/r²", explanation: "F = kq₁q₂/r² (inverse square law).", difficulty: "EASY", topicTitle: "Coulomb's Law and Electric Field", subject: "PHYSICS" },
  { question: "Ohm's law: V =", options: ["IR", "I/R", "R/I", "P/I"], correctAnswer: "IR", explanation: "V = IR at constant temperature.", difficulty: "EASY", topicTitle: "Ohm's Law and Circuits", subject: "PHYSICS" },
  { question: "Photoelectric effect shows light's:", options: ["Wave nature", "Particle nature", "Both", "Neither"], correctAnswer: "Particle nature", explanation: "Einstein's photon theory explained the photoelectric effect.", difficulty: "EASY", topicTitle: "Photoelectric Effect", subject: "PHYSICS" },
  { question: "EM waves in vacuum travel at:", options: ["3×10⁸ m/s", "3×10⁶ m/s", "3×10¹⁰ m/s", "Depends on f"], correctAnswer: "3×10⁸ m/s", explanation: "c = 1/√(μ₀ε₀) = 3×10⁸ m/s.", difficulty: "EASY", topicTitle: "EM Waves and Spectrum", subject: "PHYSICS" },
  { question: "At max height of projectile:", options: ["vₓ = 0", "vᵧ = 0", "Both zero", "Neither zero"], correctAnswer: "vᵧ = 0", explanation: "Vertical velocity becomes zero at the highest point.", difficulty: "MEDIUM", topicTitle: "Vectors and Projectile Motion", subject: "PHYSICS" },
  // CHEMISTRY
  { question: "1 mole of gas at STP occupies:", options: ["22.4 L", "11.2 L", "44.8 L", "2.24 L"], correctAnswer: "22.4 L", explanation: "At STP (0°C, 1 atm), 1 mole = 22.4 L.", difficulty: "EASY", topicTitle: "Mole Concept and Stoichiometry", subject: "CHEMISTRY" },
  { question: "3d subshell can hold max:", options: ["2", "6", "10", "14"], correctAnswer: "10", explanation: "d subshell: 5 orbitals × 2 e⁻ = 10 e⁻.", difficulty: "EASY", topicTitle: "Quantum Mechanical Model", subject: "CHEMISTRY" },
  { question: "Electronegativity increases:", options: ["Across a period", "Down a group", "Both", "Neither"], correctAnswer: "Across a period", explanation: "Nuclear charge increases across period, pulling electrons stronger.", difficulty: "EASY", topicTitle: "Periodic Trends", subject: "CHEMISTRY" },
  { question: "VSEPR: molecular shape from:", options: ["Bond angles", "Electron pair repulsion", "Atomic radii", "Electronegativity"], correctAnswer: "Electron pair repulsion", explanation: "Electron pairs arrange to minimize repulsion.", difficulty: "MEDIUM", topicTitle: "VSEPR and Hybridization", subject: "CHEMISTRY" },
  { question: "NH₃ hybridization:", options: ["sp", "sp²", "sp³", "sp³d"], correctAnswer: "sp³", explanation: "N in NH₃: 3 bond + 1 lone pair = 4 regions → sp³.", difficulty: "MEDIUM", topicTitle: "VSEPR and Hybridization", subject: "CHEMISTRY" },
  { question: "Aldehyde functional group:", options: ["-OH", "-CHO", "-CO-", "-COOH"], correctAnswer: "-CHO", explanation: "Aldehydes contain the formyl group (-CHO).", difficulty: "EASY", topicTitle: "Aldehydes, Ketones and Carboxylic Acids", subject: "CHEMISTRY" },
  { question: "Nernst equation involves:", options: ["Concentration only", "Temp only", "Both concentration and temp", "Pressure"], correctAnswer: "Both concentration and temp", explanation: "E = E° - (RT/nF)lnQ.", difficulty: "MEDIUM", topicTitle: "Electrochemical Cells and Nernst Equation", subject: "CHEMISTRY" },
  { question: "First-order half-life:", options: ["Depends on [A]₀", "Is constant", "Increases with time", "Decreases with [A]₀"], correctAnswer: "Is constant", explanation: "t_½ = 0.693/k, independent of initial concentration.", difficulty: "MEDIUM", topicTitle: "Rate Laws and Order of Reactions", subject: "CHEMISTRY" },
  { question: "Raoult's law: P ∝", options: ["Mole fraction of solvent", "Mole fraction of solute", "Volume", "Mass"], correctAnswer: "Mole fraction of solvent", explanation: "P = P₀x_solvent.", difficulty: "MEDIUM", topicTitle: "Concentration and Colligative Properties", subject: "CHEMISTRY" },
  // MATHEMATICS
  { question: "Bijective function is:", options: ["Injective only", "Surjective only", "Both injective and surjective", "Neither"], correctAnswer: "Both injective and surjective", explanation: "Bijective = one-to-one + onto.", difficulty: "EASY", topicTitle: "Sets, Relations and Functions", subject: "MATHEMATICS" },
  { question: "sin2θ =", options: ["2 sinθ cosθ", "sin²θ - cos²θ", "2 cos²θ - 1", "1 - 2 sin²θ"], correctAnswer: "2 sinθ cosθ", explanation: "From sin(A+B) with A=B=θ.", difficulty: "EASY", topicTitle: "Trigonometric Functions and Identities", subject: "MATHEMATICS" },
  { question: "If D < 0, roots are:", options: ["Real distinct", "Real equal", "Complex conjugates", "Imaginary"], correctAnswer: "Complex conjugates", explanation: "D < 0 → √D = i√|D| → conjugate complex roots.", difficulty: "EASY", topicTitle: "Complex Numbers", subject: "MATHEMATICS" },
  { question: "Sum of n terms of AP:", options: ["n/2[2a+(n-1)d]", "n[a+(n-1)d]", "a+(n-1)d", "n(2a+nd)"], correctAnswer: "n/2[2a+(n-1)d]", explanation: "S_n = n/2(first + last) = n/2[2a+(n-1)d].", difficulty: "EASY", topicTitle: "Arithmetic and Geometric Progressions", subject: "MATHEMATICS" },
  { question: "lim_{x→0} sinx/x =", options: ["0", "1", "∞", "x"], correctAnswer: "1", explanation: "Standard limit (x in radians).", difficulty: "EASY", topicTitle: "Limits and Continuity", subject: "MATHEMATICS" },
  { question: "f''(c) < 0 → critical point is:", options: ["Local max", "Local min", "Inflection", "Saddle"], correctAnswer: "Local max", explanation: "Second derivative test.", difficulty: "MEDIUM", topicTitle: "Differentiation and Applications", subject: "MATHEMATICS" },
  { question: "∫eˣ dx =", options: ["eˣ + C", "ln|x| + C", "xeˣ + C", "eˣ/x + C"], correctAnswer: "eˣ + C", explanation: "Exponential is its own antiderivative.", difficulty: "EASY", topicTitle: "Integration Techniques", subject: "MATHEMATICS" },
  { question: "P(impossible event) =", options: ["0", "1", "0.5", "Undefined"], correctAnswer: "0", explanation: "By definition.", difficulty: "EASY", topicTitle: "Probability and Distributions", subject: "MATHEMATICS" },
  { question: "P(A|B) =", options: ["P(A∩B)/P(B)", "P(A∩B)/P(A)", "P(A)P(B)", "P(A)+P(B)"], correctAnswer: "P(A∩B)/P(B)", explanation: "Conditional probability formula.", difficulty: "EASY", topicTitle: "Probability and Distributions", subject: "MATHEMATICS" },
  { question: "AM ≥", options: ["GM", "HM", "Both GM and HM", "Neither"], correctAnswer: "Both GM and HM", explanation: "AM ≥ GM ≥ HM for positive numbers.", difficulty: "MEDIUM", topicTitle: "Arithmetic and Geometric Progressions", subject: "MATHEMATICS" },
  { question: "Matrix inverse exists if:", options: ["det = 0", "det ≠ 0", "Matrix is symmetric", "Matrix is square"], correctAnswer: "det ≠ 0", explanation: "Non-singular matrix (det ≠ 0) has inverse.", difficulty: "EASY", topicTitle: "Matrices and Determinants", subject: "MATHEMATICS" },
  { question: "Which is a vector?", options: ["Speed", "Distance", "Displacement", "Mass"], correctAnswer: "Displacement", explanation: "Vector has magnitude and direction.", difficulty: "EASY", topicTitle: "Distance and Displacement", subject: "MATHEMATICS" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function getTopicId(title: string): Promise<string | null> {
  const topic = await prisma.topic.findFirst({
    where: { title: { contains: title.replace(/[^a-zA-Z0-9 ]/g, "").trim() } },
  });
  return topic?.id ?? null;
}

export async function generateDiagnosticTest(studentId: string, testNumber: number) {
  const subjects = ["PHYSICS", "CHEMISTRY", "MATHEMATICS"];
  const subject = subjects[testNumber];

  const pool = questionBank.filter((q) => q.subject === subject);
  const selected = shuffle(pool).slice(0, 8);

  const mockTest = await prisma.mockTest.create({
    data: {
      studentId,
      type: "DIAGNOSTIC",
    },
  });

  for (const q of selected) {
    const topicId = await getTopicId(q.topicTitle);
    await prisma.mockQuestion.create({
      data: {
        mockTestId: mockTest.id,
        question: q.question,
        options: JSON.stringify(q.options),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        needsReview: true,
        topics: topicId ? { create: { topicId } } : undefined,
      },
    });
  }

  return prisma.mockTest.findUnique({
    where: { id: mockTest.id },
    include: { questions: { include: { topics: true } } },
  });
}

export async function computeTestResult(mockTestId: string) {
  const test = await prisma.mockTest.findUnique({
    where: { id: mockTestId },
    include: {
      questions: { include: { topics: { include: { topic: { include: { chapter: { include: { book: true } } } } } } } },
      student: { include: { topicMastery: true } },
    },
  });
  if (!test) throw new Error("Test not found");

  const total = test.questions.length;
  const correct = test.questions.filter((q) => q.isCorrect === true).length;
  const incorrect = total - correct;

  const topicCorrectCount = new Map<string, number>();
  const topicSeenCount = new Map<string, number>();

  for (const q of test.questions) {
    for (const t of q.topics) {
      topicSeenCount.set(t.topicId, (topicSeenCount.get(t.topicId) ?? 0) + 1);
      if (q.isCorrect === true) {
        topicCorrectCount.set(t.topicId, (topicCorrectCount.get(t.topicId) ?? 0) + 1);
      }
    }
  }

  const weakTopics: string[] = [];
  const strongTopics: string[] = [];
  const focusNext: string[] = [];

  for (const [topicId, seen] of topicSeenCount) {
    const mastery = test.student.topicMastery.find((m) => m.topicId === topicId);
    const prevSeen = mastery?.questionsSeen ?? 0;
    const prevCorrect = mastery?.questionsCorrect ?? 0;
    const newCorrect = topicCorrectCount.get(topicId) ?? 0;
    const totalSeen = prevSeen + seen;
    const totalCorrect = prevCorrect + newCorrect;
    const accuracy = totalSeen > 0 ? totalCorrect / totalSeen : 0;

    if (accuracy < 0.5) weakTopics.push(topicId);
    else strongTopics.push(topicId);

    await prisma.topicMastery.upsert({
      where: { studentId_topicId: { studentId: test.studentId, topicId } },
      update: {
        questionsSeen: { increment: seen },
        questionsCorrect: { increment: newCorrect },
      },
      create: {
        studentId: test.studentId,
        topicId,
        questionsSeen: seen,
        questionsCorrect: newCorrect,
      },
    });
  }

  focusNext.push(...weakTopics);
  focusNext.push(...strongTopics.filter((t) => !weakTopics.includes(t)));

  // Subject breakdown from topic -> chapter -> book -> subject
  const subjectBreakdown: Record<string, { correct: number; total: number }> = {};
  const subjectCache = new Map<string, string>();
  for (const q of test.questions) {
    const firstTopic = q.topics[0];
    let subjName = "PHYSICS";
    if (firstTopic) {
      const cached = subjectCache.get(firstTopic.topicId);
      if (cached) {
        subjName = cached;
      } else {
        const topic = firstTopic.topic as any;
        const chapter = topic?.chapter as any;
        const book = chapter?.book as any;
        subjName = book?.subject?.name ?? "PHYSICS";
        subjectCache.set(firstTopic.topicId, subjName);
      }
    }
    if (!subjectBreakdown[subjName]) subjectBreakdown[subjName] = { correct: 0, total: 0 };
    subjectBreakdown[subjName].total++;
    if (q.isCorrect === true) subjectBreakdown[subjName].correct++;
  }

  const result = await prisma.mockTestResult.create({
    data: {
      mockTestId,
      totalQuestions: total,
      correctCount: correct,
      incorrectCount: incorrect,
      subjectBreakdown: JSON.stringify(subjectBreakdown),
      weakTopicIds: JSON.stringify(weakTopics),
      strongTopicIds: JSON.stringify(strongTopics),
      focusNextTopicIds: JSON.stringify(focusNext),
    },
  });

  await prisma.mockTest.update({
    where: { id: mockTestId },
    data: { takenAt: new Date() },
  });

  return result;
}
