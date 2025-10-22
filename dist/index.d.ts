import { z } from 'zod';

/**
 * Core types for carbon conversion library
 * @fileoverview Type definitions for CO₂e conversion operations
 */
/**
 * Energy unit types
 */
type Unit = 'kWh' | 'MWh' | 'GWh';
/**
 * Mass unit types for CO₂e
 */
type MassUnit = 'kgCO2e' | 'tCO2e';
/**
 * Rounding modes for deterministic calculations
 */
type RoundingMode = 'HALF_UP' | 'DOWN' | 'TRUNC';
/**
 * Scope types for emission factors
 */
type Scope = 'operational' | 'marginal' | 'baseline';
/**
 * Gas types (extensible for future greenhouse gases)
 */
type GasType = 'CO2e';
/**
 * Source information for emission factors
 */
interface FactorSource {
    /** Name of the source organization or publication */
    name: string;
    /** Optional URL to the source data */
    url?: string | undefined;
    /** Publication date in ISO format */
    publishedAt?: string | undefined;
    /** Additional notes about the source */
    note?: string | undefined;
}
/**
 * Emission factor definition
 */
interface Factor$1 {
    /** Unique identifier for the factor */
    id: string;
    /** Region code (ISO-3166 alpha2 or custom) */
    region: string;
    /** Scope of the emission factor */
    scope: Scope;
    /** Gas type */
    gas: GasType;
    /** Emission factor value in kg CO₂e per kWh */
    valueKgPerKWh: number;
    /** Effective start date in ISO format */
    effectiveFrom: string;
    /** Optional effective end date in ISO format */
    effectiveTo?: string | undefined;
    /** Source information */
    source: FactorSource;
    /** Optional uncertainty percentage (±%) */
    uncertaintyPct?: number | undefined;
    /** Optional methodology reference */
    methodology?: string | undefined;
    /** Version identifier */
    version: string;
}
/**
 * Input for avoided emissions calculation
 */
interface AvoidedInput$1 {
    /** Energy value in the specified input unit */
    energy: number;
    /** Unit of the energy input */
    inputUnit: Unit;
    /** Emission factor in kg CO₂e per kWh */
    factorKgPerKWh: number;
    /** Optional rounding configuration */
    rounding?: {
        /** Number of decimal places */
        decimals?: number;
        /** Rounding mode */
        mode?: RoundingMode;
    };
}
/**
 * Uncertainty bounds for emission calculations
 */
interface UncertaintyBounds {
    /** Uncertainty percentage (±%) */
    plusMinusPct: number;
    /** Lower bound in tCO₂e */
    lowerTCO2e: number;
    /** Upper bound in tCO₂e */
    upperTCO2e: number;
}
/**
 * Result of avoided emissions calculation
 */
interface AvoidedResult {
    /** Avoided emissions in tonnes CO₂e */
    tCO2e: number;
    /** Avoided emissions in kg CO₂e */
    kgCO2e: number;
    /** Emission factor used in kg CO₂e per kWh */
    factorKgPerKWh: number;
    /** Energy input normalized to kWh */
    energyKWh: number;
    /** Optional uncertainty bounds */
    uncertainty?: UncertaintyBounds;
    /** Optional metadata */
    meta?: Record<string, unknown>;
}
/**
 * Options for factor resolution
 */
interface FactorResolutionOptions {
    /** Region code to filter by */
    region?: string;
    /** Date to find effective factor for */
    date?: string;
    /** Scope to filter by */
    scope?: Scope;
    /** Override factors to use instead of default registry */
    overrides?: Factor$1[];
}
/**
 * Filter options for listing factors
 */
interface FactorFilter {
    /** Region code to filter by */
    region?: string;
    /** Scope to filter by */
    scope?: string;
    /** Start date for effective range */
    from?: string;
    /** End date for effective range */
    to?: string;
}
/**
 * Error types for the library
 */
declare class UnknownRegionError extends Error {
    constructor(region: string);
}
declare class NoFactorForDateError extends Error {
    constructor(region: string, date: string);
}
declare class InvalidUnitError extends Error {
    constructor(unit: string);
}
declare class InvalidFactorError extends Error {
    constructor(message: string);
}
/**
 * Safe operation result type
 */
interface SafeResult<T> {
    ok: true;
    data: T;
}
interface SafeError {
    ok: false;
    error: {
        code: string;
        message: string;
    };
}
type SafeReturn<T> = SafeResult<T> | SafeError;

/**
 * Zod schemas for validation
 * @fileoverview Schema definitions for runtime validation
 */

/**
 * Schema for emission factor
 */
declare const FactorSchema: z.ZodObject<{
    id: z.ZodString;
    region: z.ZodString;
    scope: z.ZodEnum<["operational", "marginal", "baseline"]>;
    gas: z.ZodLiteral<"CO2e">;
    valueKgPerKWh: z.ZodNumber;
    effectiveFrom: z.ZodString;
    effectiveTo: z.ZodOptional<z.ZodString>;
    source: z.ZodObject<{
        name: z.ZodString;
        url: z.ZodOptional<z.ZodString>;
        publishedAt: z.ZodOptional<z.ZodString>;
        note: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        note?: string | undefined;
        url?: string | undefined;
        publishedAt?: string | undefined;
    }, {
        name: string;
        note?: string | undefined;
        url?: string | undefined;
        publishedAt?: string | undefined;
    }>;
    uncertaintyPct: z.ZodOptional<z.ZodNumber>;
    methodology: z.ZodOptional<z.ZodString>;
    version: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    region: string;
    scope: "baseline" | "operational" | "marginal";
    gas: "CO2e";
    valueKgPerKWh: number;
    effectiveFrom: string;
    source: {
        name: string;
        note?: string | undefined;
        url?: string | undefined;
        publishedAt?: string | undefined;
    };
    version: string;
    effectiveTo?: string | undefined;
    uncertaintyPct?: number | undefined;
    methodology?: string | undefined;
}, {
    id: string;
    region: string;
    scope: "baseline" | "operational" | "marginal";
    gas: "CO2e";
    valueKgPerKWh: number;
    effectiveFrom: string;
    source: {
        name: string;
        note?: string | undefined;
        url?: string | undefined;
        publishedAt?: string | undefined;
    };
    version: string;
    effectiveTo?: string | undefined;
    uncertaintyPct?: number | undefined;
    methodology?: string | undefined;
}>;
/**
 * Schema for avoided emissions input
 */
declare const AvoidedInputSchema: z.ZodObject<{
    energy: z.ZodNumber;
    inputUnit: z.ZodEnum<["kWh", "MWh", "GWh"]>;
    factorKgPerKWh: z.ZodNumber;
    rounding: z.ZodOptional<z.ZodObject<{
        decimals: z.ZodOptional<z.ZodNumber>;
        mode: z.ZodOptional<z.ZodEnum<["HALF_UP", "DOWN", "TRUNC"]>>;
    }, "strip", z.ZodTypeAny, {
        decimals?: number | undefined;
        mode?: "HALF_UP" | "DOWN" | "TRUNC" | undefined;
    }, {
        decimals?: number | undefined;
        mode?: "HALF_UP" | "DOWN" | "TRUNC" | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    energy: number;
    inputUnit: "kWh" | "MWh" | "GWh";
    factorKgPerKWh: number;
    rounding?: {
        decimals?: number | undefined;
        mode?: "HALF_UP" | "DOWN" | "TRUNC" | undefined;
    } | undefined;
}, {
    energy: number;
    inputUnit: "kWh" | "MWh" | "GWh";
    factorKgPerKWh: number;
    rounding?: {
        decimals?: number | undefined;
        mode?: "HALF_UP" | "DOWN" | "TRUNC" | undefined;
    } | undefined;
}>;
/**
 * Schema for region mapping
 */
declare const RegionMappingSchema: z.ZodObject<{
    code: z.ZodString;
    name: z.ZodString;
    iso2: z.ZodOptional<z.ZodString>;
    iso3: z.ZodOptional<z.ZodString>;
    unM49: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    code: string;
    iso2?: string | undefined;
    iso3?: string | undefined;
    unM49?: string | undefined;
}, {
    name: string;
    code: string;
    iso2?: string | undefined;
    iso3?: string | undefined;
    unM49?: string | undefined;
}>;
type Factor = z.infer<typeof FactorSchema>;
type AvoidedInput = z.infer<typeof AvoidedInputSchema>;
type RegionMapping = z.infer<typeof RegionMappingSchema>;
/**
 * Validation helper functions
 */
declare function validateFactorPack(json: unknown): Factor[];
declare function validateRegionPack(json: unknown): RegionMapping[];
declare function validateFactor(factor: unknown): Factor;
declare function validateAvoidedInput(input: unknown): AvoidedInput;

/**
 * Unit conversion utilities
 * @fileoverview Functions for converting between energy and mass units
 */

/**
 * Convert kWh to MWh
 * @param kWh - Energy in kilowatt-hours
 * @returns Energy in megawatt-hours
 */
declare function kWhToMWh(kWh: number): number;
/**
 * Convert MWh to kWh
 * @param MWh - Energy in megawatt-hours
 * @returns Energy in kilowatt-hours
 */
declare function MWhToKWh(MWh: number): number;
/**
 * Convert GWh to kWh
 * @param GWh - Energy in gigawatt-hours
 * @returns Energy in kilowatt-hours
 */
declare function GWhToKWh(GWh: number): number;
/**
 * Convert kWh to GWh
 * @param kWh - Energy in kilowatt-hours
 * @returns Energy in gigawatt-hours
 */
declare function kWhToGWh(kWh: number): number;
/**
 * Convert kg to tonnes
 * @param kg - Mass in kilograms
 * @returns Mass in tonnes
 */
declare function kgToTonnes(kg: number): number;
/**
 * Convert tonnes to kg
 * @param tonnes - Mass in tonnes
 * @returns Mass in kilograms
 */
declare function tonnesToKg(tonnes: number): number;
/**
 * Convert any energy unit to kWh
 * @param energy - Energy value
 * @param unit - Source unit
 * @returns Energy in kWh
 * @throws InvalidUnitError if unit is not recognized
 */
declare function normalizeToKWh(energy: number, unit: Unit): number;
/**
 * Convert any mass unit to kg CO₂e
 * @param mass - Mass value
 * @param unit - Source unit
 * @returns Mass in kg CO₂e
 * @throws InvalidUnitError if unit is not recognized
 */
declare function normalizeToKgCO2e(mass: number, unit: MassUnit): number;
/**
 * Convert any mass unit to tonnes CO₂e
 * @param mass - Mass value
 * @param unit - Source unit
 * @returns Mass in tonnes CO₂e
 * @throws InvalidUnitError if unit is not recognized
 */
declare function normalizeToTonnesCO2e(mass: number, unit: MassUnit): number;
/**
 * Get conversion factor from any energy unit to kWh
 * @param unit - Source unit
 * @returns Conversion factor (multiply by this to get kWh)
 * @throws InvalidUnitError if unit is not recognized
 */
declare function getEnergyConversionFactor(unit: Unit): number;
/**
 * Get conversion factor from any mass unit to kg CO₂e
 * @param unit - Source unit
 * @returns Conversion factor (multiply by this to get kg CO₂e)
 * @throws InvalidUnitError if unit is not recognized
 */
declare function getMassConversionFactor(unit: MassUnit): number;

/**
 * Math utilities with deterministic rounding and precision
 * @fileoverview Mathematical operations with fixed precision and deterministic rounding
 */

/**
 * Deterministic rounding function
 * @param x - Number to round
 * @param decimals - Number of decimal places
 * @param mode - Rounding mode
 * @returns Rounded number
 */
declare function roundStable(x: number, decimals: number, mode?: RoundingMode): number;
/**
 * Safe addition using Kahan summation to minimize floating point errors
 * @param a - First number
 * @param b - Second number
 * @returns Sum with reduced floating point error
 */
declare function safeAdd(a: number, b: number): number;
/**
 * Safe multiplication with error compensation
 * @param a - First number
 * @param b - Second number
 * @returns Product with reduced floating point error
 */
declare function safeMultiply(a: number, b: number): number;
/**
 * Sum an array of numbers with Kahan summation
 * @param numbers - Array of numbers to sum
 * @returns Sum with reduced floating point error
 */
declare function safeSum(numbers: number[]): number;
/**
 * Product of an array of numbers with error compensation
 * @param numbers - Array of numbers to multiply
 * @returns Product with reduced floating point error
 */
declare function safeProduct(numbers: number[]): number;
/**
 * Check if two numbers are approximately equal within tolerance
 * @param a - First number
 * @param b - Second number
 * @param tolerance - Tolerance for comparison (default: 1e-10)
 * @returns True if numbers are approximately equal
 */
declare function approximatelyEqual(a: number, b: number, tolerance?: number): boolean;
/**
 * Clamp a number between min and max values
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
declare function clamp(value: number, min: number, max: number): number;
/**
 * Calculate percentage with deterministic rounding
 * @param value - Value to calculate percentage of
 * @param total - Total value
 * @param decimals - Number of decimal places
 * @param mode - Rounding mode
 * @returns Percentage value
 */
declare function calculatePercentage(value: number, total: number, decimals?: number, mode?: RoundingMode): number;
/**
 * Calculate uncertainty bounds
 * @param value - Base value
 * @param uncertaintyPct - Uncertainty percentage (±%)
 * @param decimals - Number of decimal places for rounding
 * @param mode - Rounding mode
 * @returns Object with lower and upper bounds
 */
declare function calculateUncertaintyBounds(value: number, uncertaintyPct: number, decimals?: number, mode?: RoundingMode): {
    lower: number;
    upper: number;
    plusMinusPct: number;
};
/**
 * Format number with fixed decimal places (for consistent string representation)
 * @param value - Number to format
 * @param decimals - Number of decimal places
 * @returns Formatted string
 */
declare function formatFixed(value: number, decimals: number): string;
/**
 * Parse a fixed-point number string back to number
 * @param str - String representation of number
 * @returns Parsed number
 */
declare function parseFixed(str: string): number;

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
declare function stableStringify(obj: unknown, maxDecimals?: number): string;
/**
 * Create a hash-friendly string representation of an object
 * @param obj - Object to convert
 * @returns String suitable for hashing
 */
declare function toHashString(obj: unknown): string;
/**
 * Compare two objects for equality using stable stringify
 * @param a - First object
 * @param b - Second object
 * @returns True if objects are equivalent
 */
declare function stableEqual(a: unknown, b: unknown): boolean;
/**
 * Create a deterministic digest payload for hashing
 * @param payload - Object to create digest from
 * @returns Digest string
 */
declare function createDigest(payload: Record<string, unknown>): string;

/**
 * Core CO₂e conversion functions
 * @fileoverview Main conversion functions for energy to CO₂e calculations
 */

/**
 * Convert energy to CO₂e in kg
 * @param energy - Energy value
 * @param unit - Energy unit
 * @param factorKgPerKWh - Emission factor in kg CO₂e per kWh
 * @returns CO₂e emissions in kg
 * @throws InvalidUnitError if unit is not recognized
 */
declare function toCO2eKg(energy: number, unit: Unit, factorKgPerKWh: number): number;
/**
 * Convert energy to CO₂e in tonnes
 * @param energy - Energy value
 * @param unit - Energy unit
 * @param factorKgPerKWh - Emission factor in kg CO₂e per kWh
 * @returns CO₂e emissions in tonnes
 * @throws InvalidUnitError if unit is not recognized
 */
declare function toCO2eTonnes(energy: number, unit: Unit, factorKgPerKWh: number): number;
/**
 * Convert energy to CO₂e with custom rounding
 * @param energy - Energy value
 * @param unit - Energy unit
 * @param factorKgPerKWh - Emission factor in kg CO₂e per kWh
 * @param decimals - Number of decimal places for rounding
 * @param roundingMode - Rounding mode
 * @returns CO₂e emissions in tonnes with specified rounding
 * @throws InvalidUnitError if unit is not recognized
 */
declare function toCO2eTonnesRounded(energy: number, unit: Unit, factorKgPerKWh: number, decimals?: number, roundingMode?: 'HALF_UP' | 'DOWN' | 'TRUNC'): number;
/**
 * Convert energy to CO₂e in kg with custom rounding
 * @param energy - Energy value
 * @param unit - Energy unit
 * @param factorKgPerKWh - Emission factor in kg CO₂e per kWh
 * @param decimals - Number of decimal places for rounding
 * @param roundingMode - Rounding mode
 * @returns CO₂e emissions in kg with specified rounding
 * @throws InvalidUnitError if unit is not recognized
 */
declare function toCO2eKgRounded(energy: number, unit: Unit, factorKgPerKWh: number, decimals?: number, roundingMode?: 'HALF_UP' | 'DOWN' | 'TRUNC'): number;
/**
 * Calculate CO₂e emissions with uncertainty bounds
 * @param energy - Energy value
 * @param unit - Energy unit
 * @param factorKgPerKWh - Emission factor in kg CO₂e per kWh
 * @param uncertaintyPct - Uncertainty percentage (±%)
 * @param decimals - Number of decimal places for rounding
 * @returns Object with base value and uncertainty bounds
 * @throws InvalidUnitError if unit is not recognized
 */
declare function toCO2eWithUncertainty(energy: number, unit: Unit, factorKgPerKWh: number, uncertaintyPct: number, decimals?: number): {
    baseTCO2e: number;
    lowerTCO2e: number;
    upperTCO2e: number;
    uncertaintyPct: number;
};
/**
 * Batch convert multiple energy values to CO₂e
 * @param inputs - Array of energy conversion inputs
 * @returns Array of CO₂e results in tonnes
 */
declare function batchToCO2eTonnes(inputs: Array<{
    energy: number;
    unit: Unit;
    factorKgPerKWh: number;
}>): number[];
/**
 * Calculate total CO₂e emissions from multiple energy sources
 * @param inputs - Array of energy conversion inputs
 * @param decimals - Number of decimal places for rounding
 * @param roundingMode - Rounding mode
 * @returns Total CO₂e emissions in tonnes
 */
declare function totalCO2eTonnes(inputs: Array<{
    energy: number;
    unit: Unit;
    factorKgPerKWh: number;
}>, decimals?: number, roundingMode?: 'HALF_UP' | 'DOWN' | 'TRUNC'): number;

/**
 * Avoided emissions calculator
 * @fileoverview Functions for calculating avoided emissions vs grid baseline
 */

/**
 * Calculate avoided emissions vs grid baseline
 * @param input - Avoided emissions input parameters
 * @returns Avoided emissions result with uncertainty bounds if applicable
 */
declare function avoidedEmissions(input: AvoidedInput$1): AvoidedResult;
/**
 * Calculate avoided emissions with uncertainty bounds
 * @param input - Avoided emissions input parameters
 * @param uncertaintyPct - Uncertainty percentage (±%)
 * @returns Avoided emissions result with uncertainty bounds
 */
declare function avoidedEmissionsWithUncertainty(input: AvoidedInput$1, uncertaintyPct: number): AvoidedResult;
/**
 * Calculate avoided emissions for multiple energy sources
 * @param inputs - Array of avoided emissions inputs
 * @returns Array of avoided emissions results
 */
declare function batchAvoidedEmissions(inputs: AvoidedInput$1[]): AvoidedResult[];
/**
 * Calculate total avoided emissions from multiple sources
 * @param inputs - Array of avoided emissions inputs
 * @param rounding - Optional rounding configuration
 * @returns Total avoided emissions result
 */
declare function totalAvoidedEmissions(inputs: AvoidedInput$1[], rounding?: {
    decimals?: number;
    mode?: 'HALF_UP' | 'DOWN' | 'TRUNC';
}): AvoidedResult;
/**
 * Calculate avoided emissions with methodology-specific adjustments
 * @param input - Avoided emissions input parameters
 * @param methodology - Methodology name (e.g., 'RE-SOLAR', 'RE-WIND')
 * @param adjustments - Optional methodology-specific adjustments
 * @returns Avoided emissions result with methodology metadata
 */
declare function avoidedEmissionsWithMethodology(input: AvoidedInput$1, methodology: string, adjustments?: {
    efficiencyFactor?: number;
    degradationFactor?: number;
    uncertaintyPct?: number;
}): AvoidedResult;

/**
 * Factor resolution and registry management
 * @fileoverview Functions for resolving emission factors by region, date, and scope
 */

/**
 * Initialize the factor registry with default data
 * @param factorPack - Array of emission factors
 * @param regions - Array of region mappings
 */
declare function initializeFactorRegistry(factorPack: Factor$1[], regions: Array<{
    code: string;
    name: string;
    iso2?: string;
    iso3?: string;
    unM49?: string;
}>): void;
/**
 * Load factor pack from JSON data
 * @param jsonData - JSON data containing factors
 * @param regions - Optional region mappings
 */
declare function loadFactorPack(jsonData: unknown, regions?: Array<{
    code: string;
    name: string;
    iso2?: string;
    iso3?: string;
    unM49?: string;
}>): void;
/**
 * Resolve emission factor based on options
 * @param options - Resolution options
 * @returns Resolved emission factor
 * @throws UnknownRegionError if region is not found
 * @throws NoFactorForDateError if no factor found for the date
 */
declare function resolveFactor(options: FactorResolutionOptions): Factor$1;
/**
 * List all available factors with optional filtering
 * @param filter - Optional filter criteria
 * @returns Array of matching factors
 */
declare function listFactors(filter?: FactorFilter): Factor$1[];
/**
 * Get all available regions
 * @returns Array of region codes
 */
declare function getAvailableRegions(): string[];
/**
 * Get all available scopes for a region
 * @param region - Region code
 * @returns Array of scope types
 */
declare function getAvailableScopes(region?: string): string[];
/**
 * Check if a region is supported
 * @param region - Region code to check
 * @returns True if region is supported
 */
declare function isRegionSupported(region: string): boolean;
/**
 * Get region information by code
 * @param regionCode - Region code
 * @returns Region information or null if not found
 */
declare function getRegionInfo(regionCode: string): {
    code: string;
    name: string;
    iso2?: string;
    iso3?: string;
    unM49?: string;
} | null;
/**
 * Get factor by ID
 * @param id - Factor ID
 * @returns Factor or null if not found
 */
declare function getFactorById(id: string): Factor$1 | null;
/**
 * Get factors for a specific region and scope
 * @param region - Region code
 * @param scope - Scope type
 * @returns Array of factors
 */
declare function getFactorsByRegionAndScope(region: string, scope: string): Factor$1[];
/**
 * Get the latest factor for a region and scope
 * @param region - Region code
 * @param scope - Scope type
 * @returns Latest factor or null if not found
 */
declare function getLatestFactor(region: string, scope: string): Factor$1 | null;

export { type AvoidedInput$1 as AvoidedInput, type AvoidedResult, type Factor$1 as Factor, type FactorFilter, type FactorResolutionOptions, type FactorSource, GWhToKWh, type GasType, InvalidFactorError, InvalidUnitError, MWhToKWh, type MassUnit, NoFactorForDateError, type RoundingMode, type SafeError, type SafeResult, type SafeReturn, type Scope, type UncertaintyBounds, type Unit, UnknownRegionError, approximatelyEqual, avoidedEmissions, avoidedEmissionsWithMethodology, avoidedEmissionsWithUncertainty, batchAvoidedEmissions, batchToCO2eTonnes, calculatePercentage, calculateUncertaintyBounds, clamp, createDigest, formatFixed, getAvailableRegions, getAvailableScopes, getEnergyConversionFactor, getFactorById, getFactorsByRegionAndScope, getLatestFactor, getMassConversionFactor, getRegionInfo, loadFactorPack as initializeDefaultFactors, initializeFactorRegistry, isRegionSupported, kWhToGWh, kWhToMWh, kgToTonnes, listFactors, loadFactorPack, normalizeToKWh, normalizeToKgCO2e, normalizeToTonnesCO2e, parseFixed, resolveFactor, roundStable, safeAdd, safeMultiply, safeProduct, safeSum, stableEqual, stableStringify, toCO2eKg, toCO2eKgRounded, toCO2eTonnes, toCO2eTonnesRounded, toCO2eWithUncertainty, toHashString, tonnesToKg, totalAvoidedEmissions, totalCO2eTonnes, validateAvoidedInput, validateFactor, validateFactorPack, validateRegionPack };
