/**
 * Avoided emissions calculator
 * @fileoverview Functions for calculating avoided emissions vs grid baseline
 */

import { AvoidedInput, AvoidedResult, UncertaintyBounds } from '../types';
import { normalizeToKWh } from '../util/units';
import { safeMultiply, roundStable, calculateUncertaintyBounds } from '../util/math';

/**
 * Calculate avoided emissions vs grid baseline
 * @param input - Avoided emissions input parameters
 * @returns Avoided emissions result with uncertainty bounds if applicable
 */
export function avoidedEmissions(input: AvoidedInput): AvoidedResult {
  // Validate input
  if (!Number.isFinite(input.energy) || !Number.isFinite(input.factorKgPerKWh)) {
    throw new Error('Energy and factor must be finite numbers');
  }

  if (input.energy < 0) {
    throw new Error('Energy cannot be negative');
  }

  if (input.factorKgPerKWh < 0) {
    throw new Error('Emission factor cannot be negative');
  }

  // Normalize energy to kWh
  const energyKWh = normalizeToKWh(input.energy, input.inputUnit);
  
  // Calculate avoided emissions in kg CO₂e
  const kgCO2e = safeMultiply(energyKWh, input.factorKgPerKWh);
  
  // Convert to tonnes CO₂e
  const tCO2e = kgCO2e / 1000;
  
  // Apply rounding if specified
  const decimals = input.rounding?.decimals ?? 6;
  const roundingMode = input.rounding?.mode ?? 'HALF_UP';
  
  const roundedTCO2e = roundStable(tCO2e, decimals, roundingMode);
  const roundedKgCO2e = roundStable(kgCO2e, decimals, roundingMode);
  
  // Build result
  const result: AvoidedResult = {
    tCO2e: roundedTCO2e,
    kgCO2e: roundedKgCO2e,
    factorKgPerKWh: input.factorKgPerKWh,
    energyKWh: energyKWh,
    meta: {
      inputUnit: input.inputUnit,
      rounding: input.rounding,
      calculatedAt: new Date().toISOString()
    }
  };
  
  return result;
}

/**
 * Calculate avoided emissions with uncertainty bounds
 * @param input - Avoided emissions input parameters
 * @param uncertaintyPct - Uncertainty percentage (±%)
 * @returns Avoided emissions result with uncertainty bounds
 */
export function avoidedEmissionsWithUncertainty(
  input: AvoidedInput,
  uncertaintyPct: number
): AvoidedResult {
  const baseResult = avoidedEmissions(input);
  
  // Calculate uncertainty bounds
  const uncertaintyBounds = calculateUncertaintyBounds(
    baseResult.tCO2e,
    uncertaintyPct,
    input.rounding?.decimals ?? 6,
    input.rounding?.mode ?? 'HALF_UP'
  );
  
  const uncertainty: UncertaintyBounds = {
    plusMinusPct: uncertaintyBounds.plusMinusPct,
    lowerTCO2e: uncertaintyBounds.lower,
    upperTCO2e: uncertaintyBounds.upper
  };
  
  return {
    ...baseResult,
    uncertainty
  };
}

/**
 * Calculate avoided emissions for multiple energy sources
 * @param inputs - Array of avoided emissions inputs
 * @returns Array of avoided emissions results
 */
export function batchAvoidedEmissions(inputs: AvoidedInput[]): AvoidedResult[] {
  return inputs.map(input => avoidedEmissions(input));
}

/**
 * Calculate total avoided emissions from multiple sources
 * @param inputs - Array of avoided emissions inputs
 * @param rounding - Optional rounding configuration
 * @returns Total avoided emissions result
 */
export function totalAvoidedEmissions(
  inputs: AvoidedInput[],
  rounding?: { decimals?: number; mode?: 'HALF_UP' | 'DOWN' | 'TRUNC' }
): AvoidedResult {
  const individualResults = batchAvoidedEmissions(inputs);
  
  // Sum up all emissions
  const totalKgCO2e = individualResults.reduce((sum, result) => sum + result.kgCO2e, 0);
  const totalTCO2e = individualResults.reduce((sum, result) => sum + result.tCO2e, 0);
  const totalEnergyKWh = individualResults.reduce((sum, result) => sum + result.energyKWh, 0);
  
  // Calculate weighted average factor
  const weightedFactor = totalEnergyKWh > 0 
    ? individualResults.reduce((sum, result) => sum + (result.factorKgPerKWh * result.energyKWh), 0) / totalEnergyKWh
    : 0;
  
  // Apply rounding
  const decimals = rounding?.decimals ?? 6;
  const roundingMode = rounding?.mode ?? 'HALF_UP';
  
  const roundedTCO2e = roundStable(totalTCO2e, decimals, roundingMode);
  const roundedKgCO2e = roundStable(totalKgCO2e, decimals, roundingMode);
  const roundedFactor = roundStable(weightedFactor, decimals, roundingMode);
  
  return {
    tCO2e: roundedTCO2e,
    kgCO2e: roundedKgCO2e,
    factorKgPerKWh: roundedFactor,
    energyKWh: totalEnergyKWh,
    meta: {
      sourceCount: inputs.length,
      rounding,
      calculatedAt: new Date().toISOString()
    }
  };
}

/**
 * Calculate avoided emissions with methodology-specific adjustments
 * @param input - Avoided emissions input parameters
 * @param methodology - Methodology name (e.g., 'RE-SOLAR', 'RE-WIND')
 * @param adjustments - Optional methodology-specific adjustments
 * @returns Avoided emissions result with methodology metadata
 */
export function avoidedEmissionsWithMethodology(
  input: AvoidedInput,
  methodology: string,
  adjustments?: {
    efficiencyFactor?: number;
    degradationFactor?: number;
    uncertaintyPct?: number;
  }
): AvoidedResult {
  let adjustedInput = { ...input };
  
  // Apply efficiency factor if provided
  if (adjustments?.efficiencyFactor) {
    adjustedInput.energy = adjustedInput.energy * adjustments.efficiencyFactor;
  }
  
  // Apply degradation factor if provided
  if (adjustments?.degradationFactor) {
    adjustedInput.energy = adjustedInput.energy * adjustments.degradationFactor;
  }
  
  const result = avoidedEmissions(adjustedInput);
  
  // Add methodology-specific uncertainty if provided
  if (adjustments?.uncertaintyPct) {
    const uncertaintyBounds = calculateUncertaintyBounds(
      result.tCO2e,
      adjustments.uncertaintyPct,
      input.rounding?.decimals ?? 6,
      input.rounding?.mode ?? 'HALF_UP'
    );
    
    result.uncertainty = {
      plusMinusPct: uncertaintyBounds.plusMinusPct,
      lowerTCO2e: uncertaintyBounds.lower,
      upperTCO2e: uncertaintyBounds.upper
    };
  }
  
  // Add methodology metadata
  result.meta = {
    ...result.meta,
    methodology,
    adjustments: adjustments ? {
      efficiencyFactor: adjustments.efficiencyFactor,
      degradationFactor: adjustments.degradationFactor,
      uncertaintyPct: adjustments.uncertaintyPct
    } : undefined
  };
  
  return result;
}
