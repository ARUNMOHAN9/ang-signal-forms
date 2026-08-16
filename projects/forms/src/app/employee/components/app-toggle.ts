import { Component, input, model, output } from '@angular/core';
import type { FormCheckboxControl } from '@angular/forms/signals';

/** Reusable switch implementing FormCheckboxControl (`checked` instead of `value`). */
@Component({
  selector: 'app-toggle',
  template: `
    <label class="toggle">
      <input
        type="checkbox"
        [checked]="checked()"
        (change)="checked.set($any($event.target).checked)"
        (blur)="touch.emit()"
        [attr.disabled]="disabled() || undefined"
      />
      <span class="toggle__track" aria-hidden="true"><span class="toggle__thumb"></span></span>
      <span class="toggle__label">{{ label() }}</span>
    </label>
    @if (hint(); as hint) {
      <p class="form-control__hint">{{ hint }}</p>
    }
  `,
})
export class AppToggle implements FormCheckboxControl {
  readonly checked = model.required<boolean>();
  readonly label = input.required<string>();
  readonly hint = input<string>();
  readonly disabled = input(false);
  readonly touch = output<void>();
}