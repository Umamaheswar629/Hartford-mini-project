import { Component, OnInit, inject } from '@angular/core';
import { Enquiryservice } from '../../services/enquiryservice';
import { Agentservice } from '../../services/agentservice';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-enquiry-management',
  imports:[AsyncPipe],
  templateUrl: './enquiry-management.html'
})
export class EnquiryManagement implements OnInit {
  private enquiryService = inject(Enquiryservice);
  private agentService = inject(Agentservice);

  enquiries$ = new BehaviorSubject<any[]>([]);
  agents: any[] = [];

  ngOnInit() {
    forkJoin({
      enquiries: this.enquiryService.getAllEnquiries(),
      agents: this.agentService.getAllAgents()
    }).subscribe(({ enquiries, agents }) => {
      this.enquiries$.next(enquiries);
      this.agents = agents;
    });
  }

  assignAgent(enquiryId: string, event: Event) {
    const agentId = (event.target as HTMLSelectElement).value;
    if (!agentId) return;

    this.enquiryService.assignToAgent(enquiryId, agentId).subscribe(() => {
      alert('Lead assigned to agent successfully');
      this.loadEnquiries(); 
    });
  }

  loadEnquiries() {
    this.enquiryService.getAllEnquiries().subscribe(data => this.enquiries$.next(data));
  }
}