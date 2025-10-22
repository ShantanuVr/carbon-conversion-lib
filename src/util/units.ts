/**
 * Unit conversion utilities
 * @fileoverview Functions for converting between energy and mass units
 */

import { Unit, MassUnit, InvalidUnitError } from '../types';

/**
 * Convert kWh to MWh
 * @param kWh - Energy in kilowatt-hours
 * @returns Energy in megawatt-hours
 */
export function kWhToMWh(kWh: number): number {
  return kWh / 1000;
}

/**
 * Convert MWh to kWh
 * @param MWh - Energy in megawatt-hours
 * @returns Energy in kilowatt-hours
 */
export function MWhToKWh(MWh: number): number {
  return MWh * 1000;
}

/**
 * Convert GWh to kWh
 * @param GWh - Energy in gigawatt-hours
 * @returns Energy in kilowatt-hours
 */
export function GWhToKWh(GWh: number): number {
  return GWh * 1_000_000;
}

/**
 * Convert kWh to GWh
 * @param kWh - Energy in kilowatt-hours
 * @returns Energy in gigawatt-hours
 */
export function kWhToGWh(kWh: number): number {
  return kWh / 1_000_000;
}

/**
 * Convert kg to tonnes
 * @param kg - Mass in kilograms
 * @returns Mass in tonnes
 */
export function kgToTonnes(kg: number): number {
  return kg / 1000;
}

/**
 * Convert tonnes to kg
 * @param tonnes - Mass in tonnes
 * @returns Mass in kilograms
 */
export function tonnesToKg(tonnes: number): number {
  return tonnes * 1000;
}

/**
 * Convert any energy unit to kWh
 * @param energy - Energy value
 * @param unit - Source unit
 * @returns Energy in kWh
 * @throws InvalidUnitError if unit is not recognized
 */
export function normalizeToKWh(energy: number, unit: Unit): number {
  switch (unit) {
    case 'kWh':
      return energy;
    case 'MWh':
      return MWhToKWh(energy);
    case 'GWh':
      return GWhToKWh(energy);
    default:
      throw new InvalidUnitError(unit);
  }
}

/**
 * Convert any mass unit to kg CO₂e
 * @param mass - Mass value
 * @param unit - Source unit
 * @returns Mass in kg CO₂e
 * @throws InvalidUnitError if unit is not recognized
 */
export function normalizeToKgCO2e(mass: number, unit: MassUnit): number {
  switch (unit) {
    case 'kgCO2e':
      return mass;
    case 'tCO2e':
      return tonnesToKg(mass);
    default:
      throw new InvalidUnitError(unit);
  }
}

/**
 * Convert any mass unit to tonnes CO₂e
 * @param mass - Mass value
 * @param unit - Source unit
 * @returns Mass in tonnes CO₂e
 * @throws InvalidUnitError if unit is not recognized
 */
export function normalizeToTonnesCO2e(mass: number, unit: MassUnit): number {
  switch (unit) {
    case 'kgCO2e':
      return kgToTonnes(mass);
    case 'tCO2e':
      return mass;
    default:
      throw new InvalidUnitError(unit);
  }
}

/**
 * Get conversion factor from any energy unit to kWh
 * @param unit - Source unit
 * @returns Conversion factor (multiply by this to get kWh)
 * @throws InvalidUnitError if unit is not recognized
 */
export function getEnergyConversionFactor(unit: Unit): number {
  switch (unit) {
    case 'kWh':
      return 1;
    case 'MWh':
      return 1000;
    case 'GWh':
      return 1_000_000;
    default:
      throw new InvalidUnitError(unit);
  }
}

/**
 * Get conversion factor from any mass unit to kg CO₂e
 * @param unit - Source unit
 * @returns Conversion factor (multiply by this to get kg CO₂e)
 * @throws InvalidUnitError if unit is not recognized
 */
export function getMassConversionFactor(unit: MassUnit): number {
  switch (unit) {
    case 'kgCO2e':
      return 1;
    case 'tCO2e':
      return 1000;
    default:
      throw new InvalidUnitError(unit);
  }
}
