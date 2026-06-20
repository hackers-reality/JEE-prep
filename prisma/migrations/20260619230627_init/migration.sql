-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "classLevel" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    "referenceNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Book_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Chapter_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "theory" TEXT NOT NULL,
    "sourceReference" TEXT,
    "needsReview" BOOLEAN NOT NULL DEFAULT true,
    "reviewedAt" DATETIME,
    "reviewedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Topic_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Formula" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "expression" TEXT NOT NULL,
    "derivation" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Formula_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SolvedExample" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topicId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "SolvedExample_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommonMistake" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topicId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "CommonMistake_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Diagram" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topicId" TEXT NOT NULL,
    "assetPath" TEXT NOT NULL,
    "caption" TEXT,
    CONSTRAINT "Diagram_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "prepStage" TEXT,
    "jeeTarget" TEXT,
    "preferredDailyHours" INTEGER,
    "nvidiaNimKeyServerSynced" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SelfRating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    CONSTRAINT "SelfRating_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MockTest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "takenAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MockTest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MockQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mockTestId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "needsReview" BOOLEAN NOT NULL DEFAULT true,
    "studentAnswer" TEXT,
    "isCorrect" BOOLEAN,
    CONSTRAINT "MockQuestion_mockTestId_fkey" FOREIGN KEY ("mockTestId") REFERENCES "MockTest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MockQuestionTopic" (
    "mockQuestionId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,

    PRIMARY KEY ("mockQuestionId", "topicId"),
    CONSTRAINT "MockQuestionTopic_mockQuestionId_fkey" FOREIGN KEY ("mockQuestionId") REFERENCES "MockQuestion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MockQuestionTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MockTestResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mockTestId" TEXT NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "incorrectCount" INTEGER NOT NULL,
    "subjectBreakdown" TEXT NOT NULL,
    "weakTopicIds" TEXT NOT NULL,
    "strongTopicIds" TEXT NOT NULL,
    "focusNextTopicIds" TEXT NOT NULL,
    "computedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MockTestResult_mockTestId_fkey" FOREIGN KEY ("mockTestId") REFERENCES "MockTest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TopicMastery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "questionsSeen" INTEGER NOT NULL DEFAULT 0,
    "questionsCorrect" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" DATETIME NOT NULL,
    CONSTRAINT "TopicMastery_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TopicMastery_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_key" ON "Subject"("name");

-- CreateIndex
CREATE INDEX "Book_subjectId_classLevel_idx" ON "Book"("subjectId", "classLevel");

-- CreateIndex
CREATE INDEX "Chapter_bookId_idx" ON "Chapter"("bookId");

-- CreateIndex
CREATE INDEX "Topic_chapterId_idx" ON "Topic"("chapterId");

-- CreateIndex
CREATE INDEX "Topic_needsReview_idx" ON "Topic"("needsReview");

-- CreateIndex
CREATE INDEX "Formula_topicId_idx" ON "Formula"("topicId");

-- CreateIndex
CREATE INDEX "SolvedExample_topicId_idx" ON "SolvedExample"("topicId");

-- CreateIndex
CREATE INDEX "CommonMistake_topicId_idx" ON "CommonMistake"("topicId");

-- CreateIndex
CREATE INDEX "Diagram_topicId_idx" ON "Diagram"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "SelfRating_studentId_subject_key" ON "SelfRating"("studentId", "subject");

-- CreateIndex
CREATE INDEX "MockTest_studentId_idx" ON "MockTest"("studentId");

-- CreateIndex
CREATE INDEX "MockQuestion_mockTestId_idx" ON "MockQuestion"("mockTestId");

-- CreateIndex
CREATE UNIQUE INDEX "MockTestResult_mockTestId_key" ON "MockTestResult"("mockTestId");

-- CreateIndex
CREATE INDEX "TopicMastery_studentId_idx" ON "TopicMastery"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "TopicMastery_studentId_topicId_key" ON "TopicMastery"("studentId", "topicId");
