import { Component, input } from '@angular/core';
import { getLink } from './navigation';

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy path
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
    return true;
  } catch {
    return false;
  }
}

/** A small link icon next to section headings that copies a deep link to the clipboard. */
@Component({
  selector: 'app-copy-link',
  template: `
    <button
      type="button"
      class="copy-link"
      (click)="copy()"
      [attr.aria-label]="copied ? 'Link copied' : 'Copy link to this section'"
      [attr.title]="copied ? 'Copied!' : 'Copy link to this section'"
    >
      @if (copied) {
        <span aria-hidden="true">✓</span>
      } @else {
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      }
    </button>
  `,
})
export class CopyLinkComponent {
  readonly section = input.required<string>();
  protected copied = false;

  protected async copy(): Promise<void> {
    const href = `${location.pathname}#${this.section()}`;
    const ok = await copyText(href);
    if (ok) {
      this.copied = true;
      setTimeout(() => (this.copied = false), 1500);
    }
  }
}

/** Convenience export so templates can reference a section title next to the link icon. */
export function sectionTitle(id: string): string {
  return getLink(id)?.title ?? id;
}