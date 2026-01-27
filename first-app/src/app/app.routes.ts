import { Routes } from '@angular/router';
import { AdminDashboardComponent } from '../Components/admin-dashboard/admin-dashboard';
import { CustomerDashboardComponent } from '../Components/customer-dashboard/customer-dashboard';
import { LoginComponent } from '../Components/login/login';
import { PolicyDetailsComponent } from '../Components/policydetails/policydetails';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'customer', component: CustomerDashboardComponent },
  { path: 'policydetails/:id', component: PolicyDetailsComponent },
  { path: '**', redirectTo: 'login' }
  
];
