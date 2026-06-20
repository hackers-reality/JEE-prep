import "dotenv/config";
import { PrismaSqlite } from "prisma-adapter-sqlite";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaSqlite({
  url: process.env["DATABASE_URL"] ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create Physics subject
  const physics = await prisma.subject.upsert({
    where: { name: "PHYSICS" },
    update: {},
    create: { name: "PHYSICS" },
  });

  // Create NCERT Physics book for Class 11
  const ncert11 = await prisma.book.upsert({
    where: { id: "book-phys-ncert-11" },
    update: {},
    create: {
      id: "book-phys-ncert-11",
      title: "NCERT Physics Part 1",
      subjectId: physics.id,
      classLevel: "CLASS_11",
      isPrimary: true,
    },
  });

  // Create Chapter: Motion in a Straight Line
  const chapter = await prisma.chapter.upsert({
    where: { id: "ch-phys-11-motion-straight" },
    update: {},
    create: {
      id: "ch-phys-11-motion-straight",
      title: "Motion in a Straight Line",
      bookId: ncert11.id,
      orderIndex: 2,
    },
  });

  // Topic 1: Distance and Displacement
  await prisma.topic.upsert({
    where: { id: "topic-distance-displacement" },
    update: {},
    create: {
      id: "topic-distance-displacement",
      title: "Distance and Displacement",
      chapterId: chapter.id,
      orderIndex: 1,
      theory: `Distance is the total length of the actual path travelled by an object between its initial and final positions. It is a scalar quantity — it has magnitude only, no direction. Distance is always positive and depends on the path taken.

Displacement is the shortest straight-line distance between the initial and final positions, along with the direction from initial to final. It is a vector quantity — it has both magnitude and direction. Displacement can be positive, negative, or zero.

Key differences:
• Distance ≥ |Displacement| always
• Distance depends on path; displacement depends only on endpoints
• Distance is scalar; displacement is vector

Example: A person walks 3 m east, then 4 m north.
Distance travelled = 3 + 4 = 7 m
Displacement = √(3² + 4²) = 5 m, at angle θ = tan⁻¹(4/3) north of east`,
      needsReview: true,
      sourceReference: "NCERT Physics Part 1, Chapter 2",
    },
  });

  // Formula for Topic 1
  await prisma.formula.upsert({
    where: { id: "formula-displacement-mag" },
    update: {},
    create: {
      id: "formula-displacement-mag",
      topicId: "topic-distance-displacement",
      name: "Magnitude of Displacement",
      expression: "|Δr| = √((x₂ - x₁)² + (y₂ - y₁)²)",
      derivation: `For a particle moving from point P(x₁, y₁) to Q(x₂, y₂) in a plane, the displacement vector is:
Δr = (x₂ - x₁)î + (y₂ - y₁)ĵ
The magnitude is found using the Pythagorean theorem:
|Δr| = √((x₂ - x₁)² + (y₂ - y₁)²)

In one dimension, this simplifies to:
|Δx| = |x₂ - x₁|`,
      orderIndex: 1,
    },
  });

  // Solved Example 1
  await prisma.solvedExample.upsert({
    where: { id: "ex-dist-1" },
    update: {},
    create: {
      id: "ex-dist-1",
      topicId: "topic-distance-displacement",
      question: `A car travels 40 km east, then 30 km north. Find:
(i) Total distance travelled
(ii) Magnitude of displacement`,
      solution: `(i) Total distance = 40 + 30 = 70 km

(ii) Displacement = √(40² + 30²) = √(1600 + 900) = √2500 = 50 km
Direction: θ = tan⁻¹(30/40) = tan⁻¹(0.75) ≈ 36.87° north of east`,
      difficulty: "EASY",
      orderIndex: 1,
    },
  });

  // Solved Example 2
  await prisma.solvedExample.upsert({
    where: { id: "ex-dist-2" },
    update: {},
    create: {
      id: "ex-dist-2",
      topicId: "topic-distance-displacement",
      question: `A person walks along a circular track of radius R = 100 m. Starting from point A, they walk along the circumference to point B which is diametrically opposite. Find the distance travelled and displacement.`,
      solution: `Distance travelled = half the circumference = πR = 100π ≈ 314.16 m

Displacement = diameter = 2R = 200 m (straight line from A to B)
Direction: from A to B through the center

Note: distance > displacement in this case because the path is curved. If the person walked the full circle back to A, distance would be 2πR = 628.32 m but displacement would be 0 m.`,
      difficulty: "MEDIUM",
      orderIndex: 2,
    },
  });

  // Solved Example 3 (JEE Advanced level)
  await prisma.solvedExample.upsert({
    where: { id: "ex-dist-3" },
    update: {},
    create: {
      id: "ex-dist-3",
      topicId: "topic-distance-displacement",
      question: `A particle moves in the xy-plane such that its position coordinates at time t are:
x(t) = 3t² - 2t + 1
y(t) = 4t - t²
Find the magnitude of displacement between t = 0 s and t = 2 s.`,
      solution: `At t = 0: x(0) = 3(0)² - 2(0) + 1 = 1, y(0) = 4(0) - (0)² = 0
P₀ = (1, 0)

At t = 2: x(2) = 3(4) - 2(2) + 1 = 12 - 4 + 1 = 9, y(2) = 4(2) - (2)² = 8 - 4 = 4
P₂ = (9, 4)

Displacement vector: Δr = (9 - 1)î + (4 - 0)ĵ = 8î + 4ĵ

Magnitude: |Δr| = √(8² + 4²) = √(64 + 16) = √80 = 4√5 ≈ 8.94 units`,
      difficulty: "HARD",
      orderIndex: 3,
    },
  });

  // Common Mistake
  await prisma.commonMistake.upsert({
    where: { id: "mistake-dist-1" },
    update: {},
    create: {
      id: "mistake-dist-1",
      topicId: "topic-distance-displacement",
      description: "Students often use distance instead of displacement in velocity calculations. Velocity = displacement/time, NOT distance/time. Speed = distance/time. In a round trip where you return to start, average velocity is 0 but average speed is not 0.",
    },
  });

  // Topic 2: Speed and Velocity
  await prisma.topic.upsert({
    where: { id: "topic-speed-velocity" },
    update: {},
    create: {
      id: "topic-speed-velocity",
      title: "Speed and Velocity",
      chapterId: chapter.id,
      orderIndex: 2,
      theory: `Speed is the rate at which distance is covered. It is a scalar quantity.

Speed = Distance / Time

Velocity is the rate of change of displacement. It is a vector quantity.

Velocity = Displacement / Time

Average speed = Total distance / Total time
Average velocity = Total displacement / Total time

Instantaneous velocity v = dx/dt (rate of change of position with respect to time)

Key points:
• Speed is always ≥ 0
• Velocity can be positive, negative, or zero
• |Velocity| ≤ Speed (equality holds only for motion along a straight line without change in direction)
• For a body returning to starting point, average velocity = 0, but average speed > 0`,
      needsReview: true,
      sourceReference: "NCERT Physics Part 1, Chapter 2",
    },
  });

  await prisma.formula.upsert({
    where: { id: "formula-avg-speed" },
    update: {},
    create: {
      id: "formula-avg-speed",
      topicId: "topic-speed-velocity",
      name: "Average Speed",
      expression: "v_avg = Total distance / Total time = s / t",
      derivation: `By definition, average speed is the ratio of total path length (distance) to the total time interval.

If an object covers distances s₁, s₂, ..., sₙ in time intervals t₁, t₂, ..., tₙ:
v_avg = (s₁ + s₂ + ... + sₙ) / (t₁ + t₂ + ... + tₙ)

For uniform motion (constant speed): v = s/t`,
      orderIndex: 1,
    },
  });

  await prisma.formula.upsert({
    where: { id: "formula-avg-velocity" },
    update: {},
    create: {
      id: "formula-avg-velocity",
      topicId: "topic-speed-velocity",
      name: "Average Velocity",
      expression: "v_avg = Δx / Δt = (x₂ - x₁) / (t₂ - t₁)",
      derivation: `Average velocity is the ratio of displacement to time interval.

Displacement Δx = x₂ - x₁ (final position minus initial position)
Time interval Δt = t₂ - t₁

v_avg = Δx / Δt

In vector form: v_avg = Δr / Δt

For one-dimensional motion along x-axis, this simplifies to the scalar equation above, with sign indicating direction.`,
      orderIndex: 2,
    },
  });

  await prisma.solvedExample.upsert({
    where: { id: "ex-speed-1" },
    update: {},
    create: {
      id: "ex-speed-1",
      topicId: "topic-speed-velocity",
      question: `A car travels from city A to city B (120 km) at 60 km/h, and returns along the same route at 40 km/h. Find:
(i) Average speed for the round trip
(ii) Average velocity for the round trip`,
      solution: `(i) Distance A→B = 120 km, B→A = 120 km, total distance = 240 km
Time A→B = 120/60 = 2 h
Time B→A = 120/40 = 3 h
Total time = 5 h
Average speed = 240/5 = 48 km/h

(ii) Displacement for round trip = 0 (returns to start)
Average velocity = 0/5 = 0 km/h

Note the difference: average speed ≠ average of speeds = (60 + 40)/2 = 50 km/h`,
      difficulty: "EASY",
      orderIndex: 1,
    },
  });

  await prisma.solvedExample.upsert({
    where: { id: "ex-speed-2" },
    update: {},
    create: {
      id: "ex-speed-2",
      topicId: "topic-speed-velocity",
      question: `A particle moves along x-axis such that its position x(t) = 2t² - 4t + 3 (in meters). Find:
(i) Average velocity between t = 1 s and t = 3 s
(ii) Instantaneous velocity at t = 2 s`,
      solution: `(i) x(1) = 2(1)² - 4(1) + 3 = 2 - 4 + 3 = 1 m
x(3) = 2(9) - 4(3) + 3 = 18 - 12 + 3 = 9 m
Displacement = 9 - 1 = 8 m
Time interval = 3 - 1 = 2 s
Average velocity = 8/2 = 4 m/s

(ii) v(t) = dx/dt = 4t - 4
v(2) = 4(2) - 4 = 4 m/s`,
      difficulty: "MEDIUM",
      orderIndex: 2,
    },
  });

  await prisma.commonMistake.upsert({
    where: { id: "mistake-speed-1" },
    update: {},
    create: {
      id: "mistake-speed-1",
      topicId: "topic-speed-velocity",
      description: "A common mistake is to compute average speed as the arithmetic mean of given speeds. Average speed = total distance / total time, NOT (v₁ + v₂)/2. This only works when time intervals are equal, not distance intervals.",
    },
  });

  // Topic 3: Acceleration
  await prisma.topic.upsert({
    where: { id: "topic-acceleration" },
    update: {},
    create: {
      id: "topic-acceleration",
      title: "Acceleration",
      chapterId: chapter.id,
      orderIndex: 3,
      theory: `Acceleration is the rate of change of velocity with respect to time. It is a vector quantity.

Average acceleration: a_avg = Δv / Δt = (v₂ - v₁) / (t₂ - t₁)
Instantaneous acceleration: a = dv/dt = d²x/dt²

Acceleration is positive when velocity increases with time, negative (deceleration) when velocity decreases.

For motion under constant acceleration (uniformly accelerated motion), the equations of motion apply:
1. v = u + at
2. s = ut + ½at²
3. v² = u² + 2as

where u = initial velocity, v = final velocity, a = acceleration, s = displacement, t = time.

If acceleration is not constant, calculus methods must be used:
v = ∫a dt,  x = ∫v dt`,
      needsReview: true,
      sourceReference: "NCERT Physics Part 1, Chapter 2",
    },
  });

  await prisma.formula.upsert({
    where: { id: "formula-eom-1" },
    update: {},
    create: {
      id: "formula-eom-1",
      topicId: "topic-acceleration",
      name: "First Equation of Motion",
      expression: "v = u + at",
      derivation: `By definition, acceleration a = dv/dt
For constant acceleration:
∫dv = a∫dt
v - u = a(t - 0)
v = u + at

This gives the velocity after time t, starting from initial velocity u under constant acceleration a.`,
      orderIndex: 1,
    },
  });

  await prisma.formula.upsert({
    where: { id: "formula-eom-2" },
    update: {},
    create: {
      id: "formula-eom-2",
      topicId: "topic-acceleration",
      name: "Second Equation of Motion",
      expression: "s = ut + ½at²",
      derivation: `Average velocity = (u + v)/2
Displacement s = Average velocity × time
s = ((u + v)/2) × t

Substituting v = u + at:
s = ((u + u + at)/2) × t
s = ((2u + at)/2) × t
s = ut + ½at²

This gives displacement after time t for constant acceleration.`,
      orderIndex: 2,
    },
  });

  await prisma.solvedExample.upsert({
    where: { id: "ex-accel-1" },
    update: {},
    create: {
      id: "ex-accel-1",
      topicId: "topic-acceleration",
      question: `A car starts from rest and accelerates uniformly at 2 m/s² for 10 seconds.
Find: (i) Final velocity (ii) Distance covered`,
      solution: `Given: u = 0, a = 2 m/s², t = 10 s

(i) v = u + at = 0 + 2(10) = 20 m/s

(ii) s = ut + ½at² = 0 + ½(2)(100) = 100 m`,
      difficulty: "EASY",
      orderIndex: 1,
    },
  });

  await prisma.solvedExample.upsert({
    where: { id: "ex-accel-2" },
    update: {},
    create: {
      id: "ex-accel-2",
      topicId: "topic-acceleration",
      question: `A particle moving at 10 m/s is brought to rest in a distance of 50 m with uniform deceleration. Find the deceleration and time taken.`,
      solution: `Given: u = 10 m/s, v = 0, s = 50 m

Using v² = u² + 2as:
0 = 100 + 2a(50)
0 = 100 + 100a
a = -1 m/s² (deceleration of 1 m/s²)

Using v = u + at:
0 = 10 + (-1)t
t = 10 s`,
      difficulty: "MEDIUM",
      orderIndex: 2,
    },
  });

  await prisma.commonMistake.upsert({
    where: { id: "mistake-accel-1" },
    update: {},
    create: {
      id: "mistake-accel-1",
      topicId: "topic-acceleration",
      description: "Many students forget that the equations of motion ONLY apply for CONSTANT acceleration. They cannot be used when acceleration varies with time. In such cases, use calculus: v = ∫a dt, x = ∫v dt.",
    },
  });

  console.log("Seed data created successfully");
  console.log("Subjects created");
  console.log("Books created");
  console.log("Chapter: Motion in a Straight Line created");
  console.log("Topics: Distance & Displacement, Speed & Velocity, Acceleration");
  console.log("All content marked needs_review: true");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
