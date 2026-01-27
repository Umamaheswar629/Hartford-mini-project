import { Routes } from '@angular/router';
import { AdminDashboardComponent } from '../Components/admin-dashboard/admin-dashboard';
// Adjust the import to match the actual export from the module
import { CustomerDashboardComponent } from '../Components/customer-dashboard/customer-dashboard';
import { LoginComponent } from '../Components/login/login';
import { PolicyDetailsComponent } from '../Components/policydetails/policydetails';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'customer', component: CustomerDashboardComponent },
  { path: 'policydetails/:id', component: PolicyDetailsComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
