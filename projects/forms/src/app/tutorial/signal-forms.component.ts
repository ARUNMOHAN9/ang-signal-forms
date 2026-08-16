import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodeBlockComponent } from './code-block.component';
import { CopyLinkComponent } from './copy-link.component';
import { getActiveGroup, NAV_LINKS, NAV_TREE } from './navigation';
import { PrevNextComponent } from './prev-next.component';
import { ScrollSpyDirective } from './scroll-spy.directive';
import { S } from './code-samples';
import { LiveProfileDemoComponent } from './live-profile-demo.component';
import { EmployeeFormComponent } from '../employee/employee-form.component';

@Component({
  selector: 'app-signal-forms',
  imports: [
    FormsModule,
    ScrollSpyDirective,
    CopyLinkComponent,
    PrevNextComponent,
    CodeBlockComponent,
    LiveProfileDemoComponent,
    EmployeeFormComponent,
  ],
  templateUrl: './signal-forms.component.html',
})
export class SignalFormsComponent {
  protected readonly nav = NAV_TREE;
  protected readonly samples = S;

  protected readonly activeSection = signal<string | undefined>(undefined);
  protected readonly mobileOpen = signal(false);
  protected readonly expandedGroups = signal<ReadonlySet<string>>(new Set(['Getting Started']));

  protected readonly search = signal('');
  protected readonly searching = computed(() => this.search().trim().length > 0);
  protected readonly searchResults = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return [];
    return NAV_LINKS.filter((link) => link.title.toLowerCase().includes(q)).slice(0, 25);
  });

  protected setActive(id: string): void {
    this.activeSection.set(id);
    const group = getActiveGroup(id);
    if (group) this.expandGroup(group);
  }

  protected groupOpen(title: string): boolean {
    return this.expandedGroups().has(title);
  }

  protected expandGroup(title: string): void {
    this.expandedGroups.update((set) => {
      if (set.has(title)) return set;
      const next = new Set(set);
      next.add(title);
      return next;
    });
  }

  protected onGroupToggle(title: string, event: Event): void {
    const open = (event.target as HTMLDetailsElement).open;
    this.expandedGroups.update((set) => {
      const next = new Set(set);
      if (open) next.add(title);
      else next.delete(title);
      return next;
    });
  }

  protected closeMobile(): void {
    this.mobileOpen.set(false);
  }
}