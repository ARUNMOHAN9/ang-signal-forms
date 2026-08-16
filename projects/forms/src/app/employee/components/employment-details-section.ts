import { Component, computed, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormField } from '@angular/forms/signals';
import type { FieldTree } from '@angular/forms/signals';
import type { Employee, Role } from '../employee.model';
import { CURRENCY_OPTIONS, DEPARTMENT_OPTIONS, EMPLOYMENT_TYPE_OPTIONS, ROLE_OPTIONS, ROLE_PERMISSIONS } from '../employee.model';
import { AppFormSection } from './app-form-section';
import { AppNumberField } from './app-number-field';
import { AppSelectField, type SelectOption } from './app-select-field';

const pretty = (value: string): string => value.charAt(0) + value.slice(1).toLowerCase();

const departmentOptions: readonly SelectOption<Employee['department']>[] = [
  { value: '', label: 'Select a department…' },
  ...DEPARTMENT_OPTIONS.map((d) => ({ value: d, label: pretty(d) })),
];
const roleOptions: readonly SelectOption<Employee['role']>[] = [
  { value: '', label: 'Select a role…' },
  ...ROLE_OPTIONS.map((r) => ({ value: r, label: pretty(r) })),
];
const employmentTypeOptions: readonly SelectOption<Employee['employmentType']>[] = [
  { value: '', label: 'Select a type…' },
  ...EMPLOYMENT_TYPE_OPTIONS.map((t) => ({ value: t, label: pretty(t) })),
];
const currencyOptions: readonly SelectOption<Employee['compensation']['currency']>[] =
  CURRENCY_OPTIONS.map((c) => ({ value: c, label: c }));

@Component({
  selector: 'app-employment-details',
  imports: [AppFormSection, AppSelectField, AppNumberField, FormField, CurrencyPipe],
  template: `
    <app-form-section
      title="Employment details"
      description="Role, department, contract terms and compensation."
    >
      <div class="section-grid">
        <app-select-field
          [formField]="form().department"
          [options]="departmentOptions"
          label="Department"
        />
        <app-select-field [formField]="form().role" [options]="roleOptions" label="Role" />

        <div class="form-control">
          <label [for]="joinDateId">Joining date</label>
          <input id="joinDateId" type="date" [formField]="form().joiningDate" />
          @for (err of form().joiningDate().errors(); track $index) {
            <p class="field-error">{{ err.message }}</p>
          }
        </div>

        <app-select-field
          [formField]="form().employmentType"
          [options]="employmentTypeOptions"
          label="Employment type"
        />

        @if (form().employmentType().value() === 'CONTRACT') {
          <div class="form-control">
            <label [for]="endDateId">Contract end date <span class="req" aria-hidden="true">*</span></label>
            <input id="endDateId" type="date" [formField]="form().contractEndDate" />
            @for (err of form().contractEndDate().errors(); track $index) {
              <p class="field-error">{{ err.message }}</p>
            }
          </div>
        }

        <app-number-field
          [formField]="form().compensation.baseSalary"
          label="Base salary (monthly)"
          hint="Feeds the derived compensation panel below."
        />
        <app-select-field
          [formField]="form().compensation.currency"
          [options]="currencyOptions"
          label="Currency"
        />
      </div>

      @if (permissions().length > 0) {
        <div class="derived-panel" aria-live="polite">
          <h4>Role permissions</h4>
          <p>
            Derived from <code>role</code>: {{ role() || '—' }} →
            @for (permission of permissions(); track permission) {
              <span class="chip">{{ permission }}</span>
            }
          </p>
        </div>
      }

      @if (annualSalary() > 0) {
        <div class="derived-panel" aria-live="polite">
          <h4>Derived compensation</h4>
          <p>
            Annual base: <strong>{{ annualSalary() | currency: 'USD' : 'symbol-narrow' }}</strong>
            · estimated tax bracket <strong>{{ taxBracket() }}</strong>
            <span class="muted">(computed() over the salary field — no extra state)</span>
          </p>
        </div>
      }
    </app-form-section>
  `,
})
export class EmploymentDetailsSection {
  readonly form = input.required<FieldTree<Employee>>();

  protected readonly departmentOptions = departmentOptions;
  protected readonly roleOptions = roleOptions;
  protected readonly employmentTypeOptions = employmentTypeOptions;
  protected readonly currencyOptions = currencyOptions;
  protected readonly joinDateId = `join-${Math.random().toString(36).slice(2)}`;
  protected readonly endDateId = `end-${Math.random().toString(36).slice(2)}`;

  protected readonly role = computed(() => this.form().role().value() as Role | '');

  protected readonly permissions = computed(() => {
    const role = this.form().role().value() as Role | '';
    return role ? ROLE_PERMISSIONS.get(role) ?? [] : [];
  });

  protected readonly annualSalary = computed(() => {
    const base = this.form().compensation.baseSalary().value();
    if (base === null || base === undefined) return 0;
    const isContract = this.form().employmentType().value() === 'CONTRACT';
    return Math.round(base * (isContract ? 12 : 13));
  });

  protected readonly taxBracket = computed(() => {
    const annual = this.annualSalary();
    if (annual > 150000) return '40%';
    if (annual > 50000) return '30%';
    return '20%';
  });
}