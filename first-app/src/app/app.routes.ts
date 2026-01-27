import { Routes } from '@angular/router';
import { AdminDashboardComponent } from '../Components/admin-dashboard/admin-dashboard';
import { CustomerDashboardComponent } from '../Components/customer-dashboard/customer-dashboard';
import { LoginComponent } from '../Components/login/login';
import { PolicyDetailsComponent } from '../Components/policydetails/policydetails';
import { CustomerPortfolio } from '../Components/customer-portfolio/customer-portfolio';
import { PolicyCatalog } from '../Components/policy-catalog/policy-catalog';
import { RegisteredPolicies } from '../Components/registered-policies/registered-policies';

export const routes: Routes = [
  // Root Redirect
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminDashboardComponent },

  { 
    path: 'customer', 
    children: [
      { path: '', component: CustomerDashboardComponent }, 
      { path: 'portfolio', component: CustomerPortfolio }, 
      { path: 'catalog', component: PolicyCatalog }, 
      { path: 'policies', component: RegisteredPolicies },
      { path: 'details/:id', component: PolicyDetailsComponent }
    ] 
  },

  // Wildcard Fallback
  { path: '**', redirectTo: 'login' }
];