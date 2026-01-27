import { Routes } from '@angular/router';
import { AuthComponent } from '../../src/Components/authen/authen';
import { AdminDashbaord } from '../Components/admin-dashbaord/admin-dashbaord';
import { ClaimsComponent } from '../Components/claims/claims';
import { AgentClaimDetails } from '../Components/agent-claim-details/agent-claim-details';
import { AgentDashboard } from '../Components/agent-dashboard/agent-dashboard';
import { AgentManagement } from '../Components/agent-management/agent-management';
import { EnquiryManagement } from '../Components/enquiry-management/enquiry-management';
import { PolicyManagement } from '../Components/policymanagement/policymanagement';
import { Home } from '../Components/home/home';
 
export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full'},
  {path:'home', component:Home},
  { path: 'auth', component: AuthComponent },
  { path: 'admin/dashboard', component: AdminDashbaord, children:[
    {path:'agents', component: AgentManagement},
    {path:'enquiries', component:EnquiryManagement},
    {path:'policies',component:PolicyManagement},
  ]},
  { path: 'agent/claim/:id', component: AgentClaimDetails },
  // {path:'claims', component:ClaimsComponent},
  { path: 'agent/dashboard', component: AgentDashboard},
  { path: 'customer/dashboard', component: ClaimsComponent },
  { path: '**', redirectTo: '/auth' }
];