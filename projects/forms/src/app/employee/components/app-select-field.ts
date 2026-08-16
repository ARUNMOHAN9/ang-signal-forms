import { Component, input, model, output } from '@angular/core';
import type { FormValueControl, ValidationError } from '@angular/forms/signals';

export interface SelectOption<TValue extends string> {
  readonly value: TValue;
  readonly label: string;
}

/**
 * Generic, reusable select implementing FormValueControl.
 * The generic type is inferred from the bound field's value type.
 */
@Component({
  selector: 'app-select-field',
  template: `
    <div class="form-control" [class.form-control--invalid]="invalid()">
      <div class="form-control__label-row">
        <label [for]="fieldId">{{ label() }}</label>
        @if (required()) {
          <span class="req" aria-hidden="true">*</span>
        }
      </div>
      <select
        [id]="fieldId"
        [value]="value()"
        (change)="value.set($any($event.target).value)"
        (blur)="touch.emit()"
        [attr.required]="required() || undefined"
        [attr.disabled]="disabled() || undefined"
        [attr.aria-invalid]="invalid()"
        [attr.aria-describedby]="describedBy()"
      >
        @for (option of options(); track option.value) {
          <option [value]="option.value">{{ option.label }}</option>
        }
      </select>
      @if (hint(); as hint) {
        <p class="form-control__hint" [id]="hintId">{{ hint }}</p>
      }
      @for (err of errors(); track $index) {
        <p class="field-error" [id]="errorId">{{ err.message ?? 'Invalid value.' }}</p>
      }
    </div>
  `,
})
export class AppSelectField<TValue extends string = string> implements FormValueControl<TValue> {
  readonly value = model.required<TValue>();
  readonly label = input.required<string>();
  readonly options = input<readonly SelectOption<TValue>[]>([]);
  readonly hint = input<string>();
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly required = input(false);
  readonly invalid = input(false);
  readonly pending = input(false);
  readonly touch = output<void>();

  private readonly uid = Math.random().toString(36).slice(2);
  readonly fieldId = `sel-${this.uid}`;
  readonly errorId = `sel-${this.uid}-error`;
  readonly hintId = `sel-${this.uid}-hint`;

  protected describedBy(): string | undefined {
    const ids: string[] = [];
    if (this.hint()) ids.push(this.hintId);
    if (this.invalid() && this.errors().length > 0) ids.push(this.errorId);
    return ids.length > 0 ? ids.join(' ') : undefined;
  }
}