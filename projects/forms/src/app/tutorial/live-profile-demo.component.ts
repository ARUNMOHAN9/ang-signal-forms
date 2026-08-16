import { Component, signal } from '@angular/core';
import { FormField, FormRoot, email, form, max, min, required } from '@angular/forms/signals';
import type { ValidationError } from '@angular/forms/signals';

export interface UserProfile {
  name: string;
  email: string;
  age: number | null;
}

const DEFAULT_ERRORS: Record<string, string> = {
  required: 'This field is required.',
  email: 'Enter a valid email address.',
  min: 'Value is too low.',
  max: 'Value is too high.',
};

function errorMessage(err: ValidationError): string {
  return err.message ?? DEFAULT_ERRORS[err.kind] ?? 'This field is invalid.';
}

/**
 * Live, working "User Profile Form" — the same code taught in the
 * First Signal Form section, running for real inside the page.
 */
@Component({
  selector: 'app-live-profile-demo',
  imports: [FormField, FormRoot],
  template: `
    <div class="live-demo">
      <form [formRoot]="profileForm" novalidate class="live-demo__form">
        <div class="live-demo__row">
          <label for="live-name">Name</label>
          <input
            id="live-name"
            type="text"
            [formField]="profileForm.name"
            [attr.aria-invalid]="profileForm.name().invalid()"
            [attr.aria-describedby]="profileForm.name().invalid() ? 'live-name-err' : undefined"
          />
          @for (err of profileForm.name().errors(); track err.kind) {
            <p id="live-name-err" class="field-error" role="alert">{{ errorMessage(err) }}</p>
          }
        </div>

        <div class="live-demo__row">
          <label for="live-email">Email</label>
          <input
            id="live-email"
            type="email"
            autocomplete="email"
            [formField]="profileForm.email"
            [attr.aria-invalid]="profileForm.email().invalid()"
            [attr.aria-describedby]="profileForm.email().invalid() ? 'live-email-err' : undefined"
          />
          @for (err of profileForm.email().errors(); track err.kind) {
            <p id="live-email-err" class="field-error" role="alert">{{ errorMessage(err) }}</p>
          }
        </div>

        <div class="live-demo__row">
          <label for="live-age">Age</label>
          <input
            id="live-age"
            type="number"
            [formField]="profileForm.age"
            [attr.aria-invalid]="profileForm.age().invalid()"
            [attr.aria-describedby]="profileForm.age().invalid() ? 'live-age-err' : undefined"
          />
          @for (err of profileForm.age().errors(); track err.kind) {
            <p id="live-age-err" class="field-error" role="alert">{{ errorMessage(err) }}</p>
          }
        </div>

        <div class="live-demo__actions">
          <button type="submit" [disabled]="profileForm().submitting() || profileForm().invalid()">
            @if (profileForm().submitting()) {
              Saving…
            } @else {
              Save profile
            }
          </button>
          <button type="button" (click)="reset()">Reset</button>
        </div>

        @if (saved()) {
          <p class="live-demo__success" role="status">Saved: {{ JSON.stringify(model()) }}</p>
        }
      </form>

      <details class="live-demo__state">
        <summary>Inspect live field state</summary>
        <table class="live-demo__state-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>value</th>
              <th>valid</th>
              <th>invalid</th>
              <th>touched</th>
              <th>dirty</th>
              <th>pending</th>
              <th>errors</th>
            </tr>
          </thead>
          <tbody>
            @for (col of ['name', 'email', 'age']; track col) {
              <tr>
                <td>{{ col }}</td>
                <td>{{ stateOfAny(col).value() }}</td>
                <td>{{ stateOfAny(col).valid() }}</td>
                <td>{{ stateOfAny(col).invalid() }}</td>
                <td>{{ stateOfAny(col).touched() }}</td>
                <td>{{ stateOfAny(col).dirty() }}</td>
                <td>{{ stateOfAny(col).pending() }}</td>
                <td>{{ stateOfAny(col).errors().map((e) => e.kind).join(', ') || '—' }}</td>
              </tr>
            }
          </tbody>
        </table>
        <p>Root: valid={{ profileForm().valid() }} · invalid={{ profileForm().invalid() }}</p>
      </details>
    </div>
  `,
})
export class LiveProfileDemoComponent {
  protected readonly model = signal<UserProfile>({ name: '', email: '', age: null });
  protected readonly saved = signal(false);

  protected readonly profileForm = form(this.model, (p) => {
    required(p.name, { message: 'Name is required.' });
    required(p.email, { message: 'Email is required.' });
    email(p.email, { message: 'Enter a valid email address.' });
    min(p.age, 18, { message: 'You must be at least 18.' });
    max(p.age, 120, { message: 'Age must be 120 or below.' });
  }, {
    name: 'live-profile',
    submission: {
      action: async () => {
        await new Promise((resolve) => setTimeout(resolve, 700));
        this.saved.set(true);
      },
    },
  });

  protected readonly errorMessage = errorMessage;
  protected readonly JSON = JSON;

  protected readonly stateOf = (key: 'name' | 'email' | 'age') => this.profileForm[key]();

  protected readonly stateOfAny = (key: string) =>
    this.stateOf(key as 'name' | 'email' | 'age');

  protected reset(): void {
    this.model.set({ name: '', email: '', age: null });
    this.saved.set(false);
    this.profileForm().reset(this.model());
  }
}