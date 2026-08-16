import { Component, computed, input } from '@angular/core';
import type { WritableSignal } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import type { FieldTree } from '@angular/forms/signals';
import type { Employee, Skill, SkillLevel } from '../employee.model';
import { SKILL_LEVEL_OPTIONS } from '../employee.model';
import { AppFormSection } from './app-form-section';
import { AppSelectField, type SelectOption } from './app-select-field';
import { AppTextField } from './app-text-field';

const levelOptions: readonly SelectOption<SkillLevel | ''>[] = [
  { value: '', label: 'Select a level…' },
  ...SKILL_LEVEL_OPTIONS.map((l) => ({ value: l, label: l.charAt(0) + l.slice(1).toLowerCase() })),
];

let nextSkillId = 1;

@Component({
  selector: 'app-skills-section',
  imports: [AppFormSection, AppTextField, AppSelectField, FormField],
  template: `
    <app-form-section
      title="Skills"
      description="Repeated group rendered from the skills array field. The array structure is driven by the model signal."
    >
      <div id="skills-list" class="skills-list" aria-live="polite">
        @for (skill of form().skills; track skill().keyInParent()) {
          <div class="skill-row">
            <app-text-field [formField]="skill.name" label="Skill name" />
            <app-select-field [formField]="skill.level" [options]="levelOptions" label="Level" />
            <button
              type="button"
              class="btn btn--ghost"
              (click)="removeSkill($index)"
              [attr.aria-label]="'Remove skill ' + ($index + 1)"
            >
              Remove
            </button>
          </div>
        } @empty {
          <p class="muted">No skills yet — add one below.</p>
        }
      </div>
      <button type="button" class="btn" (click)="addSkill()" aria-controls="skills-list">
        + Add skill
      </button>
    </app-form-section>
  `,
})
export class SkillsSection {
  readonly form = input.required<FieldTree<Employee>>();
  readonly model = input.required<WritableSignal<Employee>>();

  protected readonly levelOptions = levelOptions;

  protected readonly skillsCount = computed(() => this.form().skills.length);

  protected addSkill(): void {
    this.model().update((m) => ({
      ...m,
      skills: [...m.skills, { id: nextSkillId++, name: '', level: '' } satisfies Skill],
    }));
  }

  protected removeSkill(index: number): void {
    this.model().update((m) => ({
      ...m,
      skills: m.skills.filter((_, i) => i !== index),
    }));
  }
}