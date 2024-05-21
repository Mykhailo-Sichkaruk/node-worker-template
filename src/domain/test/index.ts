import { Type, Static } from "@sinclair/typebox";
import { Ajv } from "ajv";
import addFormats from "ajv-formats";

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
    startAt: Type.String({ format: "date-time" }),
    repeatPolicy: RepeatPolicy,
  }),
]);

export type TestRequest = Static<typeof TestRequest>;

// ErrorDetails entity
export const ErrorDetails = Type.Object({
  message: Type.String(),
  stack: Type.String(),
});

export type ErrorDetails = Static<typeof ErrorDetails>;

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

export type TestItem = Static<typeof TestItem>;
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

export type TestResult = Static<typeof TestResult>;

// Test Report entity
export const TestReport = Type.Object({
  id: Type.String({ format: "uuid" }),
  testResultId: Type.String({ format: "uuid" }),
  summary: Summary,
  createdAt: Type.String({ format: "date-time" }),
});

export type TestReport = Static<typeof TestReport>;

const ajv = new Ajv({ allErrors: true });
addFormats.default(ajv);

export const testResultValidator = ajv.compile<TestResult>(TestResult);
export const testRequestValidator = ajv.compile<TestRequest>(TestRequest);
