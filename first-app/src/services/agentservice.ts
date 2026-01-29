import { Injectable,inject} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';
import { Customer } from '../models/customer';
@Injectable({
  providedIn: 'root'
})
export class Agentservice {
  private API = 'http://localhost:3000';
  private http = inject(HttpClient);

  getAgentByUserId(userId: string) {
    return this.http.get<any[]>(`${this.API}/agents?userId=${userId}`);
  }
  getClaimsByAgent(agentId: string) {
  return this.http.get<any[]>(`${this.API}/claims?assignedAgentId=${agentId}`);
  }
// GET a single user by string ID
getUserById(id: string) { 
  return this.http.get<User>(`${this.API}/users/${id}`);
}


  getClaimById(claimId: string) {
    return this.http.get<any>(`${this.API}/claims/${claimId}`);
  }
  getClaimsByCustomer(customerId: string) {
    return this.http.get<any[]>(`${this.API}/claims?customerId=${customerId}`);
  }
// GET a single customer by string ID
getCustomerById(id: string) {
  return this.http.get<Customer>(`${this.API}/customers/${id}`);
}
  getPolicyById(policyId: string) {
    return this.http.get<any>(`${this.API}/policies/${policyId}`);
  }
  updateClaimStatus(claimId: string, status: string, remarks: string) {
    return this.http.patch(`${this.API}/claims/${claimId}`, {status,remarks});
  }
  getAllAgents() {
    return this.http.get<any[]>(`${this.API}/agents`);
  }

  updateAgent(agentId: string, agentData: any) {
    return this.http.put(`${this.API}/agents/${agentId}`, agentData);
  }

  deleteAgent(agentId: string) {
    return this.http.delete(`${this.API}/agents/${agentId}`);
  }
  getEnquiries() {
    return this.http.get<any[]>(`${this.API}/enquiries`);
  }

  deleteEnquiry(id: string) {
    return this.http.delete(`${this.API}/enquiries/${id}`);
  }
}
