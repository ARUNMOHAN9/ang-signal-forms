import { Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import type { FieldTree } from '@angular/forms/signals';
import type { Employee } from '../employee.model';
import { AppFormSection } from './app-form-section';
import { AppTextField } from './app-text-field';

@Component({
  selector: 'app-emergency-contact-section',
  imports: [AppFormSection, AppTextField, FormField],
  template: `
    <app-form-section
      title="Emergency contact"
      description="A nested group — same rules apply to any object field, nested as deep as needed."
    >
      <div class="section-grid">
        <app-text-field [formField]="form().emergencyContact.name" label="Full name" />
        <app-text-field [formField]="form().emergencyContact.relationship" label="Relationship" />
        <app-text-field
          [formField]="form().emergencyContact.phone"
          label="Phone"
          type="tel"
          autocomplete="tel"
        />
      </div>
    </app-form-section>
  `,
})
export class EmergencyContactSection {
  readonly form = input.required<FieldTree<Employee>>();
}