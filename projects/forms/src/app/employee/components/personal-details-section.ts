import { Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import type { FieldTree } from '@angular/forms/signals';
import type { Employee } from '../employee.model';
import { AppFormSection } from './app-form-section';
import { AppTextField } from './app-text-field';

@Component({
  selector: 'app-personal-details',
  imports: [AppFormSection, AppTextField, FormField],
  template: `
    <app-form-section title="Personal details" description="Identity and primary contact information.">
      <div class="section-grid">
        <app-text-field [formField]="form().firstName" label="First name" autocomplete="given-name" />
        <app-text-field [formField]="form().lastName" label="Last name" autocomplete="family-name" />
        <app-text-field
          [formField]="form().email"
          label="Work email"
          type="email"
          autocomplete="email"
          hint="Used for login and notifications."
        />
        <app-text-field
          [formField]="form().phone"
          label="Phone"
          type="tel"
          autocomplete="tel"
          hint="International format, e.g. +1 555 123 4567."
        />
      </div>
    </app-form-section>
  `,
})
export class PersonalDetailsSection {
  readonly form = input.required<FieldTree<Employee>>();
}