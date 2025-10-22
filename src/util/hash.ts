/**
 * Stable stringify utilities for deterministic hashing
 * @fileoverview Functions for creating deterministic string representations
 */

/**
 * Stable stringify function that ensures deterministic output
 * - Sorts object keys alphabetically
 * - Uses fixed decimal precision for numbers
 * - Handles nested objects and arrays consistently
 * @param obj - Object to stringify
 * @param maxDecimals - Maximum decimal places for numbers (default: 6)
 * @returns Deterministic JSON string
 */
export function stableStringify(obj: unknown, maxDecimals: number = 6): string {
  // First, normalize the object structure
  const normalized = normalizeObject(obj, maxDecimals);
  return JSON.stringify(normalized);
}

/**
 * Normalize object for consistent stringification
 */
function normalizeObject(obj: unknown, maxDecimals: number): unknown {
  if (typeof obj === 'number') {
    return formatNumber(obj, maxDecimals);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => normalizeObject(item, maxDecimals));
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const sortedObj: Record<string, unknown> = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      sortedObj[key] = normalizeObject((obj as Record<string, unknown>)[key], maxDecimals);
    }
    return sortedObj;
  }
  
  return obj;
}

/**
 * Format number with fixed precision and remove trailing zeros
 * @param num - Number to format
 * @param maxDecimals - Maximum decimal places
 * @returns Formatted number
 */
function formatNumber(num: number, maxDecimals: number): number {
  if (!Number.isFinite(num)) {
    return num;
  }

  // Round to maxDecimals to avoid floating point precision issues
  const factor = Math.pow(10, maxDecimals);
  const rounded = Math.round(num * factor) / factor;
  
  // Convert to string and remove trailing zeros
  const str = rounded.toString();
  const parts = str.split('.');
  
  if (parts.length === 1) {
    return rounded;
  }
  
  // Remove trailing zeros from decimal part
  const trimmedDecimal = parts[1]?.replace(/0+$/, '') || '';
  if (trimmedDecimal === '') {
    return parseFloat(parts[0]!);
  }
  
  return parseFloat(`${parts[0]!}.${trimmedDecimal}`);
}

/**
 * Create a hash-friendly string representation of an object
 * @param obj - Object to convert
 * @returns String suitable for hashing
 */
export function toHashString(obj: unknown): string {
  return stableStringify(obj);
}

/**
 * Compare two objects for equality using stable stringify
 * @param a - First object
 * @param b - Second object
 * @returns True if objects are equivalent
 */
export function stableEqual(a: unknown, b: unknown): boolean {
  return stableStringify(a) === stableStringify(b);
}

/**
 * Create a deterministic digest payload for hashing
 * @param payload - Object to create digest from
 * @returns Digest string
 */
export function createDigest(payload: Record<string, unknown>): string {
  // Ensure consistent field ordering and number formatting
  const normalizedPayload = normalizePayload(payload);
  return stableStringify(normalizedPayload);
}

/**
 * Normalize payload for consistent digest creation
 * @param payload - Raw payload object
 * @returns Normalized payload
 */
function normalizePayload(payload: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};
  
  // Sort keys alphabetically
  const sortedKeys = Object.keys(payload).sort();
  
  for (const key of sortedKeys) {
    const value = payload[key];
    
    if (typeof value === 'number') {
      // Normalize numbers to fixed precision
      normalized[key] = formatNumber(value, 6);
    } else if (typeof value === 'string') {
      // Trim strings and normalize case if needed
      normalized[key] = value.trim();
    } else if (Array.isArray(value)) {
      // Recursively normalize arrays
      normalized[key] = value.map(item => 
        typeof item === 'object' && item !== null 
          ? normalizePayload(item as Record<string, unknown>)
          : item
      );
    } else if (typeof value === 'object' && value !== null) {
      // Recursively normalize nested objects
      normalized[key] = normalizePayload(value as Record<string, unknown>);
    } else {
      normalized[key] = value;
    }
  }
  
  return normalized;
}
