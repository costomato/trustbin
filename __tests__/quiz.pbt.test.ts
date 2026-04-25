/**
 * Property-based tests for quiz question structural validation
 * Feature: trustbin, Property 7: Quiz question round-trip integrity
 * Validates: Requirement 6.8
 */
import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { validateQuizQuestion } from '../lib/quiz';

const CHOICES = ['Trash', 'Recycling', 'Compost', 'None of the above'];

const validQuizArb = fc.record({
  question: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
  choices: fc.constant(CHOICES),
  correct_answer: fc.constantFrom(...CHOICES),
  explanation: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
});

describe(
  'Feature: trustbin, Property 7: Quiz question round-trip integrity',
  () => {
    it('valid quiz question objects always pass validateQuizQuestion', () => {
      fc.assert(
        fc.property(validQuizArb, (q) => validateQuizQuestion(q) === true),
        { numRuns: 100 }
      );
    });

    it('objects with empty question always fail', () => {
      fc.assert(
        fc.property(validQuizArb, (q) => {
          return validateQuizQuestion({ ...q, question: '' }) === false;
        }),
        { numRuns: 100 }
      );
    });

    it('objects with wrong number of choices always fail', () => {
      fc.assert(
        fc.property(
          validQuizArb,
          fc.integer({ min: 0, max: 10 }).filter((n) => n !== 4),
          (q, n) => {
            const choices = Array.from({ length: n }, (_, i) => `Choice${i}`);
            return validateQuizQuestion({ ...q, choices }) === false;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('objects where correct_answer is not in choices always fail', () => {
      fc.assert(
        fc.property(validQuizArb, (q) => {
          return validateQuizQuestion({ ...q, correct_answer: 'NotAChoice' }) === false;
        }),
        { numRuns: 100 }
      );
    });

    it('objects with empty explanation always fail', () => {
      fc.assert(
        fc.property(validQuizArb, (q) => {
          return validateQuizQuestion({ ...q, explanation: '' }) === false;
        }),
        { numRuns: 100 }
      );
    });
  }
);
