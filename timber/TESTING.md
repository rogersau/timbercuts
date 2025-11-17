# Testing Guide

This project uses [Vitest](https://vitest.dev/) for testing the timber optimizer algorithm.

## Running Tests

### Run all tests once
```bash
pnpm test:run
```

### Run tests in watch mode
```bash
pnpm test
```

### Run tests with UI
```bash
pnpm test:ui
```
Opens an interactive browser-based UI to view and run tests.

## Test Coverage

The test suite in `src/lib/timber-optimizer.test.ts` validates:

### Basic Cutting
- Multiple pieces fitting into single timber
- Waste calculation
- Exact fits with no waste

### Kerf Calculation
- Kerf applied between cuts
- No kerf on first piece
- Multiple cuts with kerf

### Cost Optimization Mode
- Minimizing total cost
- Preferring cost-efficient timber
- Efficient packing to minimize purchases

### Waste Optimization Mode
- Minimizing waste over cost
- Preferring tighter fits

### Owned Timber
- Using owned timber before purchasing
- Purchasing when owned timber insufficient
- Tracking owned timber quantities
- Prioritizing owned timber in waste mode
- Multiple owned timber lengths

### Edge Cases
- Single large cuts
- No timber fits (error handling)
- Zero kerf
- Mixed cut lengths

### Complex Scenarios
- Multiple cuts with kerf in cost mode
- Owned timber with kerf

## Writing New Tests

Add tests to `src/lib/timber-optimizer.test.ts`:

```typescript
it('should do something', () => {
  const cuts: RequiredCut[] = [{ length: 600, quantity: 2 }]
  const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost')
  
  expect(result.totalTimbers).toBe(1)
})
```

## Test Results

All 22 tests currently pass, covering:
- ✅ Cut calculation accuracy
- ✅ Kerf handling
- ✅ Cost optimization
- ✅ Waste minimization
- ✅ Owned timber prioritization
- ✅ Edge case handling
