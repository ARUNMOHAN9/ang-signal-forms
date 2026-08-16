import { Component, input } from '@angular/core';
import { getSectionMeta } from './navigation';

/**
 * Previous / next navigation at the end of each major section.
 * Follows the flattened reading order defined in navigation.ts.
 */
@Component({
  selector: 'app-prev-next',
  template: `
    <nav class="prev-next" aria-label="Section navigation">
      @if (prev()) {
        <a class="prev-next__link prev-next__link--prev" [href]="'#' + prev()!.id">
          <span class="prev-next__dir">← Previous</span>
          <span class="prev-next__title">{{ prev()!.title }}</span>
        </a>
      } @else {
        <span></span>
      }
      @if (next()) {
        <a class="prev-next__link prev-next__link--next" [href]="'#' + next()!.id">
          <span class="prev-next__dir">Next →</span>
          <span class="prev-next__title">{{ next()!.title }}</span>
        </a>
      } @else {
        <span></span>
      }
    </nav>
  `,
})
export class PrevNextComponent {
  readonly section = input.required<string>();

  protected prev() {
    return getSectionMeta(this.section())?.prev
      ? { id: getSectionMeta(this.section())!.prev!, title: getSectionMeta(this.section())!.prevTitle! }
      : undefined;
  }

  protected next() {
    return getSectionMeta(this.section())?.next
      ? { id: getSectionMeta(this.section())!.next!, title: getSectionMeta(this.section())!.nextTitle! }
      : undefined;
  }
}