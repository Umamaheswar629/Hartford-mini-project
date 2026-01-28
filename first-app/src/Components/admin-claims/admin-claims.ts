import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject } from "rxjs";
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

  private claimsSubject = new BehaviorSubject<Claim[]>([]);
  private filteredSubject = new BehaviorSubject<Claim[]>([]);

  claims$ = this.claimsSubject.asObservable();
  filtered$ = this.filteredSubject.asObservable();

  searchText = '';
  sortBy = 'date'; 
  selectedClaimId: string | null = null; // For toggling extra details

  ngOnInit() {
    this.loadClaims(); 
  }

  loadClaims() {
    this.http.get<Claim[]>(`${this.api}/claims`).subscribe({
      next: (data) => {
        this.claimsSubject.next(data);
        this.applyFilters();
      },
      error: (err) => console.error("Claim Load Error:", err)
    });
  }

  applyFilters() {
    const text = this.searchText.toLowerCase();
    const allClaims = this.claimsSubject.value;
    
    let result = allClaims.filter(c => 
      c.type.toLowerCase().includes(text) || 
      c.status.toLowerCase().includes(text) ||
      c.id.toLowerCase().includes(text) ||
      c.policyId.toLowerCase().includes(text)
    );

    result.sort((a: any, b: any) => {
      if (a[this.sortBy] < b[this.sortBy]) return -1;
      if (a[this.sortBy] > b[this.sortBy]) return 1;
      return 0;
    });

    this.filteredSubject.next(result);
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  }

  deleteClaim(id: string) {
    if (confirm('Permanently delete this claim record?')) {
      this.http.delete(`${this.api}/claims/${id}`).subscribe({
        next: () => this.loadClaims(),
        error: (err) => alert('Delete failed: ' + err.message)
      });
    }
  }

  toggleDetails(id: string) {
    this.selectedClaimId = this.selectedClaimId === id ? null : id;
  }
}