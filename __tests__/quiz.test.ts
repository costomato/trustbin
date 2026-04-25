/**
 * Unit tests for validateQuizQuestion
 * Validates: Requirement 6.8
 */
import { describe, it, expect } from 'vitest';
import { validateQuizQuestion } from '../lib/quiz';

const VALID = {
  question: 'Is an aluminum can recyclable?',
  choices: ['Trash', 'Recycling', 'Compost', 'None of the above'],
  correct_answer: 'Recycling',
  explanation: 'Aluminum cans are recyclable.',
};

describe('validateQuizQuestion', () => {
  it('returns true for a valid quiz question', () => {
    expect(validateQuizQuestion(VALID)).toBe(true);
  });

  it('returns false when question is empty string', () => {
    expect(validateQuizQuestion({ ...VALID, question: '' })).toBe(false);
  });

  it('returns false when question is whitespace only', () => {
    expect(validateQuizQuestion({ ...VALID, question: '   ' })).toBe(false);
  });

  it('returns false when choices has 3 items', () => {
    expect(validateQuizQuestion({ ...VALID, choices: ['Trash', 'Recycling', 'Compost'] })).toBe(false);
  });

  it('returns false when choices has 5 items', () => {
    expect(validateQuizQuestion({ ...VALID, choices: ['Trash', 'Recycling', 'Compost', 'None', 'Extra'] })).toBe(false);
  });

  it('returns false when correct_answer is not in choices', () => {
    expect(validateQuizQuestion({ ...VALID, correct_answer: 'Landfill' })).toBe(false);
  });

  it('returns false when explanation is empty', () => {
    expect(validateQuizQuestion({ ...VALID, explanation: '' })).toBe(false);
  });

  it('returns false for null input', () => {
    expect(validateQuizQuestion(null)).toBe(false);
  });

  it('returns false for non-object input', () => {
    expect(validateQuizQuestion('not an object')).toBe(false);
    expect(validateQuizQuestion(42)).toBe(false);
  });
});
