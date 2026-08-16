/**
 * All code samples used across the tutorial.
 *
 * Samples are authored as plain string constants so they can be rendered with
 * automatic HTML-escaping (and optional syntax highlighting) by <app-code-block>.
 */

export const S = {
  // ───────────────────────────────────────────────────────────── Mental model
  mentalRfEquivalent: `import { FormControl, FormGroup, Validators } from '@angular/forms';

const profile = new FormGroup({
  name: new FormControl('', { validators: [Validators.required] }),
  email: new FormControl('', { validators: [Validators.required, Validators.email] }),
  age: new FormControl<number | null>(null, {
    validators: [Validators.min(18)],
  }),
});

// Reading is subscription-based / imperative:
profile.valueChanges.subscribe((value) => console.log(value));
const snapshot = profile.get('name')?.value;
profile.patchValue({ name: 'Ada' });`,

  mentalSignalModel: `// Signal Forms start from an ordinary model signal.

interface UserProfile {
  name: string;
  email: string;
  age: number | null;
}

const profileModel = signal<UserProfile>({ name: '', email: '', age: null });`,

  mentalSignalForm: `// The form IS a field tree over that model signal.
// No duplicate state: the model is the single source of truth.

const profileForm = form(profileModel, (p) => {
  required(p.name);
  required(p.email);
  email(p.email);
  min(p.age, 18);
});

// Reading is a signal read, reactive everywhere:
console.log(profileForm().valid()); // false (empty required fields)
const name = profileForm.name().value(); // reactive read

// Writing through the field updates the model signal too:
profileForm.name().value.set('Ada');
console.log(profileModel().name); // 'Ada'`,

  mentalModelDiagram: `┌──────────────────────────────────────────────────────────┐
│                        UI (template)                    │
│   <input [formField]="profile.name" />                   │
│   <p>{{ profile.name().errors() }}</p>                   │
└──────────────────────────┬───────────────────────────────┘
                           │  one-way binding (no manual sync)
┌──────────────────────────▼───────────────────────────────┐
│                     FieldTree (form)                     │
│   profile:  callable FieldState accessors                │
│   profile.name()   → { value, errors, touched, dirty }   │
│   profile.email()  → { value, errors, touched, dirty }   │
│   profile.age()    → { value, errors, touched, dirty }   │
│   profile()        → root state (valid, value, …)        │
└──────────────────────────┬───────────────────────────────┘
                           │  reads / writes
┌──────────────────────────▼───────────────────────────────┐
│                    Model signal (truth)                  │
│   signal<UserProfile>  { name, email, age }              │
└──────────────────────────────────────────────────────────┘`,

  // ───────────────────────────────────────────────────── First Signal Form
  firstStep1: `export interface UserProfile {
  name: string;
  email: string;
  age: number | null;
}

// 1. The model lives in a writable signal.
protected readonly profileModel = signal<UserProfile>({
  name: '',
  email: '',
  age: null,
});`,

  firstStep2: `import { email, form, min, required } from '@angular/forms';

// 2. Wrap the model with form(). The second argument is a schema fn
//    that declares *rules* (validation, availability, …) per field.
protected readonly profileForm = form(this.profileModel, (p) => {
  required(p.name);
  required(p.email);
  email(p.email);
  min(p.age, 18, { message: 'You must be at least 18.' });
});`,

  firstStep3: `@Component({
  selector: 'app-user-profile',
  imports: [FormField], // the [formField] directive
  template: \`
    <form [formRoot]="profileForm" novalidate>
      <input [formField]="profileForm.name" placeholder="Name" />
      <input [formField]="profileForm.email" type="email" placeholder="Email" />
      <input [formField]="profileForm.age" type="number" placeholder="Age" />
      <button type="submit">Save</button>
    </form>
  \`,
})
export class UserProfile { ... }`,

  firstStep4: `// 4. Reading values — every read is a signal read.
// A specific field: call the field accessor to reach its state.
const name = this.profileForm.name().value();   // 'Ada'

// The whole form: call the root field.
const root = this.profileForm();
root.value();                                    // { name, email, age }

// Reactive derivation outside the template:
protected readonly summary = computed(() => {
  const v = this.profileForm().value();
  return \`\${v.name} · \${v.age} years old\`;
});`,

  firstStep5: `// 5. Updating values.
// Through the field (keeps validation/state machinery in sync):
this.profileForm.name().value.set('Grace');

// Bulk update (as if the API responded with a full record):
this.profileModel.update((current) => ({ ...current, email: 'grace@example.com' }));

// Reset untouched/dirty flags without touching the data:
this.profileForm().reset(this.profileModel());

// Reading a field is just reading a signal — so you can combine
// a controlled input with plain two-way value binding if you prefer:
this.profileForm.email().value = 'hmm'; // not valid — signal is read-only here
this.profileForm.email().value.set('grace@example.com'); // valid`,

  firstStep6: `// 6. Validation is declared in the schema, not glued together in code.
protected readonly profileForm = form(this.profileModel, (p) => {
  required(p.name, { message: 'Name is required.' });
  required(p.email, { message: 'Email is required.' });
  email(p.email, { message: 'Enter a valid email address.' });
  min(p.age, 18, { message: 'You must be at least 18.' });
  max(p.age, 120, { message: 'Please enter a realistic age.' });
});

// The state exposes signals you can read anywhere:
profileForm.name().valid();    // false
profileForm.name().invalid();  // true
profileForm().valid();         // false while any field is invalid`,

  firstStep7: `<!-- 7. Error display — errors are signals per field. -->
<label for="name">Name</label>
<input
  id="name"
  [formField]="profileForm.name"
  [attr.aria-invalid]="profileForm.name().invalid()"
  [attr.aria-describedby]="profileForm.name().invalid() ? 'name-error' : undefined"
/>
@for (err of profileForm.name().errors(); track err.kind) {
  <p id="name-error" class="field-error">{{ err.message }}</p>
}`,

  firstStep8: `// 8. Submission — declarative and guarded against double submits.
protected readonly profileForm = form(this.profileModel, (p) => {
  required(p.name);
  required(p.email);
  email(p.email);
  min(p.age, 18);
}, {
  name: 'profile',
  submission: {
    async action() {
      await this.api.saveProfile(this.profileForm().value());
    },
  },
});

// In the template: <form [formRoot]="profileForm">
//   1. sets novalidate automatically
//   2. intercepts the native submit event
//   3. marks the whole tree touched
//   4. runs the action only when the form is not invalid
//   5. reports result via profileForm().submitting()`, 

  firstIncremental: `// You now have the full loop. The form model never duplicated the
// UI state; the model signal stayed the single source of truth.

@Component({ ... })
export class UserProfile {
  protected readonly profileModel = signal<UserProfile>({ name: '', email: '', age: null });

  protected readonly profileForm = form(this.profileModel, (p) => {
    required(p.name, { message: 'Name is required.' });
    required(p.email, { message: 'Email is required.' });
    email(p.email, { message: 'Enter a valid email address.' });
    min(p.age, 18, { message: 'You must be at least 18.' });
  }, {
    name: 'profile',
    submission: {
      action: async () => {
        await delay(600); // simulate POST
        console.log('Saved', this.profileModel());
      },
    },
  });
}`,

  // ─────────────────────────────────────────────────── Anatomy
  anatomyApi: `const profileForm = form(modelSignal, schemaFn?, options?);

// ` + '`form()`' + ` returns a FieldTree — a callable tree mirroring the model:
profileForm           // root field accessor
profileForm.name      // field accessor for name
profileForm.address   // field accessor for a nested group
profileForm.skills    // array field accessor
profileForm.roles[0]  // field accessor for array item 0

// Call a field accessor to get its FieldState:
profileForm.name()    // { value, touched, dirty, errors, valid, … }

// The [formField] directive binds a field to a UI control:
<input [formField]="profileForm.name" />

// The [formRoot] directive wires a <form> element to submission:
<form [formRoot]="profileForm">…</form>`,

  anatomyLayers: `┌──────────────────────────────────────────────────────────┐
│ 1. Model layer       signal<UserProfile>  (your data)      │
├──────────────────────────────────────────────────────────┤
│ 2. FieldTree         form(model, schema)                  │
│     - mirrors the model shape                             │
│     - every node is a callable field accessor             │
│     - rules live in the schema, not on the tree           │
├──────────────────────────────────────────────────────────┤
│ 3. FieldState        field() → { value, errors, … }       │
│     - reactive snapshots of a single field                │
├──────────────────────────────────────────────────────────┤
│ 4. Schema (rules)    required / email / min / disabled /  │
│                      validate / validateTree / …          │
│     - declarative, composable, reusable                   │
├──────────────────────────────────────────────────────────┤
│ 5. Directives        [formField] + [formRoot]             │
│     - bridge FieldTree ↔ DOM (native inputs, custom)      │
└──────────────────────────────────────────────────────────┘`,

  // ─────────────────────────────────────────────────────── Form model
  modelTruth: `const model = signal<UserProfile>({ name: '', email: '', age: null });

// The form does NOT copy the data:
const f = form(model);
f.name().value.set('Ada');
console.log(model().name); // 'Ada'  — same object, updated in place

// Conversely, replacing the model signal (e.g. after a GET) refreshes the form:
const loaded = await api.getProfile(id);
model.set(loaded); // the FieldTree re-wraps the new value transparently`,

  modelReplace: `// Loading data into the form is just setting the model signal.
async loadProfile(id: number) {
  this.loading.set(true);
  try {
    const profile = await this.api.getProfile(id);
    // Single write, whole tree follows. No patchValue() bookkeeping.
    this.profileModel.set(profile);
  } finally {
    this.loading.set(false);
  }
}`,

  // ──────────────────────────────────────────────────────── Fields
  fieldsNested: `interface Employee {
  personal: { firstName: string; lastName: string };
  skills: string[];
}

const employeeForm = form(model, (p) => {
  required(p.personal.firstName);
  required(p.personal.lastName);
  required(p.skills);
});

// Nested access mirrors the shape:
employeeForm.personal.firstName().value;
employeeForm.personal().value;   // { firstName, lastName }

// @for over an array field iterates its item fields reactively:
//   @for (skill of employeeForm.skills; track $index) {
//     <input [formField]="skill" />
//   }`,

  // ───────────────────────────────────────────────────── Field state
  fieldStateTable: `interface FieldState<T> {
  // read-only signals
  value: Signal<T>;
  controlValue: Signal<T>;
  touched: Signal<boolean>;
  dirty: Signal<boolean>;
  valid: Signal<boolean>;
  invalid: Signal<boolean>;
  pending: Signal<boolean>;
  submitting: Signal<boolean>;
  disabled: Signal<boolean>;
  readonly: Signal<boolean>;
  hidden: Signal<boolean>;
  required: Signal<boolean>;
  errors: Signal<ValidationError.WithFieldTree[]>;
  errorSummary: Signal<ValidationError.WithFieldTree[]>;
  name: Signal<string>;
  keyInParent: Signal<string | number>;

  // methods
  markAsTouched(options?): void;
  markAsDirty(): void;
  getError(kind: string): ValidationError.WithFieldTree | undefined;
  reset(value?): void;
  reloadValidation(): void;
  focusBoundControl(options?): void;
}`,

  fieldStateExample: `const email = this.profileForm.email();

email.value();        // current value
email.touched();      // user has blurred it at least once
email.dirty();        // differs from what the user started with
email.valid();        // no errors and no pending validators
email.invalid();      // has errors right now
email.pending();      // an async validator is still running
email.errors();       // [RequiredValidationError]
email.getError('email'); // typed error instance if present

// Writing:
email.value.set('grace@example.com');
email.markAsTouched();
email.markAsDirty();
email.reset('grace@example.com'); // resets touched/dirty, keeps value`,

  // ───────────────────────────────────────────────────── Derived state
  derivedFullName: `const firstName = this.employeeForm.personal.firstName;
const lastName = this.employeeForm.personal.lastName;

// computed() reacts to the underlying field signals — free memoization.
protected readonly fullName = computed(() =>
  \`\${firstName().value()} \${lastName().value()}\`.trim(),
);`,

  derivedCompensation: `// Salary drives a chain of derived values.
protected readonly baseSalary = this.employeeForm.compensation.baseSalary;

protected readonly annualSalary = computed(() => {
  const base = this.baseSalary().value();
  if (base === null) return 0;
  const multiplier = this.employmentType().value() === 'CONTRACT' ? 12 : 12.96;
  return Math.round(base * multiplier);
});

protected readonly taxBracket = computed(() => {
  const annual = this.annualSalary();
  if (annual > 150000) return '40%';
  if (annual > 50000) return '30%';
  return '20%';
});

// In the template: {{ annualSalary() | currency }}  ({{ taxBracket() }})`,

  // ───────────────────────────────────────────────────────── Arrays
  arraysSchema: `interface Employee {
  skills: Skill[];
}
interface Skill {
  id: number;
  name: string;
}

const employeeForm = form(model, (p) => {
  required(p.skills);
  // Per-item rules via applyEach + a reusable schema:
  applyEach(p.skills, skillSchema);
});

const skillSchema = schema<Skill>((s) => {
  required(s.name);
  minLength(s.name, 2);
});`,

  arraysTemplate: `<!-- Iterating items is a reactive @for over the array field. -->
@for (skill of employeeForm.skills; track $index) {
  <div class="skill-row">
    <input [formField]="skill.name" placeholder="Skill name" />
    <button type="button" (click)="removeSkill($index)">Remove</button>
  </div>
}
<button type="button" (click)="addSkill()">Add skill</button>`,

  arraysMutation: `// The model signal drives the structure. Push/patch the array there:
protected addSkill() {
  this.employeeModel.update((m) => ({
    ...m,
    skills: [...m.skills, { id: nextId(), name: '' }],
  }));
}

protected removeSkill(index: number) {
  this.employeeModel.update((m) => ({
    ...m,
    skills: m.skills.filter((_, i) => i !== index),
  }));
}

// Validation state is recalculated as items appear and disappear.
// The @for re-renders because the array field is reactive.`,

  // ────────────────────────────────────────────────────── Availability
  availabilityConditional: `// Disable when the checkbox is off (reason text shows in disabledReasons()).
form(model, (p) => {
  disabled(p.address, {
    when: (ctx) =>
      ctx.valueOf(p.hasAddress) ? false : 'Address is only edited when enabled.',
  });
});`,

  availabilityReadonly: `// Read-only during review mode — still submitted, but not editable.
readonly(p.salary, {
  when: () => this.mode() === 'review',
});`,

  availabilityHidden: `// Hidden fields are excluded from validation, touched and dirty.
hidden(p.contractEndDate, {
  when: (ctx) => ctx.valueOf(p.employmentType) !== 'CONTRACT',
});

// Remember: hidden() only controls state — hide it in the template too:
@if (!employeeForm.contractEndDate().hidden()) {
  <label for="end">Contract end date</label>
  <input id="end" [formField]="employeeForm.contractEndDate" type="date" />
}`,

  availabilityReasons: `// Every availability rule records *why*.
employeeForm.address().disabledReasons();
// [ { fieldTree, message: 'Address is only edited when enabled.' } ]

// Combine availability rules; each contributes a reason:
disabled(p.personal, { when: () => this.locked() });
disabled(p.personal, { when: (ctx) => ctx.valueOf(p.personal.status) === 'TERMINATED' });`,

  // ───────────────────────────────────────────────────────── Validation
  builtinValidation: `// The standard validators, wired into the schema:
required(p.email, { message: 'Email is required.' });
email(p.email, { message: 'Enter a valid email.' });
min(p.age, 18);
max(p.age, 120);
minLength(p.password, 8);
maxLength(p.bio, 280);
pattern(p.phone, /^\\+?[1-9][0-9]{7,14}$/, { message: 'Use E.164 format.' });
minDate(p.joiningDate, new Date(2000, 0, 1));
maxDate(p.contractEndDate, () => this.contractEndDateMax());

// Extra metadata is exposed for the UI automatically:
email.min();        // undefined
pPasswordForm.minLength(); // 8 — handy for <input [attr.minlength]="…">
`,

  validatorsWhen: `// Validators run only when ` + '`when`' + ` says so:
required(p.bio, { when: (ctx) => ctx.valueOf(p.includeBio) });

// Static message vs dynamic error objects:
maxLength(p.username, 20, {
  error: () => [{ kind: 'username-too-long', message: 'Pick something shorter.' }],
});`,

  customValidate: `// validate() runs a custom function against the field's value.
// Return undefined/null for "ok", or one/many ValidationError objects.
validate(p.username, (ctx) => {
  const value = ctx.value();
  if (value.includes('admin')) {
    return { kind: 'reserved-word', message: 'This name is reserved.' };
  }
  return undefined;
});

// Use ctx.state / ctx.value to read the current field.
// For OTHER fields, reach for ctx.valueOf(otherPath):
validate(p.confirmPassword, (ctx) => {
  if (ctx.valueOf(p.password) !== ctx.value()) {
    return { kind: 'mismatch', message: 'Passwords do not match.' };
  }
  return undefined;
});`,

  crossFieldValidateTree: `// validateTree() sees the whole subtree and can target errors at child fields.
form(model, (p) => {
  required(p.password);
  required(p.confirmPassword);

  validateTree(p, (ctx) => {
    if (ctx.valueOf(p.password) !== ctx.valueOf(p.confirmPassword)) {
      // Point the error at the confirm field, not the whole form:
      return {
        fieldTree: ctx.fieldTreeOf(p.confirmPassword),
        kind: 'mismatch',
        message: 'Passwords must match.',
      };
    }
    return undefined;
  });
});

// fieldTreeOf(path) hands you the real FieldTree at runtime,
// so the error shows up on the confirm input, exactly like a field error.`,

  crossFieldEmployees: `// Cross-field rules with context lookup helpers:
validateTree(p, (ctx) => {
  const leaves = ctx.valueOf(p.vacation);
  const joins = ctx.valueOf(p.joiningDate);
  if (joins && leaves && leaves < joins) {
    return {
      fieldTree: ctx.fieldTreeOf(p.vacation),
      kind: 'vacation-before-join',
      message: 'Vacation cannot start before the join date.',
    };
  }
  return undefined;
});`,

  conditionalValidation: `// Conditional requirements are just validators with a ` + '`when`' + ` guard.
form(model, (p) => {
  required(p.contractEndDate, {
    when: (ctx) => ctx.valueOf(p.employmentType) === 'CONTRACT',
  });
});

// If employmentType is FTE, the validator is skipped entirely:
// contractEndDate.valid() === true, regardless of its value.
// Switch back to CONTRACT and the field re-validates instantly —
// no manual valueChanges().pipe(filter(...)) glue required.`,

  asyncValidation: `// validateAsync debounces, runs a Resource, and maps the result to errors.
// Only runs once ALL synchronous validation on the field passes.
validateAsync(p.username, {
  debounce: 400,
  when: (ctx) => ctx.value().length >= 3,
  params: (ctx) => ({ username: ctx.value() }),
  factory: (params) =>
    resource({
      params,
      loader: ({ request }) => this.api.checkUsername(request.username),
    }),
  onSuccess: (result, ctx) =>
    result.taken
      ? [{ fieldTree: ctx.fieldTreeOf(p.username), kind: 'username-taken',
           message: \`"\${result.username}" is already taken.` + '`' + ` }]
      : undefined,
  onError: (error, ctx) =>
    [{ fieldTree: ctx.fieldTreeOf(p.username), kind: 'username-check-failed',
       message: 'Could not verify this username. Try again.' }],
});

// While the resource is loading, the field reports pending():
username.pending(); // true → show a spinner instead of errors`,

  validateHttp: `// Same idea, but built on httpResource — no manual resource().
validateHttp(p.username, {
  debounce: 400,
  when: (ctx) => ctx.value().length >= 3,
  request: (ctx) => ({
    method: 'GET',
    url: '/api/users/check',
    params: { username: ctx.value() },
  }),
  onSuccess: (result, ctx) =>
    result.taken
      ? [{ fieldTree: ctx.fieldTreeOf(p.username), kind: 'username-taken',
           message: 'Username already exists.' }]
      : undefined,
  onError: () =>
    [{ kind: 'server-unreachable', message: 'Could not verify right now.' }],
});`,

  asyncReaction: `// Why this "just works": every rule is a signal dependency.
// validateAsync subscribes to the field value → params signal → resource.
// Typing a username:
//   1. debounce timer starts (400 ms)        → pending() true
//   2. resource(params) fires                → GET /api/users/check
//   3. onSuccess maps the payload to errors  → errors() updates
// The form's root valid/pending fold these updates up automatically.`,

  serverErrorsSubmit: `// Server-side errors flow back into the field tree.
// Return errors from the submission action:
submission: {
  async action(form) {
    const res = await this.api.save(form().value());
    if (res.errors) {
      return res.errors.map((e) => ({
        // Target the exact field — shows up like a field-level error.
        fieldTree: form[e.field],
        kind: e.code,
        message: e.message,
      }));
    }
    return undefined;
  },
},

// On the UI: errors() picks them up, errorSummary() aggregates them,
// and a form-level banner can render form().errorSummary() when invalid.`,

  formLevelErrors: `// A summary banner for the whole form:
@if (profileForm().invalid()) {
  <div class="form-banner" role="alert">
    <strong>Check the form:</strong>
    @for (err of profileForm().errorSummary(); track $index) {
      <p>{{ err.message }}</p>
    }
  </div>
}`,

  // ─────────────────────────────────────────────────────── API integration
  apiDto: `interface ProfileDto {
  id: number;
  fullName: string;
  contact: { email: string };
  dateOfBirth: string;   // ISO
}

// DTO → model: keep API shape out of the form model.
function toProfile(dto: ProfileDto): UserProfile {
  return {
    id: dto.id,
    name: dto.fullName,
    email: dto.contact.email,
    age: ageFrom(dto.dateOfBirth),
  };
}

// model → DTO (create vs edit differ only by id/path):
const dto: ProfileDto = {
  id: model().id,
  fullName: model().name,
  contact: { email: model().email },
  dateOfBirth: toIso(model().dateOfBirth),
};`,

  apiCreateEdit: `// One form, two modes.
@Component({ ... })
export class ProfileEditor {
  protected readonly mode = input<'create' | 'edit'>('create');
  protected readonly profileModel = signal<UserProfile>({ id: 0, name: '', email: '', age: null });

  protected readonly profileForm = form(this.profileModel, profileSchema, {
    name: 'profile',
    submission: {
      action: async () => {
        const dto = toProfileDto(this.profileModel());
        const saved = this.mode() === 'edit'
          ? await this.api.updateProfile(this.profileModel().id, dto)
          : await this.api.createProfile(dto);
        this.profileModel.set(saved);
        this.saved.set(true);
      },
    },
  });

  // Populate on arrival (e.g. from a resolver or a query param).
  async ngOnInit() {
    if (this.mode() === 'edit') {
      const profile = await this.api.getProfile(id);
      this.profileModel.set(profile);
    }
  }
}`,

  apiLoadingStates: `// Loading and submitting are plain signals — no events to wire.
protected readonly loading = signal(false);
protected readonly saved = signal(false);

@if (loading()) {
  <div class="spinner" aria-live="polite">Loading profile…</div>
} @else {
  <form [formRoot]="profileForm">
    …
    <button type="submit" [disabled]="profileForm().submitting() || profileForm().invalid()">
      @if (profileForm().submitting()) { Saving… } @else { Save profile }
    </button>
    @if (saved()) { <p class="success" role="status">Saved.</p> }
  </form>
}`,

  apiFlow: `// Full data flow — every hop is a signal, nothing imperative:
//
//   load  →  model.set(dto)        → form re-wraps
//   edit  →  field.value.set(...)  → model signal updates
//   submit→  formRoot → submit()   → action() → HTTP PUT/POST
//   error →  action returns errors → mapped onto fields
//   ok    →  saved.set(true)       → navigate / show toast`,

  // ──────────────────────────────────────────────────────── Nested forms
  nestedForms: `interface Employee {
  personal: Personal;
  address: Address;
  emergencyContact: EmergencyContact;
}

// Reusable schema for any object shape:
const personalSchema = schema<Personal>((p) => {
  required(p.firstName);
  required(p.lastName);
});

const addressSchema = schema<Address>((p) => {
  required(p.street);
  required(p.city);
  pattern(p.postalCode, /^[0-9]{5}$/, { message: '5-digit postal code.' });
});

// Compose them into the root schema:
const employeeForm = form(model, (p) => {
  apply(p.personal, personalSchema);
  apply(p.address, addressSchema);
  apply(p.emergencyContact, emergencyContactSchema);
});

// The FieldTree keeps the same nested shape you can navigate:
employeeForm.personal.firstName().value.set('Ada');
employeeForm.address().valid();`,

  nestedComponents: `// Splitting the template does NOT split the state:
<app-personal-details [form]="employeeForm" />
<app-address-form [address]="employeeForm.address" />

// A section component receives the fields it owns and binds them directly.
// No outputs to bubble validation back up — state lives in the one FieldTree.`,

  // ───────────────────────────────────────────────── Dynamic forms
  dynamicContactType: `type ContactType = 'individual' | 'company';

interface Contact {
  type: ContactType;
  individual?: { firstName: string; lastName: string };
  company?: { companyName: string; registrationNumber: string };
}

// Narrow the type with applyWhenValue, then apply a schema:
form(model, (p) => {
  required(p.type);

  applyWhenValue(p.individual, (v) => v?.type === 'individual', individualSchema);
  applyWhenValue(p.company, (v) => v?.type === 'company', companySchema);
});

// The schema only exists for the branch that is currently active.
// Switch the type → the other branch validates/clears automatically.`,

  dynamicConditionalSections: `@if (contact().type() === 'individual') {
  <fieldset>
    <legend>Individual</legend>
    <input [formField]="contact.individual().firstName" />
    <input [formField]="contact.individual().lastName" />
  </fieldset>
} @else {
  <fieldset>
    <legend>Company</legend>
    <input [formField]="contact.company().companyName" />
    <input [formField]="contact.company().registrationNumber" />
  </fieldset>
}

// Optional branch fields are typed ` + '`T | undefined`' + ` and are simply
// undefined until the model creates them.`,

  configDriven: `// Configuration-driven: a schema describes rules, the form follows.
const fieldConfigs: FieldConfig[] = [
  { key: 'firstName', type: 'text',    label: 'First name', required: true },
  { key: 'lastName',  type: 'text',    label: 'Last name',  required: true },
  { key: 'email',     type: 'email',   label: 'Email',      required: true },
  { key: 'age',       type: 'number',  label: 'Age',        min: 18 },
];

// The schema is generated from the configuration:
const dynamicSchema = schema<Record<string, string | number>>((p) => {
  for (const c of fieldConfigs) {
    if (c.required) required(p[c.key]);
    if (c.min !== undefined) min(p[c.key], c.min);
  }
});

// And the template iterates the same config:
@for (c of fieldConfigs; track c.key) {
  <label [for]="c.key">{{ c.label }}</label>
  <input
    [id]="c.key"
    [type]="c.type"
    [formField]="dynamicForm[c.key]"
    [attr.required]="c.required || undefined"
  />
}`,

  configOverengineering: `// ⚠️ Configuration-driven forms are a tool, not a goal.
// They shine when:
//   - the same fields must be rendered by different products/tenants
//   - field sets come from a backend/admin UI
//   - a form builder is a user-facing feature
//
// Avoid them when:
//   - there is exactly one form, with custom layout and behavior
//   - fields have bespoke logic (cross-field rules, custom widgets)
//   - you would end up storing functions in JSON

// Start with a normal typed schema. Promote to configuration
// only when a second consumer actually appears.`,

  // ──────────────────────────────────────────────── Reusable components
  reusableContract: `// The contract for a reusable control is tiny:
// a ` + '`value`' + ` model signal (or ` + '`checked`' + ` for checkboxes),
// plus optional inputs/outputs the [formField] directive keeps in sync.

interface FormValueControl<T> {
  readonly value: ModelSignal<T>;
  readonly errors?: InputSignal<readonly ValidationError.WithOptionalFieldTree[]>;
  readonly disabled?: InputSignal<boolean>;
  readonly readonly?: InputSignal<boolean>;
  readonly required?: InputSignal<boolean>;
  readonly invalid?: InputSignal<boolean>;
  readonly pending?: InputSignal<boolean>;
  readonly touch?: OutputRef<void>;
  focus?(options?: FocusOptions): void;
  reset?(): void;
}`,

  reusableTextField: `@Component({
  selector: 'app-text-field',
  imports: [FormsModule], // for the model() two-way sugar only
  template: \`
    <div class="field">
      <label [for]="id()">{{ label() }}</label>
      <input
        [id]="id()"
        [value]="value()"
        (input)="value.set($any($event.target).value)"
        (blur)="touch.emit()"
        [attr.required]="required() || undefined"
        [attr.readonly]="readonly() || undefined"
        [attr.disabled]="disabled() || undefined"
        [attr.aria-invalid]="invalid()"
        [attr.aria-describedby]="invalid() ? errorId() : undefined"
      />
      @for (err of errors(); track $index) {
        <p class="field-error" [id]="errorId()">{{ err.message }}</p>
      }
    </div>
  \`,
})
export class AppTextField implements FormValueControl<string> {
  readonly value = model.required<string>();
  readonly label = input.required<string>();
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly required = input(false);
  readonly invalid = input(false);
  readonly touch = output<void>();
  private readonly uid = Math.random().toString(36).slice(2);
  readonly id = () => 'tf-' + this.uid;
  readonly errorId = () => this.id() + '-error';
}`,

  reusableUsage: `// Usage — the [formField] directive does the wiring:
<app-text-field
  [formField]="employeeForm.personal.firstName"
  label="First name"
/>
<app-text-field
  [formField]="employeeForm.email"
  label="Work email"
  type="email"
/>`,

  reusableCheckbox: `// A checkbox control uses ` + '`checked`' + ` instead of ` + '`value`' + `:
@Component({ selector: 'app-toggle', template: \`
  <label>
    <input type="checkbox" [checked]="checked()"
           (change)="checked.set($any($event.target).checked)" />
    {{ label() }}
  </label>
\` })
export class AppToggle implements FormCheckboxControl {
  readonly checked = model.required<boolean>();
  readonly label = input.required<string>();
}`,

  cva: `// Do you still need ControlValueAccessor? No — for new code, skip it.
// The [formField] directive supports, in priority order:
//   1. native inputs / textareas
//   2. custom controls implementing FormValueControl / FormCheckboxControl
//   3. legacy controls exposing a ControlValueAccessor (backwards compat only)
//
// Keep CVAs only for existing reactive-forms components you can't rewrite yet.
// New signal-forms controls should implement the tiny FormValueControl contract.`,

  // ─────────────────────────────────────────────── Component architecture
  architecture: `EmployeeFormComponent            // owns model + form + api
 ├─ PersonalDetailsSection        // receives: form
 ├─ EmploymentDetailsSection      // receives: form
 ├─ AddressSection                // receives: form.address
 ├─ SkillsSection                 // receives: form.skills
 └─ EmergencyContactSection       // receives: form

// Rules:
//  - ONE form() call per logical form; never nest form() inside components.
//  - Pass fields (or the root form) down as inputs. No two-way handshake.
//  - Validation lives in the schema — near the domain, not in templates.
//  - Sections are presentational: they bind, they do not orchestrate.`,

  architectureWhy: `// Why not split form() per section?
//  - validation that spans sections becomes impossible to coordinate
//  - the model signal can no longer be a single source of truth
//  - sections would need an event bus just to talk to each other
//
// A single FieldTree + presentational sections is the enterprise default.
// Break a form into multiple form() calls only when the sub-trees are
// genuinely independent and never need to validate against each other.`,

  // ───────────────────────────────────────────────────────── RxJS
  rxjsBridge: `// Signals are the default for UI and form state.
// Use RxJS where you genuinely need streams/operators/timelines:
//   - websockets, intervals, buffer, exhaustMap, race
//   - existing service APIs that return Observables
//   - complex async pipelines that are awkward as signals

// Bridge in the direction that matches the data flow:

// Observable → signal (for a template that consumes signals):
readonly connection$ = this.socket.stream();
readonly status = toSignal(this.connection$, { initialValue: 'connecting' });

// Signal → observable (for RxJS pipelines):
readonly name$ = toObservable(this.profileForm.name().value);
readonly autocomplete$ = this.name$.pipe(
  debounceTime(250),
  distinctUntilChanged(),
  switchMap((term) => this.api.search(term)),
);`,

  rxjsAutocomplete: `// Realistic autocomplete: form value in, option list out.
protected readonly searchTerm = this.profileForm.name().value;

protected readonly suggestions = toSignal(
  toObservable(this.searchTerm).pipe(
    debounceTime(250),
    distinctUntilChanged(),
    switchMap((term) => (term.trim() ? this.api.search(term) : of([]))),
  ),
  { initialValue: [] },
);

// Template:
@for (item of suggestions(); track item.id) { <li>{{ item.name }}</li> }`,

  rxjsDebouncedValidation: `// Most debouncing is now built-in: validateAsync/validateHttp have a
// debounce option, and debounce(path, ms) delays field updates.
// Only reach for RxJS debounce when you are consuming an external stream:

const remote$ = toObservable(this.profileForm.username().value).pipe(
  debounceTime(400),
  switchMap((u) => this.api.checkUsername(u)),
  map((r) => (r.taken ? 'taken' : 'free')),
);`,

  rxjsDependentDropdowns: `// Dependent dropdowns: react to one field, load another.
protected readonly states = toSignal(
  toObservable(this.employeeForm.address.country().value).pipe(
    distinctUntilChanged(),
    switchMap((country) => (country ? this.api.states(country) : of([]))),
  ),
  { initialValue: [] },
);

// When the country changes, clear stale city:
effect(() => {
  const country = this.employeeForm.address.country().value();
  const cities = this.employeeForm.address.cities();
  if (country && !cities().some((c) => c.country === country)) {
    this.employeeModel.update((m) => ({ ...m, address: { ...m.address, city: '' } }));
  }
});

// Tip: prefer derived *signals* of option lists when the source is local,
// and reserve toObservable/switchMap for genuinely remote data.`,

  rxjsMixing: `// Two rules of thumb:
// 1. Prefer one paradigm per concern.
//    Form state → signals. Long-lived streams → RxJS.
// 2. Bridge at the edge, not in the middle.
//    Convert once with toSignal/toObservable; don't pipe() inside
//    computed() or call .subscribe() inside effect().

// Anti-pattern — imperative subscribes + signals mixing:
effect(() => this.someObservable$.subscribe(...));   // ❌
computed(() => this.api.get$(this.value()));          // ❌`,

  // ────────────────────────────────────────────────────────── NgRx
  ngrxLayers: `// Three kinds of state — keep them separate:

// 1. Server state  (NgRx store / entity state)
//    employees: EntityState<Employee>          ← source of truth on the server

// 2. Application state (NgRx store)
//    selectedEmployeeId, route params, permissions

// 3. Form state  (Signal Forms — NOT in the store)
//    touched/dirty/errors/pending/submitting    ← ephemeral, user-driven

// Each keystroke touching the store means:
//   - a new action → reducer → selector → subscription
//   - history/DevTools churn
//   - hard-to-debug "state sync" bugs between store and form
// None of that buys you anything for a text field.`,

  ngrxLoad: `// The store feeds the form, not the other way around.

@Component({ ... })
export class EmployeeEditor {
  // Store → form: load the selected employee when it arrives.
  protected readonly selected = this.store.selectSignal(selectSelectedEmployee);

  protected readonly employeeModel = signal<Employee>(emptyEmployee());
  protected readonly employeeForm = form(this.employeeModel, employeeSchema, { ... });

  constructor() {
    effect(() => {
      const emp = this.selected();
      if (emp) this.employeeModel.set(emp);
    });
  }

  // Form → store: dispatch only on explicit save, never per keystroke.
  protected save() {
    this.store.dispatch(saveEmployee({ employee: this.employeeModel() }));
  }
}`,

  ngrxStore: `// ComponentStore variant — same rule: form state stays local.

export class EmployeeStore extends ComponentStore<EmployeeState> {
  readonly employee = this.selectSignal((s) => s.employee);
  readonly save = this.effect((employee$: Observable<Employee>) =>
    employee$.pipe(
      exhaustMap((e) => this.api.save(e).pipe(
        tap(() => this.patchState({ saved: true })),
      )),
    ),
  );
}

// The editor uses the store for loading/saving, and Signal Forms for editing.
// Neither side copies the other's state.`,

  // ─────────────────────────────────────────────────────── Performance
  performanceFine: `// Signal Forms are fine-grained: editing one field re-renders only
// the bindings that actually depend on it.
// With OnPush default in v22 you get this for free — no zone event storms.

// Do NOT rebuild giant snapshots per keystroke:
@for (emp of allEmployees(); track emp.id) { ... }  // global list — unrelated to form`,

  performanceAvoid: `// ❌ A computed that scans the whole tree on every keystroke:
readonly something = computed(() => {
  const value = this.form().value();          // reads EVERYTHING
  return expensiveScan(value);
});

// ✅ Read only what changed:
readonly total = computed(() => {
  const base = this.form.compensation.baseSalary().value();
  return base !== null ? base * 12 : 0;
});`,

  performanceArrays: `// For very large arrays, keep items small and track by index/id:
@for (row of form.rows; track $index) {
  <app-row [row]="row" />
}

// And avoid touching the model with a brand-new object on every keystroke
// when a targeted write is enough. Writing a field's value already only
// replaces the model object along the changed path (structural sharing).`,

  performanceValidators: `// Expensive validators: keep them cheap, memoize, and gate them.

// ❌ Recomputes on every keystroke of any field it depends on:
validate(p.compound, (ctx) => {
  const big = computeExpensive(ctx.value());
  return big.ok ? undefined : { kind: 'compound' };
});

// ✅ Cheap gate first, expensive part behind a condition:
validate(p.compound, (ctx) => {
  if (!ctx.state.dirty()) return undefined;
  const v = ctx.value();
  if (v === null || v.length < 4) return undefined;
  return expensiveCheck(v) ? undefined : { kind: 'compound' };
});

// ✅ Debounce async work so you don't spam the server:
validateHttp(p.username, {
  debounce: 400,
  request: (ctx) => ({ url: '/check', params: { q: ctx.value() } }),
  onSuccess: () => undefined,
  onError: () => undefined,
});`,

  performanceEffects: `// Effects are for side effects, not derived state.
// ❌ Deriving in an effect writes back into signals — double work.
effect(() => {
  this.derived.set(compute(this.form().value()));
});
// ✅ Derive with computed() — lazy, memoized, glitch-free.
readonly derived = computed(() => compute(this.form().value()));

// And never create effects/computeds in loops or @for templates
// that recreate on every change-detection pass.`,

  // ────────────────────────────────────────────────────────── A11y
  a11yBasics: `<!-- Semantic structure + labels, native inputs first. -->
<div class="field">
  <label for="email">Work email</label>
  <input
    id="email"
    type="email"
    autocomplete="email"
    [formField]="employeeForm.email"
    [attr.required]="employeeForm.email().required() || undefined"
    [attr.aria-invalid]="employeeForm.email().invalid()"
    [attr.aria-describedby]="
      employeeForm.email().invalid() ? 'email-error email-help' : 'email-help'
    "
  />
  <p id="email-help" class="help">Used for login and notifications.</p>
  @for (err of employeeForm.email().errors(); track $index) {
    <p id="email-error" class="field-error" role="alert">{{ err.message }}</p>
  }
</div>`,

  a11yFocus: `// Focus the first invalid field on an invalid submit.
protected onInvalidSubmit() {
  const firstError = this.employeeForm().errorSummary()[0];
  firstError?.fieldTree()?.focusBoundControl();
}

// Required indicators that work without color alone:
<label for="email">
  Work email <span class="req" aria-hidden="true">*</span>
  <span class="sr-only">(required)</span>
</label>`,

  a11yDynamic: `// Dynamic fields (arrays, conditional sections) need announced changes.
@for (skill of employeeForm.skills; track $index) {
  <app-text-field [formField]="skill.name" label="Skill {{ $index + 1 }}" />
}
<button type="button" (click)="addSkill()" aria-controls="skills-list">Add skill</button>
<p id="skills-list" aria-live="polite" class="sr-only">
  {{ employeeForm.skills.length }} skills
</p>`,

  // ─────────────────────────────────────────────────────────── Testing
  testingUnit: `// Field logic is plain signals — unit-test the schema without a DOM.
describe('employeeSchema', () => {
  it('requires contractEndDate only for CONTRACT', () => {
    const model = signal<Employee>(emptyEmployee());
    const form = signalForm(model, employeeSchema);

    expect(form().valid()).toBe(false); // required fields empty

    model.update((m) => ({ ...m, firstName: 'Ada', lastName: 'Lovelace' }));
    expect(form().valid()).toBe(true); // FTE → no contractEndDate needed

    model.update((m) => ({ ...m, employmentType: 'CONTRACT' }));
    expect(form.contractEndDate().valid()).toBe(false);
  });
});`,

  testingComponent: `// Component tests via TestBed — user interaction through the DOM.
it('shows a validation error and blocks submit', async () => {
  const fixture = TestBed.createComponent(EmployeeForm);
  fixture.detectChanges();

  const submitBtn = fixture.nativeElement.querySelector('button[type=submit]');
  submitBtn.click();
  await fixture.whenStable();

  const firstError = fixture.nativeElement.querySelector('.field-error');
  expect(firstError?.textContent).toContain('required');

  const spy = spyOn(TestBed.inject(EmployeeApi), 'save');
  expect(spy).not.toHaveBeenCalled();
});

it('submits a valid form', async () => {
  const api = TestBed.inject(EmployeeApi);
  const save = spyOn(api, 'save').and.resolveTo({ ok: true });

  typeInto(fixture, '#firstName', 'Ada');
  typeInto(fixture, '#lastName', 'Lovelace');
  await fixture.whenStable();

  fixture.nativeElement.querySelector('button[type=submit]').click();
  await fixture.whenStable();

  expect(save).toHaveBeenCalledWith(expect.objectContaining({
    firstName: 'Ada',
    lastName: 'Lovelace',
  }));
});`,

  testingE2e: `// Playwright: test the user journey, not the framework.
test('creates an employee end-to-end', async ({ page }) => {
  await page.goto('/employees/new');

  await page.getByLabel('First name').fill('Ada');
  await page.getByLabel('Last name').fill('Lovelace');
  await page.getByLabel('Department').selectOption('ENGINEERING');
  await page.getByRole('button', { name: 'Save employee' }).click();

  await expect(page.getByText('Saved successfully')).toBeVisible();
  await expect(page).toHaveURL(/employees\/42/); // created id
});

// What e2e should NOT cover:
//  - every validator permutation           → unit tests
//  - conditional schema math               → unit tests
//  - mock-API success/error wiring         → component tests
// E2E is for the happy path + critical flows across real HTTP.`,

  // ─────────────────────────────────────────────────────── Migration
  migrationStart: `// Reactive Forms today:
this.form = this.fb.group({
  name: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]],
  age: [null, [Validators.min(18)]],
});`,

  migrationStep1: `// Step 1 — swap the FormGroup for a model signal + form().
protected readonly profileModel = signal<UserProfile>({ name: '', email: '', age: null });

protected readonly profileForm = form(this.profileModel, (p) => {
  required(p.name);
  required(p.email);
  email(p.email);
  min(p.age, 18);
});`,

  migrationStep2: `// Step 2 — replace formGroup/formControlName with [formField].
<form [formRoot]="profileForm" novalidate>
  <input [formField]="profileForm.name" />
  <input [formField]="profileForm.email" />
  <input [formField]="profileForm.age" />
</form>`,

  migrationStep3: `// Step 3 — replace valueChanges subscriptions with computed/effect.
// Before:
this.form.get('email')!.valueChanges
  .pipe(debounceTime(300), distinctUntilChanged())
  .subscribe((v) => this.checkEmail(v));

// After (validation debounce is built-in, so this is often deleted):
effect(() => {
  const v = this.profileForm.email().value();
  if (v) this.checkEmail(v);
});`,

  migrationMapping: `// Direct mappings (happy path):
//   FormGroup            →  form(model, schema)
//   FormControl          →  field in the schema + [formField] binding
//   FormArray            →  array field over the model + applyEach
//   valueChanges         →  field().value (signal) / computed() / effect()
//   statusChanges        →  field().valid() / invalid() / pending()
//   setValue/patchValue  →  model.set() / model.update()
//   get(...)             →  form.some.path
//   markAsTouched        →  field().markAsTouched()
//   form.valid           →  form().valid()
//   Validators.xxx       →  required / email / min / max / pattern / …
//   custom validator     →  validate() / validateTree()
//   async validator      →  validateAsync() / validateHttp()
//
// Needs redesign (no 1:1 mapping):
//   - cross-control logic hidden in components  → declarative schema rules
//   - dynamic add/remove with FormArray          → model signal updates
//   - control-dependent validators              → ctx.valueOf(otherPath)
//   - ErrorStateMatcher customization           → [formField] class config`,

  migrationRedesign: `// Things that MUST be redesigned, not translated:
//  - Validators that read other controls (Validators in arrays of a group).
//    → validateTree + ctx.valueOf / ctx.fieldTreeOf
//  - Validators created per component instance with closures.
//    → keep them pure and move them to schema files for testability
//  - Disabling logic scattered through subscribe handlers.
//    → disabled(path, { when }) declarative rules
//  - FormArray-of-groups built imperatively.
//    → applyEach(arrayPath, itemSchema) on the model shape`,

  migrationWhenNot: `// When migration is NOT worth it:
//  - a legacy form is already stable, tested, and rarely touched
//  - you rely on AbstractControl interop with a third-party CVA ecosystem
//  - the team cannot afford a parallel maintenance window
//
// Pragmatic rule: migrate forms you are actively modifying, especially
// ones with gnarly async/cross-field logic. Leave stable legacy forms alone.
// ` + '`form()`' + ` can also wrap existing FormControls via compat paths,
// so you can migrate one screen at a time.`,

  // ──────────────────────────────────────────── Common mistakes
  mistakeSignalFormInsideComponent: `❌ export class AddressCard {
  readonly form = form(signal({ street: '', city: '' }), ...);
}

// Why it looks reasonable: "every card gets its own form".
// Why it is wrong: two cards = two copies of the data, no shared validation,
// and parent/child cross-field rules become impossible.
// ✅ One model + one form() per logical form, passed down as inputs.
// Rule: form() lives at the top of the form's ownership boundary.`,

  mistakeReadingWrongSignal: `❌ const v = form.name().value;   // a signal, never a value
   if (form.name().value === '') { ... }

// Why it looks reasonable: fields look like plain properties.
// ✅ const v = form.name().value(); // call it — it is a signal
// Rule: state accessors are functions; call them (or read them in a computed).`,

  mistakeRedundantModel: `❌ const value = signal('');
   const dirty = signal(false);
   const errors = signal([]);
   // hand-rolled field tracking next to form()

// Why it looks reasonable: "I need these booleans for the UI".
// ✅ Read them from the field state: form.name().dirty(), .errors(), .value().
// Rule: never duplicate state the FieldTree already owns.`,

  mistakeSubscribeInEffect: `❌ effect(() => {
     this.api.search$(this.query()).subscribe(...);
   });

// Why it looks reasonable: effects are the signal side-effect API.
// Why it is wrong: subscriptions inside effects leak and don't cancel.
// ✅ toSignal(toObservable(query).pipe(switchMap(...)), {initialValue: []})
// Rule: bridge signals↔RxJS at the edge with toObservable/toSignal.`,

  mistakeStoreEveryKeystroke: `❌ store.dispatch(updateField({ value: input.value })) // per keypress

// Why it looks reasonable: "everything in NgRx means one source of truth".
// Why it is wrong: action/reducer/selector churn per character; DevTools
// floods; async hydration races; zero benefit.
// ✅ Keep editing state in Signal Forms; dispatch once on save.
// Rule: the store holds server state; the form holds editing state.`,

  mistakeImmutabilityOfArrays: `❌ this.model.update(m => { m.skills.push(x); return m; });

// Why it looks reasonable: signals are fine with objects.
// Why it is wrong: mutating the existing object can defeat the structural
// sharing and change detection of the array field.
// ✅ this.model.update(m => ({ ...m, skills: [...m.skills, x] }));
// Rule: treat model signals immutably (spread on write).`,

  mistakeBlockingValidation: `❌ required(p.email, { when: (ctx) => ctx.value().length < 1 });
   // … then wondering why an empty optional field is invalid

// Why it looks reasonable: "I'm gating validation".
// ✅ required(p.email) — required already means "non-empty"; use
//    conditional schemas (applyWhen) for truly conditional fields.
// Rule: reach for { when } to conditionally require a field, not to
// re-implement emptiness checks.`,

  mistakeSharedSchemaState: `❌ let cache = new Map(); // module-level mutable state
   schema<User>((p) => validate(p.name, () => { cache.set(...); }));

// Why it looks reasonable: "schemas are just functions".
// Why it is wrong: one schema is cached per form; module state leaks across
// tests and instances.
// ✅ Keep schema logic pure — derive from ctx.value()/ctx.valueOf() only.
// Rule: schemas are declarative and idempotent.`,

  mistakeAsyncValidatorPerKeystroke: `❌ validateAsync(p.username, {
     debounce: 0,
     params: (ctx) => ({ q: ctx.value() }),
     factory: (params) => httpResource(params.request),
   }); // a request on every keystroke

// Why it looks reasonable: async validation is the feature.
// ✅ Add debounce: 300–400 and a when() gate (e.g. length >= 3).
// Rule: async validation without debounce is a server-load bug in disguise.`,

  mistakeIgnoringPending: `❌ <button type="submit" [disabled]="form().invalid()">Save</button>
   // a field is pending (async check) but not invalid → button enabled

// Why it looks reasonable: "disable when invalid".
// ✅ [disabled]="form().submitting() || form().invalid() || form().pending()"
// Rule: respect pending — it is not the same as invalid (or valid).`,

  mistakeErrorDisplay: `❌ @for (err of form.email().errors(); track $index) { {{ err.code }} }

// Why it looks reasonable: "I'll map codes in the UI".
// Why it is wrong: hard-codes presentation against framework error shapes.
// ✅ Show err.message (already localized via validator options), and use
//    err.kind only for styling/customization.
// Rule: messages belong in the schema; the template just renders them.`,

  mistakeHugeTemplate: `❌ // 900-line template with @if chains, business logic in (click)
   // handlers, and validation booleans computed inline

// Why it looks reasonable: "it's just one screen".
// ✅ Extract presentational section components; keep logic in schema + model.
// Rule: if a template exceeds ~300 lines, split it.`,

  // ──────────────────────────────────────────────── Cheat sheet table
  cheatDecision: `Simple form                    → form(model, schema) + [formField]
Complex validation              → validateTree + ctx.valueOf/fieldTreeOf
Dynamic / conditional fields    → applyWhenValue / applyEach / @if branches
Async / debounced validation    → validateAsync / validateHttp (+ debounce)
API-backed create/edit form     → model.set(dto) + submission.action
Large enterprise form           → one form() + presentational sections
Global / server state           → NgRx store feeding the model signal on load
Reusable custom control         → FormValueControl / FormCheckboxControl
Migrating a legacy form         → compat path or rewrite schema per screen`,

  // ──────────────────────────────────────────── Learning path exercises
  exerciseNotes: `// Try it: combine what you have learned.
//   - add a computed() that reacts to form().value()
//   - reset touched state after a successful save
//   - test the schema function in isolation with a plain signal`,

  // ──────────────────────────────────────── Workshop: Employee form
  empModel: `// The form model. The API DTO shape never leaks into these types.
interface Employee {
  id: number | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: Department | '';
  role: Role | '';
  joiningDate: string | null;
  employmentType: EmploymentType | '';
  contractEndDate: string | null;
  compensation: Compensation;
  address: Address;
  skills: Skill[];
  emergencyContact: EmergencyContact;
  active: boolean;
}

const employeeModel = signal<Employee>(emptyEmployee());`,

  empSchema: `// One schema function holds every rule. It is pure and unit-testable.
export function createEmployeeSchema(api: EmployeeApi): SchemaFn<Employee> {
  return (p) => {
    required(p.firstName, { message: 'First name is required.' });
    required(p.email, { message: 'Email is required.' });
    email(p.email, { message: 'Enter a valid email address.' });

    // Async uniqueness — debounced, pending-aware, mapped back to the field.
    validateAsync(p.email, {
      debounce: 500,
      when: (ctx) => ctx.value().length >= 3,
      params: (ctx) => ({ email: ctx.value(), currentId: ctx.valueOf(p.id) }),
      factory: (params) => resource({
        params,
        loader: ({ request }) => api.checkEmailUnique(request.email),
      }),
      onSuccess: (result, ctx) =>
        result.taken
          ? [{
              fieldTree: ctx.fieldTreeOf(p.email),
              kind: 'email-taken',
              message: '"' + result.email + '" is already registered.',
            }]
          : undefined,
    });

    // Conditional rule: end date required only for contractors.
    required(p.contractEndDate, {
      message: 'Contract employees need an end date.',
      when: (ctx) => ctx.valueOf(p.employmentType) === 'CONTRACT',
    });

    // Cross-field rule, error targeted at the offending field.
    validateTree(p, (ctx) => {
      const end = ctx.valueOf(p.contractEndDate);
      const join = ctx.valueOf(p.joiningDate);
      if (ctx.valueOf(p.employmentType) === 'CONTRACT' && join && end && end < join) {
        return {
          fieldTree: ctx.fieldTreeOf(p.contractEndDate),
          kind: 'end-before-join',
          message: 'Contract end date cannot be before the joining date.',
        };
      }
      return undefined;
    });

    // Array items get their own reusable schema.
    applyEach(p.skills, skillSchema);

    required(p.address.state, {
      message: 'Select a state.',
      when: (ctx) => ctx.valueOf(p.address.country) !== '',
    });
  };
}`,

  empFormComponent: `@Component({
  selector: 'app-employee-form',
  imports: [FormRoot, PersonalDetailsSection, SkillsSection, ...],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.css',
})
export class EmployeeFormComponent {
  readonly employeeId = input<number | null>(null);

  protected readonly api = inject(EmployeeApi);
  protected readonly employeeModel = signal<Employee>(emptyEmployee());

  protected readonly employeeForm = form(this.employeeModel, createEmployeeSchema(this.api), {
    name: 'employee',
    submission: {
      action: async () => {
        await this.api.saveEmployee(this.employeeModel());
        return undefined;
      },
      onInvalid: () => {
        // Accessibility: focus the first field with an error.
        const first = this.employeeForm().errorSummary()[0];
        first?.fieldTree()?.focusBoundControl();
      },
    },
  });

  constructor() {
    effect(() => {
      const id = this.employeeId();
      if (id === null) return;
      this.api.loadEmployee(id).then((e) => this.employeeModel.set(e));
    });
  }
}`,

  empFormTemplate: `<form [formRoot]="employeeForm" (submit)="employeeForm().submission()" novalidate>
  <app-personal-details [form]="employeeForm" />
  <app-employment-details [form]="employeeForm" />
  <app-address-section [form]="employeeForm" />
  <app-skills-section [form]="employeeForm" [model]="employeeModel" />
  <app-emergency-contact [form]="employeeForm" />

  <app-form-section title="Actions">
    <app-toggle [formField]="employeeForm.active" label="Employee is active" />
    <div class="form-banner">…server error / saved state…</div>
    <button type="button" class="btn btn--ghost" (click)="resetForm()">Reset</button>
    <button type="submit" class="btn" [disabled]="employeeForm().submitting()">Save</button>
  </app-form-section>
</form>`,

  empTextField: `@Component({
  selector: 'app-text-field',
  template: \`
    <div class="form-control" [class.form-control--invalid]="invalid()">
      <label [for]="fieldId">{{ label() }}</label>
      <input
        [id]="fieldId"
        [type]="type()"
        [value]="value()"
        (input)="value.set($any($event.target).value)"
        (blur)="touch.emit()"
        [attr.required]="required() || undefined"
        [attr.disabled]="disabled() || undefined"
        [attr.aria-invalid]="invalid()"
        [attr.aria-describedby]="describedBy()"
      />
      @for (err of errors(); track $index) {
        <p class="field-error" [id]="errorId">{{ err.message ?? 'Invalid value.' }}</p>
      }
    </div>
  \`,
})
export class AppTextField implements FormValueControl<string> {
  readonly value = model.required<string>();
  readonly label = input.required<string>();
  readonly type = input('text');
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly disabled = input(false);
  readonly required = input(false);
  readonly invalid = input(false);
  readonly touch = output<void>();
}`,

  empSelectField: `export interface SelectOption<TValue extends string> {
  readonly value: TValue;
  readonly label: string;
}

@Component({
  selector: 'app-select-field',
  template: \`
    <div class="form-control" [class.form-control--invalid]="invalid()">
      <label [for]="fieldId">{{ label() }}</label>
      <select
        [id]="fieldId"
        [value]="value()"
        (change)="value.set($any($event.target).value)"
        (blur)="touch.emit()"
        [attr.required]="required() || undefined"
        [attr.aria-invalid]="invalid()"
        [attr.aria-describedby]="describedBy()"
      >
        @for (option of options(); track option.value) {
          <option [value]="option.value">{{ option.label }}</option>
        }
      </select>
      @for (err of errors(); track $index) {
        <p class="field-error" [id]="errorId">{{ err.message ?? 'Invalid value.' }}</p>
      }
    </div>
  \`,
})
export class AppSelectField<TValue extends string = string> implements FormValueControl<TValue> {
  readonly value = model.required<TValue>();
  readonly label = input.required<string>();
  readonly options = input<readonly SelectOption<TValue>[]>([]);
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly disabled = input(false);
  readonly required = input(false);
  readonly invalid = input(false);
  readonly touch = output<void>();
}`,

  empPersonalSection: `@Component({
  selector: 'app-personal-details',
  imports: [AppFormSection, AppTextField],
  template: \`
    <app-form-section title="Personal details">
      <div class="section-grid">
        <app-text-field [formField]="form.firstName" label="First name" />
        <app-text-field [formField]="form.lastName" label="Last name" />
        <app-text-field [formField]="form.email" label="Work email" type="email" />
      </div>
    </app-form-section>
  \`,
})
export class PersonalDetailsSection {
  readonly form = input.required<FieldTree<Employee>>();
}`,

  empSkillsSection: `@Component({
  selector: 'app-skills-section',
  imports: [AppFormSection, AppTextField, AppSelectField],
  template: \`
    <app-form-section title="Skills">
      <div class="skills-list">
        @for (skill of form.skills; track skill().keyInParent()) {
          <div class="skill-row">
            <app-text-field [formField]="skill.name" label="Skill name" />
            <app-select-field [formField]="skill.level" [options]="levelOptions" label="Level" />
            <button type="button" class="btn btn--ghost" (click)="removeSkill($index)">Remove</button>
          </div>
        } @empty {
          <p class="muted">No skills yet — add one below.</p>
        }
      </div>
      <button type="button" class="btn" (click)="addSkill()">+ Add skill</button>
    </app-form-section>
  \`,
})
export class SkillsSection {
  readonly form = input.required<FieldTree<Employee>>();
  readonly model = input.required<WritableSignal<Employee>>();

  protected addSkill(): void {
    this.model().update((m) => ({
      ...m,
      skills: [...m.skills, { id: nextSkillId++, name: '', level: '' }],
    }));
  }

  protected removeSkill(index: number): void {
    this.model().update((m) => ({
      ...m,
      skills: m.skills.filter((_, i) => i !== index),
    }));
  }
}`,
} as const;