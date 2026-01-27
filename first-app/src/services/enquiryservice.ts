import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Enquiryservice {
  private API = 'http://localhost:3000/enquiries';
  private http = inject(HttpClient);

  postEnquiry(data: any) {
    const payload = { 
      ...data, 
      status: 'new', 
      assignedAgentId: null,
      createdAt: new Date().toISOString() 
    };
    return this.http.post(this.API, payload);
  }

  getAllEnquiries() {
    return this.http.get<any[]>(this.API);
  }

  assignToAgent(enquiryId: string, agentId: string) {
    return this.http.patch(`${this.API}/${enquiryId}`, { 
      assignedAgentId: agentId,
      status: 'assigned' 
    });
  }

  getEnquiriesByAgent(agentId: string) {
    return this.http.get<any[]>(`${this.API}?assignedAgentId=${agentId}`);
  }
  resolveEnquiry(id: string, resolutionMessage: string) {
  return this.http.patch(`${this.API}/${id}`, {
    status: 'resolved',
    resolution: resolutionMessage
  });
  }
}

