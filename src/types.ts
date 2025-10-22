/**
 * Core types for carbon conversion library
 * @fileoverview Type definitions for CO₂e conversion operations
 */

/**
 * Energy unit types
 */
export type Unit = 'kWh' | 'MWh' | 'GWh';

/**
 * Mass unit types for CO₂e
 */
export type MassUnit = 'kgCO2e' | 'tCO2e';

/**
 * Rounding modes for deterministic calculations
 */
export type RoundingMode = 'HALF_UP' | 'DOWN' | 'TRUNC';

/**
 * Scope types for emission factors
 */
export type Scope = 'operational' | 'marginal' | 'baseline';

/**
 * Gas types (extensible for future greenhouse gases)
 */
export type GasType = 'CO2e';

/**
 * Source information for emission factors
 */
export interface FactorSource {
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
export interface Factor {
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
export interface AvoidedInput {
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
export interface UncertaintyBounds {
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
export interface AvoidedResult {
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
export interface FactorResolutionOptions {
  /** Region code to filter by */
  region?: string;
  /** Date to find effective factor for */
  date?: string;
  /** Scope to filter by */
  scope?: Scope;
  /** Override factors to use instead of default registry */
  overrides?: Factor[];
}

/**
 * Filter options for listing factors
 */
export interface FactorFilter {
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
export class UnknownRegionError extends Error {
  constructor(region: string) {
    super(`Unknown region: ${region}`);
    this.name = 'UnknownRegionError';
  }
}

export class NoFactorForDateError extends Error {
  constructor(region: string, date: string) {
    super(`No factor found for region ${region} on date ${date}`);
    this.name = 'NoFactorForDateError';
  }
}

export class InvalidUnitError extends Error {
  constructor(unit: string) {
    super(`Invalid unit: ${unit}`);
    this.name = 'InvalidUnitError';
  }
}

export class InvalidFactorError extends Error {
  constructor(message: string) {
    super(`Invalid factor: ${message}`);
    this.name = 'InvalidFactorError';
  }
}

/**
 * Safe operation result type
 */
export interface SafeResult<T> {
  ok: true;
  data: T;
}

export interface SafeError {
  ok: false;
  error: {
    code: string;
    message: string;
  };
}

export type SafeReturn<T> = SafeResult<T> | SafeError;
