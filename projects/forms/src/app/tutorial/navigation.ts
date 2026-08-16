/**
 * Navigation model for the Signal Forms tutorial.
 *
 * The nav tree drives:
 *  - the persistent side navigation (desktop) and drawer (mobile)
 *  - the scroll-spy active-section highlight
 *  - the previous / next learning progression
 *  - stable URL fragments (each link's `id` maps to a `section[id]` in the page)
 */

export type NavBadge = 'concept' | 'hands-on' | 'example';

export interface NavLink {
  readonly type: 'link';
  readonly id: string;
  readonly title: string;
  readonly badge?: NavBadge;
  readonly exercise?: boolean;
}

export interface NavGroup {
  readonly type: 'group';
  readonly title: string;
  readonly children: readonly NavNode[];
}

export type NavNode = NavGroup | NavLink;

export const NAV_TREE: readonly NavNode[] = [
  {
    type: 'group',
    title: 'Getting Started',
    children: [
      { type: 'link', id: 'mental-model', title: 'Mental Model', badge: 'concept' },
      { type: 'link', id: 'first-signal-form', title: 'First Signal Form', badge: 'hands-on', exercise: true },
      { type: 'link', id: 'anatomy-of-signal-form', title: 'Anatomy of a Signal Form', badge: 'concept' },
    ],
  },
  {
    type: 'group',
    title: 'Core Concepts',
    children: [
      { type: 'link', id: 'form-model', title: 'The Form Model', badge: 'concept' },
      { type: 'link', id: 'fields', title: 'Fields & Field Trees', badge: 'concept' },
      { type: 'link', id: 'field-state', title: 'Field State', badge: 'concept' },
      { type: 'link', id: 'derived-state', title: 'Derived State', badge: 'concept' },
      { type: 'link', id: 'arrays', title: 'Arrays & Repeated Fields', badge: 'hands-on' },
      { type: 'link', id: 'availability', title: 'Disabled / Readonly / Hidden', badge: 'concept' },
      { type: 'link', id: 'dynamic-fields', title: 'Dynamic & Conditional Fields', badge: 'hands-on' },
    ],
  },
  {
    type: 'group',
    title: 'Validation',
    children: [
      { type: 'link', id: 'basic-validation', title: 'Basic Validation', badge: 'hands-on', exercise: true },
      { type: 'link', id: 'custom-validation', title: 'Custom Validators', badge: 'concept', exercise: true },
      { type: 'link', id: 'cross-field-validation', title: 'Cross-field Validation', badge: 'concept' },
      { type: 'link', id: 'conditional-validation', title: 'Conditional Validation', badge: 'concept' },
      { type: 'link', id: 'async-validation', title: 'Async & Server Validation', badge: 'hands-on' },
      { type: 'link', id: 'error-display', title: 'Displaying Errors', badge: 'concept' },
    ],
  },
  {
    type: 'group',
    title: 'Real Projects',
    children: [
      { type: 'link', id: 'api-integration', title: 'API Integration', badge: 'hands-on', exercise: true },
      { type: 'link', id: 'nested-forms', title: 'Nested Forms', badge: 'concept' },
      { type: 'link', id: 'dynamic-forms', title: 'Configuration-driven Forms', badge: 'hands-on' },
      { type: 'link', id: 'reusable-components', title: 'Reusable Components', badge: 'hands-on' },
    ],
  },
  {
    type: 'group',
    title: 'Enterprise Patterns',
    children: [
      { type: 'link', id: 'component-architecture', title: 'Component Architecture', badge: 'concept' },
      { type: 'link', id: 'rxjs-integration', title: 'Signals + RxJS', badge: 'concept' },
      { type: 'link', id: 'state-management', title: 'NgRx / ComponentStore', badge: 'concept' },
      { type: 'link', id: 'performance', title: 'Performance', badge: 'concept' },
      { type: 'link', id: 'accessibility', title: 'Accessibility', badge: 'concept' },
      { type: 'link', id: 'testing', title: 'Testing', badge: 'concept' },
      { type: 'link', id: 'migration', title: 'Migration from Reactive Forms', badge: 'concept' },
    ],
  },
  {
    type: 'group',
    title: 'Production Example',
    children: [{ type: 'link', id: 'employee-management-form', title: 'Employee Management Form', badge: 'example' }],
  },
  {
    type: 'group',
    title: 'Reference',
    children: [
      { type: 'link', id: 'common-mistakes', title: 'Common Mistakes', badge: 'concept' },
      { type: 'link', id: 'cheat-sheet', title: 'Cheat Sheets', badge: 'concept' },
      { type: 'link', id: 'learning-path', title: 'Final Learning Path', badge: 'concept' },
    ],
  },
];

/** Flattened list of every link in reading order. */
export const NAV_LINKS: readonly NavLink[] = (() => {
  const out: NavLink[] = [];
  for (const node of NAV_TREE) {
    if (node.type === 'group') {
      for (const child of node.children) {
        if (child.type === 'link') out.push(child);
      }
    } else if (node.type === 'link') {
      out.push(node);
    }
  }
  return out;
})();

export interface SectionMeta {
  readonly id: string;
  readonly title: string;
  readonly prev?: string;
  readonly next?: string;
  readonly prevTitle?: string;
  readonly nextTitle?: string;
}

/** Maps a section id to its metadata including previous/next navigation. */
export const SECTION_META: ReadonlyMap<string, SectionMeta> = (() => {
  const map = new Map<string, SectionMeta>();
  NAV_LINKS.forEach((link, index) => {
    const prev = NAV_LINKS[index - 1];
    const next = NAV_LINKS[index + 1];
    map.set(link.id, {
      id: link.id,
      title: link.title,
      prev: prev?.id,
      next: next?.id,
      prevTitle: prev?.title,
      nextTitle: next?.title,
    });
  });
  return map;
})();

export function getSectionMeta(id: string): SectionMeta | undefined {
  return SECTION_META.get(id);
}

export function getLink(id: string): NavLink | undefined {
  return NAV_LINKS.find((link) => link.id === id);
}

export function getActiveGroup(activeId: string | undefined): string | undefined {
  if (!activeId) return undefined;
  for (const node of NAV_TREE) {
    if (node.type !== 'group') continue;
    if (node.children.some((child) => child.type === 'link' && child.id === activeId)) return node.title;
  }
  return undefined;
}