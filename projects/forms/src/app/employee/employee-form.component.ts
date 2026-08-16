import { Component, effect, inject, input, signal } from '@angular/core';
import { FormField, FormRoot, form } from '@angular/forms/signals';
import { EmployeeApi } from './employee.api';
import { emptyEmployee } from './employee.model';
import type { Employee } from './employee.model';
import { createEmployeeSchema } from './employee.schema';
import { AddressSection } from './components/address-section';
import { AppFormSection } from './components/app-form-section';
import { AppToggle } from './components/app-toggle';
import { EmergencyContactSection } from './components/emergency-contact-section';
import { EmploymentDetailsSection } from './components/employment-details-section';
import { PersonalDetailsSection } from './components/personal-details-section';
import { SkillsSection } from './components/skills-section';

/**
 * The Production Example: a complete, split-architecture employee editor.
 *
 * Ownership: this component owns the model signal + the single form() call.
 * Each section receives the FieldTree (or a sub-field) as an input and is
 * purely presentational. Validation lives in employee.schema.ts.
 */
@Component({
  selector: 'app-employee-form',
  imports: [
    FormField,
    FormRoot,
    PersonalDetailsSection,
    EmploymentDetailsSection,
    AddressSection,
    SkillsSection,
    EmergencyContactSection,
    AppFormSection,
    AppToggle,
  ],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.css',
})
export class EmployeeFormComponent {
  /** If set, the form loads the employee from the mock API on init (edit mode). */
  readonly employeeId = input<number | null>(null);

  protected readonly api = inject(EmployeeApi);

  protected readonly employeeModel = signal<Employee>(emptyEmployee());
  protected readonly loading = signal(false);
  protected readonly saved = signal(false);
  protected readonly serverError = signal<string | null>(null);

  protected readonly employeeForm = form(this.employeeModel, createEmployeeSchema(this.api), {
    name: 'employee',
    submission: {
      action: async (field) => {
        this.serverError.set(null);
        try {
          await this.api.saveEmployee(this.employeeModel());
          this.saved.set(true);
          return undefined;
        } catch (error) {
          const message = error instanceof Error ? error.message : '';
          if (message === 'email-taken') {
            // Map the server error onto the exact field.
            return [
              {
                fieldTree: field.email,
                kind: 'server-email-taken',
                message: 'This email is already registered on the server.',
              },
            ];
          }
          this.serverError.set('Something went wrong. Please try again.');
          return undefined;
        }
      },
      onInvalid: (field) => {
        // Accessibility: move focus to the first field with an error.
        const first = field().errorSummary()[0];
        first?.fieldTree()?.focusBoundControl();
      },
    },
  });

  constructor() {
    effect(() => {
      const id = this.employeeId();
      if (id === null) return;
      this.loading.set(true);
      this.api
        .loadEmployee(id)
        .then((employee) => this.employeeModel.set(employee))
        .finally(() => this.loading.set(false));
    });
  }

  protected readonly resetForm = (): void => {
    this.employeeModel.set(emptyEmployee());
    this.saved.set(false);
    this.serverError.set(null);
    this.employeeForm().reset(this.employeeModel());
  };
}