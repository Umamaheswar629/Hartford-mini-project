import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '', // Empty path means this is the home page
    loadComponent: () => import('../Components/claims/claims').then(m => m.ClaimsComponent)
  }
];