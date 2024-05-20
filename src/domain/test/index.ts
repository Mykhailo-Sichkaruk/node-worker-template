import { Type } from "@sinclair/typebox";

// Test entity
export const Test = Type.Object({
  id: Type.String({ format: "uuid" }),
  project: Type.String(),
  commitHash: Type.String(),
  imageUrl: Type.String(),
});

// RepeatPolicy entity
export const RepeatPolicy = Type.Object({
  repeats: Type.Number(),
  intervalSec: Type.Number(),
});

// Test Request entity
export const TestRequest = Type.Intersect([
  Test,
  Type.Object({
    createdAt: Type.String({ format: "date-time" }),
    repeatPolicy: Type.Optional(RepeatPolicy),
  }),
]);

// ErrorDetails entity
export const ErrorDetails = Type.Object({
  message: Type.String(),
  stack: Type.String(),
});

// Test Item entity
export const TestItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  description: Type.String(),
  status: Type.String(), // 'pass' or 'fail'
  directive: Type.Optional(Type.String()),
  todo: Type.Optional(Type.Boolean()),
  skip: Type.Optional(Type.Boolean()),
  error: Type.Optional(ErrorDetails),
});

// Summary entity
export const Summary = Type.Object({
  totalTests: Type.Number(),
  passedTests: Type.Number(),
  failedTests: Type.Number(),
  successRate: Type.Number(),
});

// Test Result entity
export const TestResult = Type.Intersect([
  Test,
  Type.Object({
    status: Type.String(),
    executedAt: Type.String({ format: "date-time" }),
    testItems: Type.Array(TestItem),
  }),
]);

// Test Report entity
export const TestReport = Type.Object({
  id: Type.String({ format: "uuid" }),
  testResultId: Type.String({ format: "uuid" }),
  summary: Summary,
  createdAt: Type.String({ format: "date-time" }),
});
