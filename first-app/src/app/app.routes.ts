import { Routes } from '@angular/router';
import { AuthComponent } from '../../src/Components/authen/authen';
import { AdminDashboardComponent } from '../../src/Components/admin-dashboard/admin-dashboard'
import { AgentDashboardComponent } from '../../src/Components/agent-dashboard/agent-dashboard'
import { CustomerDashboardComponent } from '../../src/Components/customer-dashboard/customer-dashboard'

export const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent },
  { path: 'agent/dashboard', component: AgentDashboardComponent },
  { path: 'customer/dashboard', component: CustomerDashboardComponent },
  { path: '**', redirectTo: '/auth' }
];