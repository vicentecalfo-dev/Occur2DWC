import { describe, expect, it } from 'vitest';

import { resolveCliRuntimeOptions } from '../../src/infrastructure/cli/cli-runtime-options';

describe('CLI runtime options', () => {
  it('should disable colors when --no-color is present', () => {
    const options = resolveCliRuntimeOptions(['node', 'occur2dwc', 'validate', '--no-color']);

    expect(options.colorEnabled).toBe(false);
  });
});
