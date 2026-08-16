/**
 * Domain model for the Employee Management Form.
 * The API shape stays out of these types — this is the form model.
 */

export type EmploymentType = 'FTE' | 'CONTRACT' | 'INTERN';
export type Department = 'ENGINEERING' | 'DESIGN' | 'PRODUCT' | 'SALES' | 'HR';
export type Role = 'ADMIN' | 'MANAGER' | 'ENGINEER' | 'DESIGNER' | 'HRBP';
export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Address {
  street: string;
  country: string;
  state: string;
  city: string;
}

export interface Skill {
  id: number;
  name: string;
  level: SkillLevel | '';
}

export interface Compensation {
  baseSalary: number | null;
  currency: 'USD' | 'EUR' | 'GBP';
}

export interface Employee {
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

export function emptyEmployee(): Employee {
  return {
    id: null,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    joiningDate: null,
    employmentType: '',
    contractEndDate: null,
    compensation: { baseSalary: null, currency: 'USD' },
    address: { street: '', country: '', state: '', city: '' },
    skills: [],
    emergencyContact: { name: '', relationship: '', phone: '' },
    active: true,
  };
}

export const EMPLOYMENT_TYPE_OPTIONS: readonly EmploymentType[] = ['FTE', 'CONTRACT', 'INTERN'];
export const DEPARTMENT_OPTIONS: readonly Department[] = [
  'ENGINEERING',
  'DESIGN',
  'PRODUCT',
  'SALES',
  'HR',
];
export const ROLE_OPTIONS: readonly Role[] = ['ADMIN', 'MANAGER', 'ENGINEER', 'DESIGNER', 'HRBP'];
export const CURRENCY_OPTIONS: readonly Compensation['currency'][] = ['USD', 'EUR', 'GBP'];
export const SKILL_LEVEL_OPTIONS: readonly SkillLevel[] = [
  'BEGINNER',
  'INTERMEDIATE',
  'EXPERT',
];

/** Static demo data for the dependent country → state → city cascades. */
export const LOCATIONS: ReadonlyMap<string, { states: ReadonlyMap<string, readonly string[]> }> =
  new Map([
    [
      'US',
      {
        states: new Map([
          ['CA', ['San Francisco', 'Los Angeles', 'San Diego']],
          ['NY', ['New York', 'Buffalo', 'Rochester']],
          ['TX', ['Austin', 'Houston', 'Dallas']],
        ]),
      },
    ],
    [
      'DE',
      {
        states: new Map([
          ['BY', ['Munich', 'Nuremberg']],
          ['BE', ['Berlin', 'Potsdam']],
          ['HH', ['Hamburg']],
        ]),
      },
    ],
    [
      'GB',
      {
        states: new Map([
          ['ENG', ['London', 'Manchester', 'Bristol']],
          ['SCT', ['Edinburgh', 'Glasgow']],
        ]),
      },
    ],
  ]);

/** Static demo data for the role → permissions cascade. */
export const ROLE_PERMISSIONS: ReadonlyMap<Role, readonly string[]> = new Map<Role, string[]>([
  ['ADMIN', ['employee:write', 'employee:delete', 'payroll:view', 'settings:manage']],
  ['MANAGER', ['employee:write', 'team:view', 'payroll:view']],
  ['ENGINEER', ['repo:write', 'deploy:prod']],
  ['DESIGNER', ['design:edit', 'prototype:view']],
  ['HRBP', ['employee:read', 'payroll:view', 'policies:write']],
]);