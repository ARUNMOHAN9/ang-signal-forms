import { Component, input, model, output } from '@angular/core';
import type { FormValueControl, ValidationError } from '@angular/forms/signals';

/**
 * Reusable text / email / tel / number input implementing FormValueControl.
 * The [formField] directive keeps `value`, `errors`, `disabled`, `required`,
 * `invalid`, `pending`, `readonly`, `minLength`, `maxLength` in sync.
 */
@Component({
  selector: 'app-text-field',
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
        [type]="type()"
        [value]="value()"
        (input)="value.set($any($event.target).value)"
        (blur)="touch.emit()"
        [attr.required]="required() || undefined"
        [attr.readonly]="readonly() || undefined"
        [attr.disabled]="disabled() || undefined"
        [attr.minlength]="minLength() ?? undefined"
        [attr.maxlength]="maxLength() ?? undefined"
        [attr.aria-invalid]="invalid()"
        [attr.aria-describedby]="describedBy()"
        [autocomplete]="autocomplete()"
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
export class AppTextField implements FormValueControl<string> {
  readonly value = model.required<string>();
  readonly label = input.required<string>();
  readonly type = input('text');
  readonly autocomplete = input('');
  readonly hint = input<string>();
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly required = input(false);
  readonly invalid = input(false);
  readonly pending = input(false);
  readonly minLength = input<number | undefined>(undefined);
  readonly maxLength = input<number | undefined>(undefined);
  readonly touch = output<void>();

  private readonly uid = Math.random().toString(36).slice(2);
  readonly fieldId = `tf-${this.uid}`;
  readonly errorId = `tf-${this.uid}-error`;
  readonly hintId = `tf-${this.uid}-hint`;

  protected describedBy(): string | undefined {
    const ids: string[] = [];
    if (this.hint()) ids.push(this.hintId);
    if (this.invalid() && this.errors().length > 0) ids.push(this.errorId);
    return ids.length > 0 ? ids.join(' ') : undefined;
  }
}