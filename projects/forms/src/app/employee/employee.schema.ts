import { resource } from '@angular/core';
import {
  applyEach,
  email,
  max,
  min,
  minLength,
  pattern,
  required,
  schema,
  validateAsync,
  validateTree,
} from '@angular/forms/signals';
import type { SchemaFn } from '@angular/forms/signals';
import { EmployeeApi } from './employee.api';
import type { Employee, Skill } from './employee.model';

/**
 * Reusable schema for a single skill (used by applyEach over the array).
 */
const skillSchema = schema<Skill>((s) => {
  required(s.name, { message: 'Skill name is required.' });
  minLength(s.name, 2, { message: 'Skill name must be at least 2 characters.' });
  required(s.level, { message: 'Choose a skill level.' });
});

/**
 * All validation + availability rules for the employee form, in one place.
 *
 * Highlights:
 *  - contractEndDate is required only for CONTRACT employees
 *  - async email-uniqueness check (validateAsync + Resource, debounced)
 *  - cross-field rule: contract end date cannot precede the joining date
 *  - country → state → city cascade is data, not validation — see the sections
 */
export function createEmployeeSchema(api: EmployeeApi): SchemaFn<Employee> {
  return (p) => {
    // ── Personal details ──────────────────────────────────────────────
    required(p.firstName, { message: 'First name is required.' });
    required(p.lastName, { message: 'Last name is required.' });
    required(p.email, { message: 'Email is required.' });
    email(p.email, { message: 'Enter a valid email address.' });

    validateAsync(p.email, {
      debounce: 500,
      when: (ctx) => ctx.value().length >= 3,
      params: (ctx) => ({ email: ctx.value(), currentId: ctx.valueOf(p.id) }),
      factory: (params) =>
        resource({
          params,
          loader: ({ params }) =>
            api.checkEmailUnique(params.email).then((r) => ({ email: params.email, taken: r.taken })),
        }),
      onSuccess: (result, ctx) =>
        result.taken
          ? [
              {
                fieldTree: ctx.fieldTreeOf(p.email),
                kind: 'email-taken',
                message: `"${result.email}" is already registered.`,
              },
            ]
          : undefined,
      onError: () => [
        { kind: 'email-check-failed', message: 'Could not verify this email. Try again.' },
      ],
    });

    pattern(p.phone, /^\+?[0-9 .()-]{7,20}$/, {
      message: 'Enter a valid phone number (e.g. +1 555 123 4567).',
    });

    // ── Employment details ────────────────────────────────────────────
    required(p.department, { message: 'Select a department.' });
    required(p.role, { message: 'Select a role.' });
    required(p.joiningDate, { message: 'Enter the joining date.' });
    required(p.employmentType, { message: 'Select an employment type.' });

    // CONTRACT → the end date becomes required.
    required(p.contractEndDate, {
      message: 'Contract employees need an end date.',
      when: (ctx) => ctx.valueOf(p.employmentType) === 'CONTRACT',
    });

    // Cross-field: contract end date cannot precede the joining date.
    validateTree(p, (ctx) => {
      const end = ctx.valueOf(p.contractEndDate);
      const join = ctx.valueOf(p.joiningDate);
      if (ctx.valueOf(p.employmentType) === 'CONTRACT' && join && end && end < join) {
        return {
          fieldTree: ctx.fieldTreeOf(p.contractEndDate),
          kind: 'end-before-join',
          message: 'Contract end date cannot be before the joining date.',
        };
      }
      return undefined;
    });

    // ── Compensation ──────────────────────────────────────────────────
    required(p.compensation.baseSalary, { message: 'Enter the base salary.' });
    min(p.compensation.baseSalary, 1, { message: 'Base salary must be positive.' });
    max(p.compensation.baseSalary, 1_000_000, { message: 'Base salary looks too high.' });

    // ── Skills (array) ────────────────────────────────────────────────
    required(p.skills, { message: 'Add at least one skill.' });
    applyEach(p.skills, skillSchema);

    // ── Address ───────────────────────────────────────────────────────
    required(p.address.street, { message: 'Street is required.' });
    required(p.address.country, { message: 'Select a country.' });
    required(p.address.state, {
      message: 'Select a state.',
      when: (ctx) => ctx.valueOf(p.address.country) !== '',
    });
    required(p.address.city, {
      message: 'Select a city.',
      when: (ctx) => ctx.valueOf(p.address.state) !== '',
    });

    // ── Emergency contact ─────────────────────────────────────────────
    required(p.emergencyContact.name, { message: 'Emergency contact name is required.' });
    required(p.emergencyContact.relationship, { message: 'Relationship is required.' });
    pattern(p.emergencyContact.phone, /^\+?[0-9 .()-]{7,20}$/, {
      message: 'Enter a valid phone number.',
    });
  };
}