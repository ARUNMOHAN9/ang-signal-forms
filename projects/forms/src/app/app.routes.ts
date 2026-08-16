import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tutorial/signal-forms',
    loadComponent: () =>
      import('./tutorial/signal-forms.component').then((m) => m.SignalFormsComponent),
  },
  { path: '', redirectTo: 'tutorial/signal-forms', pathMatch: 'full' },
  { path: '**', redirectTo: 'tutorial/signal-forms' },
];