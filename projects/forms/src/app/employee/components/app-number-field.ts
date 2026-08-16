import { Component, input, model, output } from '@angular/core';
import {
  transformedValue,
  type FormValueControl,
  type ValidationError,
} from '@angular/forms/signals';

/**
 * Reusable numeric input implementing FormValueControl<number | null>.
 * Uses `transformedValue` to parse the raw string into a number, so empty
 * input maps to `null` and invalid input reports a `parse` error on the field.
 */
@Component({
  selector: 'app-number-field',
  template: `
    <div class="form-control" [class.form-control--invalid]="invalid()">
      <div class="form-control__label-row">
        <label [for]="fieldId">{{ label() }}</label>
        @if (required()) {
          <span class="req" aria-hidden="true">*</span>
        }
      </div>
      <input
        [id]="fieldId"
        type="number"
        [value]="rawValue()"
        (input)="rawValue.set($any($event.target).value)"
        (blur)="touch.emit()"
        [attr.required]="required() || undefined"
        [attr.readonly]="readonly() || undefined"
        [attr.disabled]="disabled() || undefined"
        [attr.aria-invalid]="invalid()"
        [attr.aria-describedby]="describedBy()"
        [attr.aria-busy]="pending() || undefined"
      />
      @if (hint(); as hint) {
        <p class="form-control__hint" [id]="hintId">{{ hint }}</p>
      }
      @for (err of errors(); track $index) {
        <p class="field-error" [id]="errorId">{{ err.message ?? 'Invalid value.' }}</p>
      }
    </div>
  `,
})
export class AppNumberField implements FormValueControl<number | null> {
  readonly value = model.required<number | null>();
  readonly label = input.required<string>();
  readonly hint = input<string>();
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly required = input(false);
  readonly invalid = input(false);
  readonly pending = input(false);
  readonly touch = output<void>();

  protected readonly rawValue = transformedValue(this.value, {
    parse: (raw) => {
      if (raw === '') return { value: null };
      const num = Number(raw);
      if (Number.isNaN(num)) return { error: { kind: 'parse', message: 'Enter a valid number.' } };
      return { value: num };
    },
    format: (val) => val?.toString() ?? '',
  });

  private readonly uid = Math.random().toString(36).slice(2);
  readonly fieldId = `nf-${this.uid}`;
  readonly errorId = `nf-${this.uid}-error`;
  readonly hintId = `nf-${this.uid}-hint`;

  protected describedBy(): string | undefined {
    const ids: string[] = [];
    if (this.hint()) ids.push(this.hintId);
    if (this.invalid() && this.errors().length > 0) ids.push(this.errorId);
    return ids.length > 0 ? ids.join(' ') : undefined;
  }
}