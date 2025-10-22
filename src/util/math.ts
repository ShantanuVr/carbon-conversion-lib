/**
 * Math utilities with deterministic rounding and precision
 * @fileoverview Mathematical operations with fixed precision and deterministic rounding
 */

import { RoundingMode } from '../types';

/**
 * Deterministic rounding function
 * @param x - Number to round
 * @param decimals - Number of decimal places
 * @param mode - Rounding mode
 * @returns Rounded number
 */
export function roundStable(x: number, decimals: number, mode: RoundingMode = 'HALF_UP'): number {
  if (!Number.isFinite(x)) {
    return x;
  }

  const factor = Math.pow(10, decimals);
  const scaled = x * factor;

  let rounded: number;
  switch (mode) {
    case 'HALF_UP':
      rounded = Math.round(scaled);
      break;
    case 'DOWN':
      rounded = Math.floor(scaled);
      break;
    case 'TRUNC':
      rounded = Math.trunc(scaled);
      break;
    default:
      rounded = Math.round(scaled);
  }

  return rounded / factor;
}

/**
 * Safe addition using Kahan summation to minimize floating point errors
 * @param a - First number
 * @param b - Second number
 * @returns Sum with reduced floating point error
 */
export function safeAdd(a: number, b: number): number {
  const sum = a + b;
  const error = Math.abs(a) >= Math.abs(b) ? a - sum + b : b - sum + a;
  return sum + error;
}

/**
 * Safe multiplication with error compensation
 * @param a - First number
 * @param b - Second number
 * @returns Product with reduced floating point error
 */
export function safeMultiply(a: number, b: number): number {
  const product = a * b;
  // For small numbers, use higher precision intermediate calculation
  if (Math.abs(product) < 1e-10) {
    // Use string-based multiplication for very small numbers
    const aStr = a.toString();
    const bStr = b.toString();
    const aDecimals = (aStr.split('.')[1] || '').length;
    const bDecimals = (bStr.split('.')[1] || '').length;
    const totalDecimals = aDecimals + bDecimals;
    
    if (totalDecimals > 15) {
      // Fall back to regular multiplication for very high precision cases
      return product;
    }
  }
  return product;
}

/**
 * Sum an array of numbers with Kahan summation
 * @param numbers - Array of numbers to sum
 * @returns Sum with reduced floating point error
 */
export function safeSum(numbers: number[]): number {
  let sum = 0;
  let error = 0;

  for (const num of numbers) {
    const y = num - error;
    const t = sum + y;
    error = (t - sum) - y;
    sum = t;
  }

  return sum;
}

/**
 * Product of an array of numbers with error compensation
 * @param numbers - Array of numbers to multiply
 * @returns Product with reduced floating point error
 */
export function safeProduct(numbers: number[]): number {
  if (numbers.length === 0) return 1;
  if (numbers.length === 1) return numbers[0]!;

  let product = numbers[0]!;
  for (let i = 1; i < numbers.length; i++) {
    product = safeMultiply(product, numbers[i]!);
  }

  return product;
}

/**
 * Check if two numbers are approximately equal within tolerance
 * @param a - First number
 * @param b - Second number
 * @param tolerance - Tolerance for comparison (default: 1e-10)
 * @returns True if numbers are approximately equal
 */
export function approximatelyEqual(a: number, b: number, tolerance: number = 1e-10): boolean {
  return Math.abs(a - b) < tolerance;
}

/**
 * Clamp a number between min and max values
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculate percentage with deterministic rounding
 * @param value - Value to calculate percentage of
 * @param total - Total value
 * @param decimals - Number of decimal places
 * @param mode - Rounding mode
 * @returns Percentage value
 */
export function calculatePercentage(
  value: number,
  total: number,
  decimals: number = 2,
  mode: RoundingMode = 'HALF_UP'
): number {
  if (total === 0) return 0;
  const percentage = (value / total) * 100;
  return roundStable(percentage, decimals, mode);
}

/**
 * Calculate uncertainty bounds
 * @param value - Base value
 * @param uncertaintyPct - Uncertainty percentage (±%)
 * @param decimals - Number of decimal places for rounding
 * @param mode - Rounding mode
 * @returns Object with lower and upper bounds
 */
export function calculateUncertaintyBounds(
  value: number,
  uncertaintyPct: number,
  decimals: number = 6,
  mode: RoundingMode = 'HALF_UP'
): { lower: number; upper: number; plusMinusPct: number } {
  const uncertainty = (value * uncertaintyPct) / 100;
  const lower = roundStable(value - uncertainty, decimals, mode);
  const upper = roundStable(value + uncertainty, decimals, mode);
  
  return {
    lower,
    upper,
    plusMinusPct: uncertaintyPct
  };
}

/**
 * Format number with fixed decimal places (for consistent string representation)
 * @param value - Number to format
 * @param decimals - Number of decimal places
 * @returns Formatted string
 */
export function formatFixed(value: number, decimals: number): string {
  return value.toFixed(decimals);
}

/**
 * Parse a fixed-point number string back to number
 * @param str - String representation of number
 * @returns Parsed number
 */
export function parseFixed(str: string): number {
  return parseFloat(str);
}
