import { Routes } from '@angular/router';
import { Login } from '../components/auth/login/login';
import { AgentDashboard } from '../components/agent-dashboard/agent-dashboard';
import { AgentClaimDetails } from '../components/agent-claim-details/agent-claim-details';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'agent/dashboard', component: AgentDashboard },
  { path: 'agent/claim/:id', component: AgentClaimDetails }
];
