/**
 * Zod schemas for validation
 * @fileoverview Schema definitions for runtime validation
 */

import { z } from 'zod';

/**
 * Schema for factor source information
 */
export const FactorSourceSchema = z.object({
  name: z.string().min(1, 'Source name is required'),
  url: z.string().url().optional(),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid ISO date format').optional(),
  note: z.string().optional(),
});

/**
 * Schema for emission factor
 */
export const FactorSchema = z.object({
  id: z.string().min(1, 'Factor ID is required'),
  region: z.string().min(2, 'Region code must be at least 2 characters').max(10, 'Region code too long'),
  scope: z.enum(['operational', 'marginal', 'baseline']),
  gas: z.literal('CO2e'),
  valueKgPerKWh: z.number()
    .positive('Emission factor must be positive')
    .max(2, 'Emission factor seems unreasonably high (>2 kg CO₂e/kWh)'),
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid ISO date format'),
  effectiveTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid ISO date format').optional(),
  source: FactorSourceSchema,
  uncertaintyPct: z.number().min(0).max(100).optional(),
  methodology: z.string().optional(),
  version: z.string().min(1, 'Version is required'),
});

/**
 * Schema for avoided emissions input
 */
export const AvoidedInputSchema = z.object({
  energy: z.number().nonnegative('Energy must be non-negative'),
  inputUnit: z.enum(['kWh', 'MWh', 'GWh']),
  factorKgPerKWh: z.number().positive('Emission factor must be positive'),
  rounding: z.object({
    decimals: z.number().int().min(0).max(10).optional(),
    mode: z.enum(['HALF_UP', 'DOWN', 'TRUNC']).optional(),
  }).optional(),
});

/**
 * Schema for factor resolution options
 */
export const FactorResolutionOptionsSchema = z.object({
  region: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid ISO date format').optional(),
  scope: z.enum(['operational', 'marginal', 'baseline']).optional(),
  overrides: z.array(FactorSchema).optional(),
});

/**
 * Schema for factor filter
 */
export const FactorFilterSchema = z.object({
  region: z.string().optional(),
  scope: z.string().optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid ISO date format').optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid ISO date format').optional(),
});

/**
 * Schema for factor pack (array of factors)
 */
export const FactorPackSchema = z.array(FactorSchema);

/**
 * Schema for region mapping
 */
export const RegionMappingSchema = z.object({
  code: z.string(),
  name: z.string(),
  iso2: z.string().length(2).optional(),
  iso3: z.string().length(3).optional(),
  unM49: z.string().optional(),
});

/**
 * Schema for region pack (array of region mappings)
 */
export const RegionPackSchema = z.array(RegionMappingSchema);

/**
 * Type exports derived from schemas
 */
export type FactorSource = z.infer<typeof FactorSourceSchema>;
export type Factor = z.infer<typeof FactorSchema>;
export type AvoidedInput = z.infer<typeof AvoidedInputSchema>;
export type FactorResolutionOptions = z.infer<typeof FactorResolutionOptionsSchema>;
export type FactorFilter = z.infer<typeof FactorFilterSchema>;
export type FactorPack = z.infer<typeof FactorPackSchema>;
export type RegionMapping = z.infer<typeof RegionMappingSchema>;
export type RegionPack = z.infer<typeof RegionPackSchema>;

/**
 * Validation helper functions
 */
export function validateFactorPack(json: unknown): Factor[] {
  return FactorPackSchema.parse(json);
}

export function validateRegionPack(json: unknown): RegionMapping[] {
  return RegionPackSchema.parse(json);
}

export function validateFactor(factor: unknown): Factor {
  return FactorSchema.parse(factor);
}

export function validateAvoidedInput(input: unknown): AvoidedInput {
  return AvoidedInputSchema.parse(input);
}
