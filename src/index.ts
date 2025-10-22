/**
 * Carbon Conversion Library - Main Entry Point
 * @fileoverview CO₂e Conversion & Methodology Toolkit
 * 
 * A deterministic, auditable library for converting energy to CO₂e emissions
 * using region/methodology-specific grid emission factors.
 */

// Export types (avoid conflicts by not re-exporting from schema)
export type {
  Unit,
  MassUnit,
  RoundingMode,
  Scope,
  GasType,
  FactorSource,
  Factor,
  AvoidedInput,
  UncertaintyBounds,
  AvoidedResult,
  FactorResolutionOptions,
  FactorFilter,
  SafeResult,
  SafeError,
  SafeReturn
} from './types';

// Export error classes
export {
  UnknownRegionError,
  NoFactorForDateError,
  InvalidUnitError,
  InvalidFactorError
} from './types';

// Export schemas and validation functions
export {
  validateFactorPack,
  validateRegionPack,
  validateFactor,
  validateAvoidedInput
} from './schema';

// Export unit conversion functions
export {
  kWhToMWh,
  MWhToKWh,
  GWhToKWh,
  kWhToGWh,
  kgToTonnes,
  tonnesToKg,
  normalizeToKWh,
  normalizeToKgCO2e,
  normalizeToTonnesCO2e,
  getEnergyConversionFactor,
  getMassConversionFactor
} from './util/units';

// Export math utilities
export {
  roundStable,
  safeAdd,
  safeMultiply,
  safeSum,
  safeProduct,
  approximatelyEqual,
  clamp,
  calculatePercentage,
  calculateUncertaintyBounds,
  formatFixed,
  parseFixed
} from './util/math';

// Export hash utilities
export {
  stableStringify,
  toHashString,
  stableEqual,
  createDigest
} from './util/hash';

// Export core conversion functions
export {
  toCO2eKg,
  toCO2eTonnes,
  toCO2eTonnesRounded,
  toCO2eKgRounded,
  toCO2eWithUncertainty,
  batchToCO2eTonnes,
  totalCO2eTonnes
} from './methods/grid';

// Export avoided emissions functions
export {
  avoidedEmissions,
  avoidedEmissionsWithUncertainty,
  batchAvoidedEmissions,
  totalAvoidedEmissions,
  avoidedEmissionsWithMethodology
} from './methods/avoided';

// Export factor resolution functions
export {
  initializeFactorRegistry,
  loadFactorPack,
  resolveFactor,
  listFactors,
  getAvailableRegions,
  getAvailableScopes,
  isRegionSupported,
  getRegionInfo,
  getFactorById,
  getFactorsByRegionAndScope,
  getLatestFactor
} from './factors/index';

// Initialize with default factor pack
import { loadFactorPack } from './factors/index';

// Default factor data (embedded)
const defaultFactors = [
  {
    "id": "WORLD-DEFAULT-2024",
    "region": "WORLD",
    "scope": "baseline",
    "gas": "CO2e",
    "valueKgPerKWh": 0.82,
    "effectiveFrom": "2024-01-01",
    "source": { "name": "Demo Default", "note": "Coal-heavy illustrative baseline" },
    "version": "v1"
  },
  {
    "id": "IN-2024-BASELINE",
    "region": "IN",
    "scope": "baseline",
    "gas": "CO2e",
    "valueKgPerKWh": 0.708,
    "effectiveFrom": "2024-01-01",
    "source": { "name": "Illustrative India factor (demo)", "note": "Replace with official source in production" },
    "version": "v1"
  },
  {
    "id": "US-2024-BASELINE",
    "region": "US",
    "scope": "baseline",
    "gas": "CO2e",
    "valueKgPerKWh": 0.386,
    "effectiveFrom": "2024-01-01",
    "source": { "name": "Illustrative US avg (demo)" },
    "version": "v1"
  },
  {
    "id": "EU-2024-BASELINE",
    "region": "EU",
    "scope": "baseline",
    "gas": "CO2e",
    "valueKgPerKWh": 0.255,
    "effectiveFrom": "2024-01-01",
    "source": { "name": "Illustrative EU avg (demo)" },
    "version": "v1"
  }
];

const defaultRegions = [
  { "code": "WORLD", "name": "World" },
  { "code": "IN", "name": "India", "iso2": "IN", "iso3": "IND", "unM49": "356" },
  { "code": "US", "name": "United States", "iso2": "US", "iso3": "USA", "unM49": "840" },
  { "code": "EU", "name": "European Union" }
];

// Initialize the factor registry with default data
try {
  loadFactorPack(defaultFactors, defaultRegions);
} catch (error) {
  console.warn('Failed to initialize default factor pack:', error);
}

// Re-export the loadFactorPack function for manual initialization
export { loadFactorPack as initializeDefaultFactors };
