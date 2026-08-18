import type { PrismaClient as PrismaClientType } from "../src/generated/prisma/client";

/**
 * Book catalogue only: titles, class level and study purpose. We do not copy
 * copyrighted textbook chapters into the app. Official NCERT content remains
 * the primary syllabus reference; commercial books are optional references.
 */
export async function seedBookCatalogue(prisma: PrismaClientType) {
  const catalogue = [
    { subject: "PHYSICS" as const, id: "book-phys-ncert-11", title: "NCERT Physics Part 1", classLevel: "CLASS_11" as const, isPrimary: true, referenceNote: "Official NCERT foundation text" },
    { subject: "PHYSICS" as const, id: "book-phys-ncert-12", title: "NCERT Physics Part 2", classLevel: "CLASS_12" as const, isPrimary: true, referenceNote: "Official NCERT foundation text" },
    { subject: "PHYSICS" as const, id: "book-phys-hcv-1", title: "HC Verma — Concepts of Physics Vol. 1", classLevel: "CLASS_11" as const, isPrimary: false, referenceNote: "Concept building and graded problems" },
    { subject: "PHYSICS" as const, id: "book-phys-hcv-2", title: "HC Verma — Concepts of Physics Vol. 2", classLevel: "CLASS_12" as const, isPrimary: false, referenceNote: "Concept building and graded problems" },
    { subject: "PHYSICS" as const, id: "book-phys-irodov", title: "I.E. Irodov — Problems in General Physics", classLevel: "JEE_ADVANCED_ONLY" as const, isPrimary: false, referenceNote: "Optional advanced problem practice" },

    { subject: "CHEMISTRY" as const, id: "book-chem-ncert-11", title: "NCERT Chemistry Part 1", classLevel: "CLASS_11" as const, isPrimary: true, referenceNote: "Official NCERT foundation text" },
    { subject: "CHEMISTRY" as const, id: "book-chem-ncert-12", title: "NCERT Chemistry Part 2", classLevel: "CLASS_12" as const, isPrimary: true, referenceNote: "Official NCERT foundation text" },
    { subject: "CHEMISTRY" as const, id: "book-chem-op-tandon", title: "O.P. Tandon — Organic Chemistry", classLevel: "JEE_ADVANCED_ONLY" as const, isPrimary: false, referenceNote: "Optional organic chemistry reference" },
    { subject: "CHEMISTRY" as const, id: "book-chem-n-awasthi", title: "N. Awasthi — Problems in Physical Chemistry", classLevel: "JEE_ADVANCED_ONLY" as const, isPrimary: false, referenceNote: "Optional physical chemistry problem practice" },
    { subject: "CHEMISTRY" as const, id: "book-chem-ms-chouhan", title: "M.S. Chouhan — Advanced Problems in Organic Chemistry", classLevel: "JEE_ADVANCED_ONLY" as const, isPrimary: false, referenceNote: "Optional organic problem practice" },
    { subject: "CHEMISTRY" as const, id: "book-chem-vk-jaiswal", title: "V.K. Jaiswal — Problems in Inorganic Chemistry", classLevel: "JEE_ADVANCED_ONLY" as const, isPrimary: false, referenceNote: "Optional inorganic problem practice" },

    { subject: "MATHEMATICS" as const, id: "book-math-ncert-11", title: "NCERT Mathematics Part 1", classLevel: "CLASS_11" as const, isPrimary: true, referenceNote: "Official NCERT foundation text" },
    { subject: "MATHEMATICS" as const, id: "book-math-ncert-12", title: "NCERT Mathematics Part 2", classLevel: "CLASS_12" as const, isPrimary: true, referenceNote: "Official NCERT foundation text" },
    { subject: "MATHEMATICS" as const, id: "book-math-rd-sharma", title: "R.D. Sharma Mathematics", classLevel: "JEE_ADVANCED_ONLY" as const, isPrimary: false, referenceNote: "Optional broad problem practice" },
    { subject: "MATHEMATICS" as const, id: "book-math-cengage", title: "Cengage Mathematics for JEE", classLevel: "JEE_ADVANCED_ONLY" as const, isPrimary: false, referenceNote: "Optional structured JEE problem practice" },
  ];

  for (const book of catalogue) {
    const subject = await prisma.subject.upsert({
      where: { name: book.subject },
      update: {},
      create: { name: book.subject },
    });
    await prisma.book.upsert({
      where: { id: book.id },
      update: { title: book.title, referenceNote: book.referenceNote, isPrimary: book.isPrimary },
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
