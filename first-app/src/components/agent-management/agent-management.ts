import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Agentservice } from '../../services/agentservice'; 
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-agent-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-management.html',
})
export class AgentManagement implements OnInit {
  private agentService = inject(Agentservice);

  agents$ = new BehaviorSubject<any[]>([]);
  selectedAgent: any = null;
  viewingAgent: any = null;  

  ngOnInit() {
    this.loadAgents();
  }

  loadAgents() {
    this.agentService.getAllAgents().subscribe(data => {
      this.agents$.next(data);
    });
  }
  viewAgent(agent: any) {
    this.viewingAgent = agent;
  }
  editAgent(agent: any) {
    this.selectedAgent = { ...agent };
  }

  saveAgent() {
    if (this.selectedAgent) {
      this.agentService.updateAgent(this.selectedAgent.id, this.selectedAgent)
        .subscribe(() => {
          alert('Agent updated successfully');
          this.selectedAgent = null;
          this.loadAgents();
        });
    }
  }

  deleteAgent(id: string) {
    if (confirm('Are you sure you want to remove this agent?')) {
      this.agentService.deleteAgent(id).subscribe(() => {
        this.loadAgents();
      });
    }
  }
}