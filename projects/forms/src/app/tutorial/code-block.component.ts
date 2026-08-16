import { Component, input } from '@angular/core';

type Lang = 'ts' | 'html' | 'bash' | 'text' | 'diagram';

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ESC[c]);
}

const TS_TOKEN_RE = new RegExp(
  [
    '(\\/\\/[^\\n]*)', // line comment
    '(\\/\\*[\\s\\S]*?\\*\\/)', // block comment
    '("(?:[^"\\\\]|\\\\.)*"|\'(?:[^\'\\\\]|\\\\.)*\'|`(?:[^`\\\\]|\\\\.)*`)', // string
    '(@[A-Za-z_][\\w]*)', // decorator / annotation
    '(\\b(?:import|export|from|const|let|var|function|return|if|else|for|while|do|class|interface|type|extends|implements|new|async|await|readonly|public|private|protected|static|this|typeof|keyof|in|of|as|switch|case|default|break|continue|throw|try|catch|finally|void|declare|enum|namespace|yield|super|undefined|true|false|null|instanceof|satisfies|never|unknown)\\b)',
    '(\\b(?:signal|computed|effect|form|schema|field|required|email|min|max|minLength|maxLength|pattern|minDate|maxDate|validate|validateTree|validateAsync|validateHttp|disabled|readonly|hidden|debounce|metadata|applyEach|apply|applyWhen|applyWhenValue|submit|transformedValue|input|output|model|toSignal|toObservable|resource|httpResource)\\b)',
    '(\\b(?:number|string|boolean|object|any|Promise|Signal|WritableSignal|ModelSignal|InputSignal|FieldTree|FieldState|ReadonlyFieldState|FormValueControl|FormCheckboxControl|FormUiControl|FieldValidator|TreeValidator|ValidationError|ValidationResult|NgValidationError|FormField|FormRoot|Validator|HttpResourceRef)\\b)',
    '(\\b[A-Z][A-Za-z0-9_]*\\b)', // other type-like identifiers
    '(\\b\\d+(?:\\.\\d+)?\\b)', // numbers
  ].join('|'),
  'gm',
);

const HTML_TOKEN_RE = new RegExp(
  [
    '(<!--[\\s\\S]*?-->)', // comment
    '(<\\/?[a-zA-Z][\\w-]*[^>]*>)', // whole tag
    '(\\b(?:@if|@for|@switch|@case|@default|@else|@empty|@let)\\b)',
    '("[^"]*"|\'[^\']*\')', // attribute value
  ].join('|'),
  'gm',
);

function tokenize(code: string, regex: RegExp, classOf: (kind: string) => string): string {
  const out: string[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  regex.lastIndex = 0;
  while ((m = regex.exec(code)) !== null) {
    if (m.index > last) out.push(escapeHtml(code.slice(last, m.index)));
    const full = m[0];
    const kind = m.slice(1).findIndex((g) => g !== undefined);
    out.push(`<span class="tok-${classOf(String(kind))}">${escapeHtml(full)}</span>`);
    last = regex.lastIndex;
  }
  out.push(escapeHtml(code.slice(last)));
  return out.join('');
}

function highlightTs(code: string): string {
  return tokenize(code, TS_TOKEN_RE, (k) => {
    switch (k) {
      case '0':
      case '1':
        return 'comment';
      case '2':
        return 'string';
      case '3':
        return 'deco';
      case '4':
        return 'kw';
      case '5':
        return 'fn';
      case '6':
      case '7':
        return 'type';
      default:
        return 'num';
    }
  });
}

function highlightHtml(code: string): string {
  return tokenize(code, HTML_TOKEN_RE, (k) => {
    switch (k) {
      case '0':
        return 'comment';
      case '1':
        return 'tag';
      case '2':
        return 'kw';
      default:
        return 'string';
    }
  });
}

/** Lightweight, dependency-free syntax highlighter with automatic HTML escaping. */
function highlight(code: string, lang: Lang): string {
  const text = lang === 'diagram' || lang === 'text' || lang === 'bash' ? escapeHtml(code) : undefined;
  if (text !== undefined) return text;
  return lang === 'html' ? highlightHtml(code) : highlightTs(code);
}

@Component({
  selector: 'app-code-block',
  template: `
    <div class="code-block" [class.has-copy]="true">
      <div class="code-block__bar">
        <span class="code-block__lang">{{ langLabel }}</span>
        @if (filename()) {
          <span class="code-block__file">{{ filename() }}</span>
        }
        <button
          type="button"
          class="code-block__copy"
          (click)="copy()"
          [attr.aria-label]="copied ? 'Copied' : 'Copy code to clipboard'"
        >
          @if (copied) {
            <span aria-hidden="true">✓</span> Copied
          } @else {
            <span aria-hidden="true">⧉</span> Copy
          }
        </button>
      </div>
      <pre class="code-block__pre"><code [innerHTML]="rendered"></code></pre>
    </div>
  `,
})
export class CodeBlockComponent {
  readonly code = input.required<string>();
  readonly lang = input<Lang>('ts');
  readonly filename = input<string>();
  protected copied = false;

  protected get langLabel(): string {
    return this.lang();
  }

  protected get rendered(): string {
    return highlight(this.code(), this.lang());
  }

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard?.writeText(this.code());
      this.copied = true;
      setTimeout(() => (this.copied = false), 1500);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — ignore.
    }
  }
}