import { AfterViewInit, Directive, ElementRef, EventEmitter, Output } from '@angular/core';

/**
 * Scroll-spy for the tutorial page.
 *
 * Uses an IntersectionObserver with a slim band near the top of the viewport.
 * Whichever `section[data-section]` is highest up inside that band becomes the
 * active section. No scroll-event listeners.
 */
@Directive({
  selector: '[appScrollSpy]',
})
export class ScrollSpyDirective implements AfterViewInit {
  @Output() readonly activeSection = new EventEmitter<string>();

  private readonly observer: IntersectionObserver | undefined;

  constructor(private readonly element: ElementRef<HTMLElement>) {
    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .map((entry) => entry.target as HTMLElement)
            .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
          if (visible.length === 0) return;
          const id = visible[0].dataset['section'];
          if (id) this.activeSection.emit(id);
        },
        { rootMargin: '-20% 0px -75% 0px', threshold: 0 },
      );
    }
  }

  ngAfterViewInit(): void {
    if (!this.observer) return;
    const sections = Array.from(
      this.element.nativeElement.querySelectorAll<HTMLElement>('section[data-section]'),
    );
    for (const section of sections) this.observer.observe(section);
  }
}