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
import { CustomerDashboardComponent } from '../Components/customer-dashboard/customer-dashboard';
import { CustomerPortfolio } from '../Components/customer-portfolio/customer-portfolio';
import { PolicyCatalog } from '../Components/policy-catalog/policy-catalog';
import { RegisteredPolicies } from '../Components/registered-policies/registered-policies';
import { PolicyDetailsComponent } from '../Components/policydetails/policydetails';
import { roleGuard } from './guards/auth.guard';


export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full'},
  { path: 'home', component: Home },
  { path: 'auth', component: AuthComponent },
  
  // PROTECTED ADMIN ROUTES
  { 
    path: 'admin/dashboard', 
    component: AdminDashbaord, 
    canActivate: [roleGuard(['admin'])],
    children: [
      { path: 'agents', component: AgentManagement },
      { path: 'enquiries', component: EnquiryManagement },
      { path: 'policies', component: PolicyManagement }
    ]
  },

  // PROTECTED AGENT ROUTES
  { 
    path: 'agent/dashboard', 
    component: AgentDashboard, 
    canActivate: [roleGuard(['agent'])] 
  },
  { 
    path: 'agent/claim/:id', 
    component: AgentClaimDetails, 
    canActivate: [roleGuard(['agent'])] 
  },

  // PROTECTED CUSTOMER ROUTES
  { 
    path: 'customer/dashboard', 
    canActivate: [roleGuard(['customer'])],
    children: [
      { path: '', component: CustomerDashboardComponent }, 
      { path: 'portfolio', component: CustomerPortfolio }, 
      { path: 'catalog', component: PolicyCatalog },
      { path: 'policies', component: RegisteredPolicies },
      { path: 'claims', component: ClaimsComponent },
      { path: 'details/:id', component: PolicyDetailsComponent }
    ] 
  },
  
  { path: '**', redirectTo: '/auth' }
];
