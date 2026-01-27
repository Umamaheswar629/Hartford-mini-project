import { Routes } from '@angular/router';
import { Login } from '../Components/auth/login/login';
import { AgentDashboard } from '../Components/agent-dashboard/agent-dashboard';
import { AgentClaimDetails } from '../Components/agent-claim-details/agent-claim-details';
import { AdminDashbaord } from '../Components/admin-dashbaord/admin-dashbaord';
import { AgentManagement } from '../Components/agent-management/agent-management';
import { Home } from '../Components/home/home';
import { EnquiryManagement } from '../Components/enquiry-management/enquiry-management';

export const routes: Routes = [
  { path: '', component:Home},
  { path: 'login', component: Login },
  { path: 'agent/dashboard', component: AgentDashboard },
  { path: 'agent/claim/:id', component: AgentClaimDetails },
  { 
    path: 'admin/dashboard', 
    component: AdminDashbaord, 
    children: [
      { path: 'agents', component: AgentManagement },
      { path: 'enquiries', component: EnquiryManagement }
    ]
  }
];
