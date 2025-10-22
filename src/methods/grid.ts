/**
 * Core CO₂e conversion functions
 * @fileoverview Main conversion functions for energy to CO₂e calculations
 */

import { Unit } from '../types';
import { normalizeToKWh } from '../util/units';
import { safeMultiply, roundStable } from '../util/math';

/**
 * Convert energy to CO₂e in kg
 * @param energy - Energy value
 * @param unit - Energy unit
 * @param factorKgPerKWh - Emission factor in kg CO₂e per kWh
 * @returns CO₂e emissions in kg
 * @throws InvalidUnitError if unit is not recognized
 */
export function toCO2eKg(energy: number, unit: Unit, factorKgPerKWh: number): number {
  if (!Number.isFinite(energy) || !Number.isFinite(factorKgPerKWh)) {
    throw new Error('Energy and factor must be finite numbers');
  }

  if (energy < 0) {
    throw new Error('Energy cannot be negative');
  }

  if (factorKgPerKWh < 0) {
    throw new Error('Emission factor cannot be negative');
  }

  // Normalize energy to kWh
  const energyKWh = normalizeToKWh(energy, unit);
  
  // Calculate CO₂e in kg using safe multiplication
  const co2eKg = safeMultiply(energyKWh, factorKgPerKWh);
  
  return co2eKg;
}

/**
 * Convert energy to CO₂e in tonnes
 * @param energy - Energy value
 * @param unit - Energy unit
 * @param factorKgPerKWh - Emission factor in kg CO₂e per kWh
 * @returns CO₂e emissions in tonnes
 * @throws InvalidUnitError if unit is not recognized
 */
export function toCO2eTonnes(energy: number, unit: Unit, factorKgPerKWh: number): number {
  const co2eKg = toCO2eKg(energy, unit, factorKgPerKWh);
  return co2eKg / 1000;
}

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
export function toCO2eTonnesRounded(
  energy: number,
  unit: Unit,
  factorKgPerKWh: number,
  decimals: number = 6,
  roundingMode: 'HALF_UP' | 'DOWN' | 'TRUNC' = 'HALF_UP'
): number {
  const co2eTonnes = toCO2eTonnes(energy, unit, factorKgPerKWh);
  return roundStable(co2eTonnes, decimals, roundingMode);
}

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
export function toCO2eKgRounded(
  energy: number,
  unit: Unit,
  factorKgPerKWh: number,
  decimals: number = 6,
  roundingMode: 'HALF_UP' | 'DOWN' | 'TRUNC' = 'HALF_UP'
): number {
  const co2eKg = toCO2eKg(energy, unit, factorKgPerKWh);
  return roundStable(co2eKg, decimals, roundingMode);
}

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
export function toCO2eWithUncertainty(
  energy: number,
  unit: Unit,
  factorKgPerKWh: number,
  uncertaintyPct: number,
  decimals: number = 6
): {
  baseTCO2e: number;
  lowerTCO2e: number;
  upperTCO2e: number;
  uncertaintyPct: number;
} {
  const baseTCO2e = toCO2eTonnesRounded(energy, unit, factorKgPerKWh, decimals);
  const uncertainty = (baseTCO2e * uncertaintyPct) / 100;
  
  const lowerTCO2e = roundStable(baseTCO2e - uncertainty, decimals);
  const upperTCO2e = roundStable(baseTCO2e + uncertainty, decimals);
  
  return {
    baseTCO2e,
    lowerTCO2e,
    upperTCO2e,
    uncertaintyPct
  };
}

/**
 * Batch convert multiple energy values to CO₂e
 * @param inputs - Array of energy conversion inputs
 * @returns Array of CO₂e results in tonnes
 */
export function batchToCO2eTonnes(
  inputs: Array<{ energy: number; unit: Unit; factorKgPerKWh: number }>
): number[] {
  return inputs.map(input => 
    toCO2eTonnes(input.energy, input.unit, input.factorKgPerKWh)
  );
}

/**
 * Calculate total CO₂e emissions from multiple energy sources
 * @param inputs - Array of energy conversion inputs
 * @param decimals - Number of decimal places for rounding
 * @param roundingMode - Rounding mode
 * @returns Total CO₂e emissions in tonnes
 */
export function totalCO2eTonnes(
  inputs: Array<{ energy: number; unit: Unit; factorKgPerKWh: number }>,
  decimals: number = 6,
  roundingMode: 'HALF_UP' | 'DOWN' | 'TRUNC' = 'HALF_UP'
): number {
  const individualEmissions = batchToCO2eTonnes(inputs);
  const total = individualEmissions.reduce((sum, emission) => sum + emission, 0);
  return roundStable(total, decimals, roundingMode);
}
