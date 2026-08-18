import type { PrismaClient as PrismaClientType } from "../src/generated/prisma/client";

/**
 * Book catalogue only: titles, class level and study purpose. We do not copy
 * copyrighted textbook chapters into the app. Commercial books are references;
 * the app should recommend them selectively instead of encouraging book-hoarding.
 */
export async function seedBookCatalogue(prisma: PrismaClientType) {
  const catalogue = [
    // Physics — foundation, core practice and advanced problem solving.
    { subject: "PHYSICS" as const, id: "book-phys-ncert-11", title: "NCERT Physics Part 1", classLevel: "CLASS_11" as const, isPrimary: true, referenceNote: "Official NCERT foundation text" },
    { subject: "PHYSICS" as const, id: "book-phys-ncert-12", title: "NCERT Physics Part 2", classLevel: "CLASS_12" as const, isPrimary: true, referenceNote: "Official NCERT foundation text" },
    { subject: "PHYSICS" as const, id: "book-phys-hcv-1", title: "H.C. Verma — Concepts of Physics Vol. 1", classLevel: "CLASS_11" as const, isPrimary: false, referenceNote: "Concept clarity and graded conceptual problems" },
    { subject: "PHYSICS" as const, id: "book-phys-hcv-2", title: "H.C. Verma — Concepts of Physics Vol. 2", classLevel: "CLASS_12" as const, isPrimary: false, referenceNote: "Concept clarity and graded conceptual problems" },
    { subject: "PHYSICS" as const, id: "book-phys-dcp-mechanics", title: "D.C. Pandey — Understanding Physics: Mechanics Vol. 1 & 2", classLevel: "CLASS_11" as const, isPrimary: false, referenceNote: "Structured JEE-oriented practice" },
    { subject: "PHYSICS" as const, id: "book-phys-dcp-waves", title: "D.C. Pandey — Understanding Physics: Waves & Thermodynamics", classLevel: "CLASS_11" as const, isPrimary: false, referenceNote: "Structured JEE-oriented practice" },
    { subject: "PHYSICS" as const, id: "book-phys-dcp-em", title: "D.C. Pandey — Understanding Physics: Electricity & Magnetism", classLevel: "CLASS_12" as const, isPrimary: false, referenceNote: "Structured JEE-oriented practice" },
    { subject: "PHYSICS" as const, id: "book-phys-dcp-optics", title: "D.C. Pandey — Understanding Physics: Optics & Modern Physics", classLevel: "CLASS_12" as const, isPrimary: false, referenceNote: "Structured JEE-oriented practice" },
    { subject: "PHYSICS" as const, id: "book-phys-physics-galaxy", title: "Physics Galaxy — Advanced Illustrations in Physics", classLevel: "JEE_ADVANCED_ONLY" as const, isPrimary: false, referenceNote: "Conceptual depth and advanced problem solving" },
    { subject: "PHYSICS" as const, id: "book-phys-irodov", title: "I.E. Irodov — Problems in General Physics", classLevel: "JEE_ADVANCED_ONLY" as const, isPrimary: false, referenceNote: "Selective advanced problem practice; not a first-line JEE book" },
    { subject: "PHYSICS" as const, id: "book-phys-krotov", title: "S.S. Krotov — Aptitude Test Problems in Physics", classLevel: "JEE_ADVANCED_ONLY" as const, isPrimary: false, referenceNote: "Optional high-difficulty problem practice" },
    { subject: "PHYSICS" as const, id: "book-phys-hrw", title: "Halliday, Resnick & Walker — Fundamentals of Physics", classLevel: "JEE_ADVANCED_ONLY" as const, isPrimary: false, referenceNote: "Optional theory/reference text" },

    // Chemistry — keep NCERT central, then split practice by branch.
    { subject: "CHEMISTRY" as const, id: "book-chem-ncert-11", title: "NCERT Chemistry Part 1", classLevel: "CLASS_11" as const, isPrimary: true, referenceNote: "Official NCERT foundation text" },
    { subject: "CHEMISTRY" as const, id: "book-chem-ncert-12", title: "NCERT Chemistry Part 2", classLevel: "CLASS_12" as const, isPrimary: true, referenceNote: "Official NCERT foundation text" },
    { subject: "CHEMISTRY" as const, id: "book-chem-op-tandon", title: "O.P. Tandon — Physical Chemistry", classLevel: "JEE_ADVANCED_ONLY" as const, isPrimary: false, referenceNote: "Optional theory/reference for physical chemistry" },
    { subject: "CHEMISTRY" as const, id: "book-chem-n-awasthi", title: "N. Awasthi — Problems in Physical Chemistry", classLevel: "JEE_ADVANCED_ONLY" as const, isPrimary: false, referenceNote: "Numerical and graded physical chemistry practice" },
    { subject: "CHEMISTRY" as const, id: "book-chem-p-bahadur", title: "P. Bahadur — Numerical Chemistry", classLevel: "JEE_ADVANCED_ONLY" as const, isPrimary: false, referenceNote: "Additional numerical practice" },
    { subject: "CHEMISTRY" as const, id: "book-chem-rc-mukherjee", title: "R.C. Mukherjee — Numerical Chemistry", classLevel: "JEE_ADVANCED_ONLY" as const, isPrimary: false, referenceNote: "Additional numerical practice" },
    { subject: "CHEMISTRY" as const, id: "book-chem-ms-chouhan", title: "M.S. Chouhan — Advanced Problems in Organic Chemistry", classLevel: "JEE_ADVANCED_ONLY" as const, isPrimary: false, referenceNote: "JEE-focused organic problem practice" },
    { subject: "CHEMISTRY" as const, id: "book-chem-morrison-boyd", title: "Morrison & Boyd — Organic Chemistry", classLevel: "JEE_ADVANCED_ONLY" as const, isPrimary: false, referenceNote: "Optional deep organic chemistry reference" },
    { subject: "CHEMISTRY" as const, id: "book-chem-vk-jaiswal", title: "V.K. Jaiswal — Problems in Inorganic Chemistry", classLevel: "JEE_ADVANCED_ONLY" as const, isPrimary: false, referenceNote: "Additional inorganic problem practice" },
    { subject: "CHEMISTRY" as const, id: "book-chem-jd-lee", title: "J.D. Lee — Concise Inorganic Chemistry", classLevel: "JEE_ADVANCED_ONLY" as const, isPrimary: false, referenceNote: "Selective deep inorganic reference; NCERT remains primary" },

    // Mathematics — foundation, structured practice and advanced problem sets.
    { subject: "MATHEMATICS" as const, id: "book-math-ncert-11", title: "NCERT Mathematics Part 1", classLevel: "CLASS_11" as const, isPrimary: true, referenceNote: "Official NCERT foundation text" },
    { subject: "MATHEMATICS" as const, id: "book-math-ncert-12", title: "NCERT Mathematics Part 2", classLevel: "CLASS_12" as const, isPrimary: true, referenceNote: "Official NCERT foundation text" },
    { subject: "MATHEMATICS" as const, id: "book-math-cengage", title: "Cengage Mathematics for JEE", classLevel: "JEE_ADVANCED_ONLY" as const, isPrimary: false, referenceNote: "Comprehensive theory plus JEE problem practice" },
    { subject: "MATHEMATICS" as const, id: "book-math-black-book", title: "Vikas Gupta & Pankaj Joshi — Advanced Problems in Mathematics (Black Book)", classLevel: "JEE_ADVANCED_ONLY" as const, isPrimary: false, referenceNote: "Selective advanced problem practice" },
    { subject: "MATHEMATICS" as const, id: "book-math-rd-sharma", title: "R.D. Sharma — Mathematics", classLevel: "CLASS_11" as const, isPrimary: false, referenceNote: "Broad school-level practice; use selectively for JEE" },

    // PYQ resources — catalogue references only; no copyrighted question text is copied.
    { subject: "PHYSICS" as const, id: "book-pyq-mtg-phys", title: "MTG — 49 Years JEE Advanced + 25 Years JEE Main Physics PYQs", classLevel: "JEE_ADVANCED_ONLY" as const, isPrimary: false, referenceNote: "Chapterwise/topicwise previous-year practice" },
    { subject: "CHEMISTRY" as const, id: "book-pyq-mtg-chem", title: "MTG — 49 Years JEE Advanced + 25 Years JEE Main Chemistry PYQs", classLevel: "JEE_ADVANCED_ONLY" as const, isPrimary: false, referenceNote: "Chapterwise/topicwise previous-year practice" },
    { subject: "MATHEMATICS" as const, id: "book-pyq-mtg-math", title: "MTG — 49 Years JEE Advanced + 25 Years JEE Main Mathematics PYQs", classLevel: "JEE_ADVANCED_ONLY" as const, isPrimary: false, referenceNote: "Chapterwise/topicwise previous-year practice" },
  ];

  for (const book of catalogue) {
    const subject = await prisma.subject.upsert({
      where: { name: book.subject },
      update: {},
      create: { name: book.subject },
    });
    await prisma.book.upsert({
      where: { id: book.id },
      update: {
        title: book.title,
        subjectId: subject.id,
        classLevel: book.classLevel,
        referenceNote: book.referenceNote,
        isPrimary: book.isPrimary,
      },
      create: {
        id: book.id,
        title: book.title,
        subjectId: subject.id,
        classLevel: book.classLevel,
        isPrimary: book.isPrimary,
        referenceNote: book.referenceNote,
      },
    });
  }
}
