/**
 * Factor resolution and registry management
 * @fileoverview Functions for resolving emission factors by region, date, and scope
 */

import { Factor, FactorResolutionOptions, FactorFilter, UnknownRegionError, NoFactorForDateError } from '../types';
import { validateFactorPack } from '../schema';

// Default factor pack loaded at initialization
let defaultFactorPack: Factor[] = [];
let regionMappings: Array<{ code: string; name: string; iso2?: string; iso3?: string; unM49?: string }> = [];

/**
 * Initialize the factor registry with default data
 * @param factorPack - Array of emission factors
 * @param regions - Array of region mappings
 */
export function initializeFactorRegistry(
  factorPack: Factor[],
  regions: Array<{ code: string; name: string; iso2?: string; iso3?: string; unM49?: string }>
): void {
  // Validate factor pack
  defaultFactorPack = validateFactorPack(factorPack);
  regionMappings = regions;
}

/**
 * Load factor pack from JSON data
 * @param jsonData - JSON data containing factors
 * @param regions - Optional region mappings
 */
export function loadFactorPack(
  jsonData: unknown,
  regions?: Array<{ code: string; name: string; iso2?: string; iso3?: string; unM49?: string }>
): void {
  const factors = validateFactorPack(jsonData);
  initializeFactorRegistry(factors, regions || []);
}

/**
 * Resolve emission factor based on options
 * @param options - Resolution options
 * @returns Resolved emission factor
 * @throws UnknownRegionError if region is not found
 * @throws NoFactorForDateError if no factor found for the date
 */
export function resolveFactor(options: FactorResolutionOptions): Factor {
  const { region = 'WORLD', date, scope = 'baseline', overrides } = options;
  
  // Use overrides if provided, otherwise use default pack
  const factorPack = overrides || defaultFactorPack;
  
  if (factorPack.length === 0) {
    throw new Error('No factors available. Initialize factor registry first.');
  }
  
  // Normalize region code
  const normalizedRegion = normalizeRegionCode(region);
  
  // Filter factors by region and scope
  let candidates = factorPack.filter(factor => 
    factor.region === normalizedRegion && factor.scope === scope
  );
  
  // If no factors found for the region, try WORLD fallback
  if (candidates.length === 0 && normalizedRegion !== 'WORLD') {
    candidates = factorPack.filter(factor => 
      factor.region === 'WORLD' && factor.scope === scope
    );
  }
  
  if (candidates.length === 0) {
    throw new UnknownRegionError(region);
  }
  
  // If date is provided, filter by effective date range
  if (date) {
    const targetDate = new Date(date);
    candidates = candidates.filter(factor => {
      const fromDate = new Date(factor.effectiveFrom);
      const toDate = factor.effectiveTo ? new Date(factor.effectiveTo) : new Date('2099-12-31');
      return targetDate >= fromDate && targetDate <= toDate;
    });
    
    if (candidates.length === 0) {
      throw new NoFactorForDateError(region, date);
    }
    
    // Sort by effective date (most recent first)
    candidates.sort((a, b) => {
      const dateA = new Date(a.effectiveFrom);
      const dateB = new Date(b.effectiveFrom);
      return dateB.getTime() - dateA.getTime();
    });
  }
  
  // Return the first (most recent) candidate
  return candidates[0]!;
}

/**
 * List all available factors with optional filtering
 * @param filter - Optional filter criteria
 * @returns Array of matching factors
 */
export function listFactors(filter?: FactorFilter): Factor[] {
  let factors = [...defaultFactorPack];
  
  if (!filter) {
    return factors;
  }
  
  // Apply region filter
  if (filter.region) {
    const normalizedRegion = normalizeRegionCode(filter.region);
    factors = factors.filter(factor => factor.region === normalizedRegion);
  }
  
  // Apply scope filter
  if (filter.scope) {
    factors = factors.filter(factor => factor.scope === filter.scope);
  }
  
  // Apply date range filter
  if (filter.from || filter.to) {
    factors = factors.filter(factor => {
      const factorFrom = new Date(factor.effectiveFrom);
      const factorTo = factor.effectiveTo ? new Date(factor.effectiveTo) : new Date('2099-12-31');
      
      if (filter.from) {
        const fromDate = new Date(filter.from);
        if (factorTo < fromDate) return false;
      }
      
      if (filter.to) {
        const toDate = new Date(filter.to);
        if (factorFrom > toDate) return false;
      }
      
      return true;
    });
  }
  
  return factors;
}

/**
 * Get all available regions
 * @returns Array of region codes
 */
export function getAvailableRegions(): string[] {
  const regions = new Set<string>();
  defaultFactorPack.forEach(factor => regions.add(factor.region));
  return Array.from(regions).sort();
}

/**
 * Get all available scopes for a region
 * @param region - Region code
 * @returns Array of scope types
 */
export function getAvailableScopes(region?: string): string[] {
  let factors = defaultFactorPack;
  
  if (region) {
    const normalizedRegion = normalizeRegionCode(region);
    factors = factors.filter(factor => factor.region === normalizedRegion);
  }
  
  const scopes = new Set<string>();
  factors.forEach(factor => scopes.add(factor.scope));
  return Array.from(scopes).sort();
}

/**
 * Check if a region is supported
 * @param region - Region code to check
 * @returns True if region is supported
 */
export function isRegionSupported(region: string): boolean {
  try {
    const normalizedRegion = normalizeRegionCode(region);
    return defaultFactorPack.some(factor => factor.region === normalizedRegion);
  } catch {
    return false;
  }
}

/**
 * Get region information by code
 * @param regionCode - Region code
 * @returns Region information or null if not found
 */
export function getRegionInfo(regionCode: string): { code: string; name: string; iso2?: string; iso3?: string; unM49?: string } | null {
  return regionMappings.find(region => 
    region.code === regionCode || 
    region.iso2 === regionCode || 
    region.iso3 === regionCode ||
    region.unM49 === regionCode
  ) || null;
}

/**
 * Normalize region code to standard format
 * @param regionCode - Input region code
 * @returns Normalized region code
 */
function normalizeRegionCode(regionCode: string): string {
  if (!regionCode) return 'WORLD';
  
  // Convert to uppercase
  const upperCode = regionCode.toUpperCase();
  
  // Check if it's already a known region code
  const regionInfo = getRegionInfo(upperCode);
  if (regionInfo) {
    return regionInfo.code;
  }
  
  // If not found, return as-is (might be a custom region)
  return upperCode;
}

/**
 * Get factor by ID
 * @param id - Factor ID
 * @returns Factor or null if not found
 */
export function getFactorById(id: string): Factor | null {
  return defaultFactorPack.find(factor => factor.id === id) ?? null;
}

/**
 * Get factors for a specific region and scope
 * @param region - Region code
 * @param scope - Scope type
 * @returns Array of factors
 */
export function getFactorsByRegionAndScope(region: string, scope: string): Factor[] {
  const normalizedRegion = normalizeRegionCode(region);
  return defaultFactorPack.filter(factor => 
    factor.region === normalizedRegion && factor.scope === scope
  );
}

/**
 * Get the latest factor for a region and scope
 * @param region - Region code
 * @param scope - Scope type
 * @returns Latest factor or null if not found
 */
export function getLatestFactor(region: string, scope: string): Factor | null {
  const factors = getFactorsByRegionAndScope(region, scope);
  
  if (factors.length === 0) {
    return null;
  }
  
  // Sort by effective date (most recent first)
  factors.sort((a, b) => {
    const dateA = new Date(a.effectiveFrom);
    const dateB = new Date(b.effectiveFrom);
    return dateB.getTime() - dateA.getTime();
  });
  
  return factors[0] ?? null;
}
