import { Component, OnInit, OnDestroy, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, forkJoin, map, switchMap, of, Observable, combineLatest, interval, startWith } from "rxjs";
import { Claim } from "../../models/claim";


@Component({
  selector: 'app-admin-claim',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-claims.html'
})
export class AdminClaim implements OnInit {
  private http = inject(HttpClient);
  private readonly api = 'http://localhost:3000';
  searchText: string = '';
  sortBy: string = 'date';
  // State Management using BehaviorSubjects
private refreshSubject = new BehaviorSubject<void>(undefined);
  private searchSubject = new BehaviorSubject<string>('');
  private sortSubject = new BehaviorSubject<string>('date');

  // Load Agents as an Observable (Calculated once)
  agents$: Observable<any[]> = forkJoin({
    agents: this.http.get<any[]>(`${this.api}/agents`),
    users: this.http.get<any[]>(`${this.api}/users`)
  }).pipe(
    map(data => data.agents.map(agent => {
      const user = data.users.find(u => u.id === agent.userId);
      return {
        agentId: agent.id,
        name: user ? `${user.firstName} ${user.lastName}` : 'Unknown Agent'
      };
    }))
  );

  filteredClaims$: Observable<Claim[]> = combineLatest([
    this.refreshSubject.pipe(
      switchMap(() => interval(10000).pipe(startWith(0))), // Auto-poll every 10s
      switchMap(() => this.http.get<Claim[]>(`${this.api}/claims`))
    ),
    this.searchSubject,
    this.sortSubject
  ]).pipe(
    map(([claims, search, sort]) => {
      const filtered = claims.filter(c => 
        c.type.toLowerCase().includes(search.toLowerCase()) || 
        c.status.toLowerCase().includes(search.toLowerCase()) ||
        c.id?.toLowerCase().includes(search.toLowerCase()) ||
        c.policyId?.toLowerCase().includes(search.toLowerCase())
      );

      return filtered.sort((a: any, b: any) => {
        if (a[sort] < b[sort]) return -1;
        if (a[sort] > b[sort]) return 1;
        return 0;
      });
    })
  );

  selectedClaimId: string | null = null;

  ngOnInit() {
    // No .subscribe() needed here! The Async pipe in HTML handles it.
  }

  // Update Subjects instead of calling methods directly
  onSearch(value: string) {
    this.searchSubject.next(value);
  }

  onSort(value: string) {
    this.sortSubject.next(value);
  }

  assignAgent(claim: any, agentId: string) {
    if (!agentId || agentId === 'null' || !claim.customerId) return;

    const updateClaim$ = this.http.patch(`${this.api}/claims/${claim.id}`, { 
      assignedAgentId: agentId 
    });

    const updateAgent$ = this.http.get<any>(`${this.api}/agents/${agentId}`).pipe(
      switchMap(agent => {
        const currentCustomers = (agent.assignedCustomers || []).filter((id: any) => id != null);
        if (!currentCustomers.includes(claim.customerId)) {
          const updatedCustomers = [...currentCustomers, claim.customerId];
          return this.http.patch(`${this.api}/agents/${agentId}`, { assignedCustomers: updatedCustomers });
        }
        return of(agent);
      })
    );

    // We only subscribe once for the "Action", then trigger the refresh stream
    forkJoin([updateClaim$, updateAgent$]).subscribe({
      next: () => {
        alert(`Claim assigned successfully!`);
        this.refreshSubject.next(); // Trigger the main stream to reload
      }
    });
  }

  deleteClaim(id: string) {
    if (confirm('Permanently delete this claim?')) {
      this.http.delete(`${this.api}/claims/${id}`).subscribe(() => {
        this.refreshSubject.next(); // Trigger the main stream to reload
      });
    }
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  }

  toggleDetails(id: string) {
    this.selectedClaimId = this.selectedClaimId === id ? null : id;
  }
}