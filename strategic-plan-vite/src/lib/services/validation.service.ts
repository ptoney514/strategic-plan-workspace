import type { ParsedGoal, ValidationResult, ValidationStatus } from '../types/import.types';
import type { Goal } from '../types';

/**
 * Validation Service
 * Validates staged data before import
 */
export class ValidationService {

  /**
   * Validate a single parsed goal
   */
  static validateGoal(
    goal: ParsedGoal,
    allGoals: ParsedGoal[],
    existingGoals: Goal[]
  ): ValidationResult {
    const messages: string[] = [];
    let status: ValidationStatus = 'valid';

    // Required field validations
    if (!goal.title || goal.title.trim() === '') {
      messages.push('Missing goal title');
      status = 'error';
    }

    if (!goal.goal_number || goal.goal_number.trim() === '') {
      messages.push('Missing goal number');
      status = 'error';
    }

    if (goal.level === undefined) {
      messages.push('Invalid goal level');
      status = 'error';
    }

    // Check for duplicate goal numbers within import
    const duplicates = allGoals.filter(g => g.goal_number === goal.goal_number);
    if (duplicates.length > 1) {
      messages.push(`Duplicate goal number: ${goal.goal_number} appears ${duplicates.length} times`);
      status = 'error';
    }

    // Check for duplicate goal numbers in existing data
    const existingDuplicate = existingGoals.find(g => g.goal_number === goal.goal_number);
    if (existingDuplicate) {
      messages.push(`Goal number ${goal.goal_number} already exists in database`);
      if (status !== 'error') {
        status = 'warning';
      }
    }

    // Validate hierarchy (parent exists)
    if (goal.level > 0) {
      const parentNumber = this.getParentGoalNumber(goal.goal_number);
      const parentExists = allGoals.some(g => g.goal_number === parentNumber) ||
                          existingGoals.some(g => g.goal_number === parentNumber);

      if (!parentExists) {
        messages.push(`Parent goal ${parentNumber} not found`);
        status = 'error';
      }
    }

    // Warnings for missing optional fields
    if (!goal.owner_name) {
      messages.push('Missing owner name');
      if (status === 'valid') {
        status = 'warning';
      }
    }

    if (goal.metrics.length === 0) {
      messages.push('No metrics found for this goal');
      if (status === 'valid') {
        status = 'warning';
      }
    }

    return { status, messages };
  }

  /**
   * Get parent goal number from child number
   * "1.1.1" → "1.1", "1.1" → "1"
   */
  private static getParentGoalNumber(goalNumber: string): string | null {
    const parts = goalNumber.split('.');
    if (parts.length <= 1) {
      return null; // Top-level goal has no parent
    }
    return parts.slice(0, -1).join('.');
  }

  /**
   * Validate all goals in a batch
   */
  static validateAllGoals(
    goals: ParsedGoal[],
    existingGoals: Goal[]
  ): Map<number, ValidationResult> {
    const results = new Map<number, ValidationResult>();

    goals.forEach(goal => {
      const result = this.validateGoal(goal, goals, existingGoals);
      results.set(goal.row_number, result);
    });

    return results;
  }

  /**
   * Get validation summary
   */
  static getValidationSummary(results: Map<number, ValidationResult>): {
    totalRows: number;
    validRows: number;
    warningRows: number;
    errorRows: number;
    canImport: boolean;
  } {
    let validRows = 0;
    let warningRows = 0;
    let errorRows = 0;

    results.forEach(result => {
      if (result.status === 'valid') validRows++;
      else if (result.status === 'warning') warningRows++;
      else if (result.status === 'error') errorRows++;
    });

    return {
      totalRows: results.size,
      validRows,
      warningRows,
      errorRows,
      canImport: errorRows === 0 // Can only import if no errors
    };
  }

  /**
   * Check if goal number format is valid
   */
  static isValidGoalNumberFormat(goalNumber: string): boolean {
    // Must be digits separated by dots: "1", "1.1", "1.1.1"
    return /^\d+(\.\d+){0,2}$/.test(goalNumber);
  }

  /**
   * Validate metric data
   */
  static validateMetric(metric: any): ValidationResult {
    const messages: string[] = [];
    let status: ValidationStatus = 'valid';

    if (!metric.name || metric.name.trim() === '') {
      messages.push('Missing metric name');
      status = 'error';
    }

    if (metric.time_series && metric.time_series.length === 0) {
      messages.push('No time series data found');
      if (status === 'valid') {
        status = 'warning';
      }
    }

    return { status, messages };
  }
}
