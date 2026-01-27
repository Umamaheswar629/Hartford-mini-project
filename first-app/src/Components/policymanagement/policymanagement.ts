import { Component, Input, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, map } from "rxjs";
import { Policy } from "../../models/policy";
import { PolicyForm } from "../policyform/policyform";
import { AuthService } from "../../services/auth";

@Component({
  selector: 'app-policy-management',
  standalone: true,
  imports: [CommonModule, FormsModule, PolicyForm],
  templateUrl: './policymanagement.html'
})
export class PolicyManagement implements OnInit {
  @Input() mode: 'admin' | 'customer' = 'admin';

  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private readonly api = 'http://localhost:3000';

  // State Management using BehaviorSubjects
  private policiesSubject = new BehaviorSubject<Policy[]>([]);
  private filteredSubject = new BehaviorSubject<Policy[]>([]);

  // Public Observables for the template (use with | async pipe)
  policies$ = this.policiesSubject.asObservable();
  filtered$ = this.filteredSubject.asObservable();

  searchText = '';
  sortBy = 'name'; 
  view: 'LIST' | 'FORM' | 'DETAIL' = 'LIST';
  selectedPolicy?: Policy;

  ngOnInit() {
    this.loadPolicies(); 
  }

  loadPolicies() {
    this.http.get<Policy[]>(`${this.api}/policies`).subscribe({
      next: (data) => {
        this.policiesSubject.next(data);
        this.applyFilters(); // Initial filter/sort
      },
      error: (err) => console.error("Data Load Error:", err)
    });
  }

  applyFilters() {
    const text = this.searchText.toLowerCase();
    const allPolicies = this.policiesSubject.value;
    
    let result = allPolicies.filter(p => 
      p.name.toLowerCase().includes(text) || 
      p.type.toLowerCase().includes(text)
    );

    // Sorting logic
    result.sort((a: any, b: any) => {
      if (a[this.sortBy] < b[this.sortBy]) return -1;
      if (a[this.sortBy] > b[this.sortBy]) return 1;
      return 0;
    });

    // Update the stream
    this.filteredSubject.next(result);
  }

  // Calculated stats using RxJS map
  get totalCount$() {
    return this.policies$.pipe(map(list => list.length));
  }

  openAdd() {
    this.selectedPolicy = undefined;
    this.view = 'FORM';
  }

  openEdit(p: Policy) {
    this.selectedPolicy = { ...p }; 
    this.view = 'FORM';
  }

  deletePolicy(id: string) {
    if (confirm('Permanently delete this policy?')) {
      this.http.delete(`${this.api}/policies/${id}`).subscribe({
        next: () => {
          alert('Policy deleted!');
          this.loadPolicies(); 
        },
        error: (err) => alert('Delete failed: ' + err.message)
      });
    }
  }

  onSaved() {
    this.view = 'LIST';
    this.loadPolicies();
  }
}