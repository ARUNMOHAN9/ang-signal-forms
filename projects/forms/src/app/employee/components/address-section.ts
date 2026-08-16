import { Component, computed, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import type { FieldTree } from '@angular/forms/signals';
import type { Address, Employee } from '../employee.model';
import { LOCATIONS } from '../employee.model';
import { AppFormSection } from './app-form-section';
import { AppSelectField, type SelectOption } from './app-select-field';
import { AppTextField } from './app-text-field';

@Component({
  selector: 'app-address-section',
  imports: [AppFormSection, AppSelectField, AppTextField, FormField],
  template: `
    <app-form-section title="Address" description="Primary work location. Country drives the state and city choices.">
      <div class="section-grid">
        <app-select-field
          [formField]="form().address.country"
          [options]="countryOptions()"
          label="Country"
        />
        @if (stateOptions().length > 0) {
          <app-select-field
            [formField]="form().address.state"
            [options]="stateOptions()"
            label="State / region"
          />
        }
        @if (cityOptions().length > 0) {
          <app-select-field
            [formField]="form().address.city"
            [options]="cityOptions()"
            label="City"
          />
        }
        <app-text-field
          [formField]="form().address.street"
          label="Street"
          autocomplete="street-address"
        />
      </div>
      <p class="form-section__hint">
        Options for State and City are derived with computed() from the Country field —
        switching country cascades the choices instantly.
      </p>
    </app-form-section>
  `,
})
export class AddressSection {
  readonly form = input.required<FieldTree<Employee>>();

  protected readonly stateOptions = computed<readonly SelectOption<Address['state']>[]>(() => {
    const country = this.form().address.country().value();
    return (
      [...(LOCATIONS.get(country)?.states.keys() ?? [])].map((s) => ({ value: s, label: s })) ?? []
    );
  });

  protected readonly cityOptions = computed<readonly SelectOption<Address['city']>[]>(() => {
    const country = this.form().address.country().value();
    const state = this.form().address.state().value();
    return LOCATIONS.get(country)?.states.get(state)?.map((city) => ({ value: city, label: city })) ?? [];
  });

  protected readonly countryOptions = computed<readonly SelectOption<Address['country']>[]>(() => [
    { value: '', label: 'Select a country…' },
    ...Array.from(LOCATIONS.keys(), (country) => ({ value: country, label: country })),
  ]);
}