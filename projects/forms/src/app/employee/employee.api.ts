import { Injectable } from '@angular/core';
import type { Employee } from './employee.model';
import { emptyEmployee } from './employee.model';

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Mock backend for the Employee form.
 *
 * In a real application each method would call HttpClient/httpResource against
 * a REST endpoint. Kept local so the tutorial runs without a server — the
 * shape (async methods + latency) matches a real API exactly.
 */
@Injectable({ providedIn: 'root' })
export class EmployeeApi {
  private static readonly RESERVED_EMAILS = new Set(['ada@example.com', 'admin@example.com']);
  private static lastId = 0;

  /** GET /api/employees/:id */
  async loadEmployee(id: number): Promise<Employee> {
    await delay(500);
    return { ...emptyEmployee(), id, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' };
  }

  /** POST /api/employees  or  PUT /api/employees/:id */
  async saveEmployee(employee: Employee): Promise<{ ok: true; id: number }> {
    await delay(700);
    if (EmployeeApi.RESERVED_EMAILS.has(employee.email.toLowerCase())) {
      throw new Error('email-taken');
    }
    return { ok: true, id: employee.id ?? ++EmployeeApi.lastId };
  }

  /** GET /api/employees/check-email?email=… */
  async checkEmailUnique(email: string): Promise<{ taken: boolean }> {
    await delay(500);
    return { taken: EmployeeApi.RESERVED_EMAILS.has(email.toLowerCase()) };
  }
}

export function cloneSeed(): Employee {
  return { ...emptyEmployee(), id: 7, firstName: 'Ada', lastName: 'Lovelace' };
}