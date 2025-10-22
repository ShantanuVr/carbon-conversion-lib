# Carbon Conversion Library

A deterministic, auditable TypeScript library for converting energy to CO₂e emissions using region/methodology-specific grid emission factors.

## Features

- **Deterministic Calculations**: Same inputs always produce the same outputs
- **Region-Specific Factors**: Support for country/region-specific emission factors
- **Multiple Scopes**: Operational, marginal, and baseline emission factors
- **Uncertainty Handling**: Built-in support for uncertainty bounds (±%)
- **Unit Conversions**: kWh ↔ MWh ↔ GWh, kg CO₂e ↔ t CO₂e
- **Deterministic Rounding**: Configurable rounding modes for consistent results
- **Hash Stability**: Stable stringify for deterministic hashing
- **Zero Dependencies**: No runtime dependencies, pure functions
- **TypeScript First**: Full type safety and IntelliSense support

## Installation

```bash
npm install @carbon/convert
```

## Quick Start

```typescript
import { avoidedEmissions, resolveFactor } from '@carbon/convert';

// 1. Resolve emission factor for India baseline
const factor = resolveFactor({ region: 'IN', scope: 'baseline' });

// 2. Calculate avoided emissions
const result = avoidedEmissions({
  energy: 5100,
  inputUnit: 'kWh',
  factorKgPerKWh: factor.valueKgPerKWh
});

console.log(`Avoided emissions: ${result.tCO2e} tCO₂e`);
// Output: Avoided emissions: 3.618 tCO₂e
```

## API Reference

### Core Conversion Functions

#### `toCO2eKg(energy, unit, factorKgPerKWh)`
Convert energy to CO₂e emissions in kilograms.

```typescript
import { toCO2eKg } from '@carbon/convert';

const kgCO2e = toCO2eKg(1000, 'kWh', 0.5);
// Returns: 500
```

#### `toCO2eTonnes(energy, unit, factorKgPerKWh)`
Convert energy to CO₂e emissions in tonnes.

```typescript
import { toCO2eTonnes } from '@carbon/convert';

const tCO2e = toCO2eTonnes(1000, 'kWh', 0.5);
// Returns: 0.5
```

### Avoided Emissions

#### `avoidedEmissions(input)`
Calculate avoided emissions vs grid baseline.

```typescript
import { avoidedEmissions } from '@carbon/convert';

const result = avoidedEmissions({
  energy: 1000,
  inputUnit: 'kWh',
  factorKgPerKWh: 0.5,
  rounding: {
    decimals: 2,
    mode: 'HALF_UP'
  }
});

console.log(result);
// Output:
// {
//   tCO2e: 0.5,
//   kgCO2e: 500,
//   factorKgPerKWh: 0.5,
//   energyKWh: 1000,
//   meta: { ... }
// }
```

### Factor Resolution

#### `resolveFactor(options)`
Resolve emission factor by region, date, and scope.

```typescript
import { resolveFactor } from '@carbon/convert';

// Get India baseline factor
const factor = resolveFactor({ 
  region: 'IN', 
  scope: 'baseline' 
});

// Get factor for specific date
const factor2024 = resolveFactor({ 
  region: 'US', 
  scope: 'operational',
  date: '2024-06-15'
});

console.log(factor.valueKgPerKWh); // 0.708
```

#### `listFactors(filter?)`
List all available factors with optional filtering.

```typescript
import { listFactors } from '@carbon/convert';

// Get all factors
const allFactors = listFactors();

// Filter by region
const indiaFactors = listFactors({ region: 'IN' });

// Filter by scope
const baselineFactors = listFactors({ scope: 'baseline' });

// Filter by date range
const recentFactors = listFactors({ 
  from: '2024-01-01', 
  to: '2024-12-31' 
});
```

### Unit Conversions

#### Energy Units
```typescript
import { 
  kWhToMWh, 
  MWhToKWh, 
  GWhToKWh,
  normalizeToKWh 
} from '@carbon/convert';

// Convert between energy units
const mwh = kWhToMWh(1000); // 1
const kwh = MWhToKWh(1);    // 1000

// Normalize any energy unit to kWh
const kwh = normalizeToKWh(1, 'MWh');     // 1000
const kwh = normalizeToKWh(0.001, 'GWh'); // 1000
```

#### Mass Units
```typescript
import { 
  kgToTonnes, 
  tonnesToKg,
  normalizeToTonnesCO2e 
} from '@carbon/convert';

// Convert between mass units
const tonnes = kgToTonnes(1000); // 1
const kg = tonnesToKg(1);       // 1000

// Normalize any mass unit to tonnes CO₂e
const tonnes = normalizeToTonnesCO2e(1000, 'kgCO2e'); // 1
```

### Math Utilities

#### Deterministic Rounding
```typescript
import { roundStable } from '@carbon/convert';

// Round with different modes
const rounded = roundStable(1.5, 0, 'HALF_UP'); // 2
const rounded = roundStable(1.9, 0, 'DOWN');    // 1
const rounded = roundStable(1.9, 0, 'TRUNC');   // 1

// Round to specific decimal places
const rounded = roundStable(1.234567, 2, 'HALF_UP'); // 1.23
```

#### Safe Math Operations
```typescript
import { safeAdd, safeMultiply, safeSum } from '@carbon/convert';

// Safe operations to minimize floating point errors
const sum = safeAdd(0.1, 0.2);           // 0.3
const product = safeMultiply(0.1, 0.2); // 0.02
const total = safeSum([0.1, 0.2, 0.3]); // 0.6
```

### Hash Utilities

#### Stable Stringify
```typescript
import { stableStringify, createDigest } from '@carbon/convert';

// Create deterministic JSON string
const obj = { c: 3, a: 1, b: 2 };
const str = stableStringify(obj);
// Always produces same output regardless of key order

// Create hash-friendly digest
const payload = {
  siteId: 'PRJ001',
  day: '2025-10-20',
  energyKWh: 1234.56,
  avoidedTCO2e: 0.8736
};
const digest = createDigest(payload);
```

## Usage Examples

### Example 1: Basic Avoided Emissions Calculation

```typescript
import { avoidedEmissions, resolveFactor } from '@carbon/convert';

// Calculate avoided emissions for a solar project in India
const factor = resolveFactor({ region: 'IN', scope: 'baseline' });
const result = avoidedEmissions({
  energy: 5100,
  inputUnit: 'kWh',
  factorKgPerKWh: factor.valueKgPerKWh
});

console.log(`Avoided emissions: ${result.tCO2e} tCO₂e`);
// Output: Avoided emissions: 3.618 tCO₂e
```

### Example 2: MWh Input with Custom Rounding

```typescript
import { avoidedEmissions, resolveFactor } from '@carbon/convert';

// Calculate with MWh input and custom rounding
const factor = resolveFactor({ region: 'US', scope: 'baseline' });
const result = avoidedEmissions({
  energy: 5.1,
  inputUnit: 'MWh',
  factorKgPerKWh: factor.valueKgPerKWh,
  rounding: {
    decimals: 4,
    mode: 'HALF_UP'
  }
});

console.log(`Avoided emissions: ${result.tCO2e} tCO₂e`);
// Output: Avoided emissions: 1.9686 tCO₂e
```

### Example 3: Deterministic Digest Creation

```typescript
import { stableStringify } from '@carbon/convert';

// Create deterministic digest for hashing
const digest = {
  siteId: 'PRJ001',
  day: '2025-10-20',
  energyKWh: 1234.56,
  avoidedTCO2e: 0.8736
};

const payload = stableStringify(digest);
// Canonical order & fixed decimals for consistent hashing
```

### Example 4: Batch Calculations

```typescript
import { batchAvoidedEmissions, totalAvoidedEmissions } from '@carbon/convert';

// Calculate avoided emissions for multiple sources
const inputs = [
  { energy: 1000, inputUnit: 'kWh', factorKgPerKWh: 0.5 },
  { energy: 2, inputUnit: 'MWh', factorKgPerKWh: 0.3 },
  { energy: 0.001, inputUnit: 'GWh', factorKgPerKWh: 0.4 }
];

// Individual results
const individualResults = batchAvoidedEmissions(inputs);

// Total avoided emissions
const totalResult = totalAvoidedEmissions(inputs);
console.log(`Total avoided: ${totalResult.tCO2e} tCO₂e`);
```

### Example 5: Uncertainty Handling

```typescript
import { avoidedEmissionsWithUncertainty } from '@carbon/convert';

// Calculate with uncertainty bounds
const result = avoidedEmissionsWithUncertainty(
  {
    energy: 1000,
    inputUnit: 'kWh',
    factorKgPerKWh: 0.5
  },
  5.0 // ±5% uncertainty
);

console.log(result.uncertainty);
// Output:
// {
//   plusMinusPct: 5,
//   lowerTCO2e: 0.475,
//   upperTCO2e: 0.525
// }
```

## Supported Regions

The library includes emission factors for the following regions:

- **WORLD**: Global default baseline
- **IN**: India
- **US**: United States
- **EU**: European Union
- **CN**: China
- **BR**: Brazil
- **DE**: Germany
- **FR**: France
- **GB**: United Kingdom
- **JP**: Japan
- **CA**: Canada
- **AU**: Australia
- **RU**: Russia
- **MX**: Mexico
- **KR**: South Korea
- **IT**: Italy
- **ES**: Spain
- **NL**: Netherlands
- **SE**: Sweden
- **NO**: Norway

## Emission Factor Scopes

- **baseline**: Default grid emission factors
- **operational**: Real-time operational factors
- **marginal**: Marginal emission factors for avoided emissions

## Rounding Modes

- **HALF_UP**: Round half away from zero (default)
- **DOWN**: Round towards negative infinity
- **TRUNC**: Truncate towards zero

## Error Handling

The library provides typed errors for common scenarios:

```typescript
import { 
  UnknownRegionError, 
  NoFactorForDateError, 
  InvalidUnitError 
} from '@carbon/convert';

try {
  const factor = resolveFactor({ region: 'UNKNOWN', scope: 'baseline' });
} catch (error) {
  if (error instanceof UnknownRegionError) {
    console.log('Region not supported');
  }
}
```

## Deterministic Behavior

The library ensures deterministic behavior through:

1. **Fixed Precision**: All calculations use consistent decimal precision
2. **Deterministic Rounding**: Same rounding mode always produces same results
3. **Stable Stringify**: Consistent JSON serialization for hashing
4. **No Network Calls**: All data is bundled or injected at initialization

## Golden Vector Test

The library includes a golden vector test to ensure deterministic behavior:

```typescript
// Input: energy = 12,345.678 kWh, factor = 0.708 kg/kWh, rounding decimals=6
// Expected output: 8.736740 tCO₂e
const result = toCO2eTonnesRounded(12345.678, 'kWh', 0.708, 6, 'HALF_UP');
console.log(result); // 8.736740
```

## TypeScript Support

The library is built with TypeScript and provides full type safety:

```typescript
import { AvoidedInput, AvoidedResult, Factor } from '@carbon/convert';

const input: AvoidedInput = {
  energy: 1000,
  inputUnit: 'kWh',
  factorKgPerKWh: 0.5
};

const result: AvoidedResult = avoidedEmissions(input);
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please see our contributing guidelines for details.

## Disclaimer

The default emission factors included in this library are for demonstration purposes only. For production use, replace with authoritative, region-specific emission factors from official sources.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and changes.
