import type { ValidationIssue } from './types';

export class IssueCollector {
  private readonly maxIssues: number;

  private readonly issues: ValidationIssue[] = [];

  private totalIssues = 0;

  private truncated = false;

  constructor(maxIssues: number) {
    this.maxIssues = maxIssues;
  }

  add(issue: ValidationIssue): void {
    this.totalIssues += 1;

    if (this.issues.length < this.maxIssues) {
      this.issues.push(issue);
      return;
    }

    this.truncated = true;
  }

  addMany(issues: readonly ValidationIssue[]): void {
    for (const issue of issues) {
      this.add(issue);

      if (this.truncated) {
        return;
      }
    }
  }

  getIssues(): ValidationIssue[] {
    return [...this.issues];
  }

  getTotalIssues(): number {
    return this.totalIssues;
  }

  isTruncated(): boolean {
    return this.truncated;
  }
}
