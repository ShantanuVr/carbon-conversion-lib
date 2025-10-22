# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-01

### Added
- Initial release of Carbon Conversion Library
- Core CO₂e conversion functions (`toCO2eKg`, `toCO2eTonnes`)
- Avoided emissions calculator with uncertainty handling
- Factor resolution system with region/date/scope filtering
- Unit conversion utilities (kWh ↔ MWh ↔ GWh, kg ↔ tonnes)
- Deterministic rounding with multiple modes (HALF_UP, DOWN, TRUNC)
- Safe math operations to minimize floating point errors
- Stable stringify for deterministic hashing
- Comprehensive TypeScript types and interfaces
- Zod schemas for runtime validation
- Default emission factor pack with global and regional factors
- Region mapping system with ISO-3166 support
- Comprehensive test suite including golden vector tests
- Full API documentation with usage examples

### Features
- **Deterministic Calculations**: Same inputs always produce the same outputs
- **Region-Specific Factors**: Support for country/region-specific emission factors
- **Multiple Scopes**: Operational, marginal, and baseline emission factors
- **Uncertainty Handling**: Built-in support for uncertainty bounds (±%)
- **Zero Dependencies**: No runtime dependencies, pure functions
- **TypeScript First**: Full type safety and IntelliSense support

### Supported Regions
- WORLD (global default)
- IN (India)
- US (United States)
- EU (European Union)
- CN (China)
- BR (Brazil)
- DE (Germany)
- FR (France)
- GB (United Kingdom)
- JP (Japan)
- CA (Canada)
- AU (Australia)
- RU (Russia)
- MX (Mexico)
- KR (South Korea)
- IT (Italy)
- ES (Spain)
- NL (Netherlands)
- SE (Sweden)
- NO (Norway)

### API Functions
- `toCO2eKg()` - Convert energy to CO₂e in kg
- `toCO2eTonnes()` - Convert energy to CO₂e in tonnes
- `avoidedEmissions()` - Calculate avoided emissions vs grid baseline
- `resolveFactor()` - Resolve emission factor by region/date/scope
- `listFactors()` - List available factors with filtering
- `stableStringify()` - Create deterministic JSON strings
- Unit conversion functions (kWhToMWh, MWhToKWh, etc.)
- Math utilities (roundStable, safeAdd, safeMultiply, etc.)

### Golden Vector Test
- Input: energy = 12,345.678 kWh, factor = 0.708 kg/kWh, rounding decimals=6
- Expected output: 8.736740 tCO₂e
- Ensures deterministic behavior across all calculations

### Error Handling
- Typed errors: `UnknownRegionError`, `NoFactorForDateError`, `InvalidUnitError`
- Safe operation variants returning `{ok: false, error: {code, message}}`

### Build System
- TypeScript compilation with strict mode
- ESM and CJS output formats
- Tree-shakeable builds
- Source maps and declaration files
- Vitest for testing with 95%+ coverage target

### Documentation
- Comprehensive README with API reference
- Usage examples for all major features
- TypeScript type definitions
- JSDoc comments throughout codebase
