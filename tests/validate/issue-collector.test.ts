import { describe, expect, it } from 'vitest';

import { IssueCollector } from '../../src/validation/IssueCollector';

describe('IssueCollector', () => {
  it('should truncate when max issues is exceeded', () => {
    const collector = new IssueCollector(2);

    collector.add({
      rowNumber: 1,
      severity: 'error',
      code: 'e1',
      messagePtBr: 'erro 1',
    });
    collector.add({
      rowNumber: 2,
      severity: 'error',
      code: 'e2',
      messagePtBr: 'erro 2',
    });
    collector.add({
      rowNumber: 3,
      severity: 'warning',
      code: 'w1',
      messagePtBr: 'warning 1',
    });

    expect(collector.getIssues()).toHaveLength(2);
    expect(collector.getTotalIssues()).toBe(3);
    expect(collector.isTruncated()).toBe(true);
  });
});
