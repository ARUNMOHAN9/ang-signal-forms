import { Component, input } from '@angular/core';

/** Presentational wrapper that groups a form section with a title and description. */
@Component({
  selector: 'app-form-section',
  template: `
    <section class="form-section">
      <header class="form-section__header">
        <h3 class="form-section__title">{{ title() }}</h3>
        @if (description(); as description) {
          <p class="form-section__description">{{ description }}</p>
        }
      </header>
      <div class="form-section__body">
        <ng-content />
      </div>
    </section>
  `,
})
export class AppFormSection {
  readonly title = input.required<string>();
  readonly description = input<string>();
}