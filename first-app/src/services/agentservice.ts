import { Injectable,inject} from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Agentservice {
  private API = 'http://localhost:3000';
  private http = inject(HttpClient);

  getAgentByUserId(userId: number) {
    return this.http.get<any[]>(`${this.API}/agents?userId=${userId}`);
  }
  getClaimsByAgent(agentId: string) {
  return this.http.get<any[]>(`${this.API}/claims?assignedAgentId=${agentId}`);
  }
  getUserById(userId: number) {
    return this.http.get<any>(`${this.API}/users/${userId}`);
  }
  getClaimById(claimId: string) {
    return this.http.get<any>(`${this.API}/claims/${claimId}`);
  }
  getClaimsByCustomer(customerId: string) {
    return this.http.get<any[]>(`${this.API}/claims?customerId=${customerId}`);
  }
  getCustomerById(customerId: string) {
    return this.http.get<any>(`${this.API}/customers/${customerId}`);
  }
  getPolicyById(policyId: string) {
    return this.http.get<any>(`${this.API}/policies/${policyId}`);
  }
  updateClaimStatus(claimId: string, status: string, remarks: string) {
    return this.http.patch(`${this.API}/claims/${claimId}`, {status,remarks});
  }
}
