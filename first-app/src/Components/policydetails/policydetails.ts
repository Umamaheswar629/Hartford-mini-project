import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { Policy } from "../../models/policy";
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-policy-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './policydetails.html'
})
export class PolicyDetailsComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Reactive State
  private policySubject = new BehaviorSubject<Policy | null>(null);
  policy$ = this.policySubject.asObservable();
  
  age = 0;
  calculatedPremium = 0;
  agree = false;
  loading = false;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchPolicy(id);
      }
    });
  }

  private fetchPolicy(id: string) {
    // Reset state before fetching new one
    this.policySubject.next(null);
    this.calculatedPremium = 0;
    this.agree = false;

    this.http.get<Policy>(`http://localhost:3000/policies/${id}`).subscribe({
      next: (data) => this.policySubject.next(data),
      error: () => {
        alert("Error fetching policy details.");
        this.goBack();
      }
    });
  }

  calculatePremium() {
    const currentPolicy = this.policySubject.value;
    if (!currentPolicy) return;
    this.calculatedPremium = currentPolicy.premium + (this.age * 20);
  }

  goBack() {
    this.router.navigate(['/customer']);
  }

  enrollPolicy() {
    const currentPolicy = this.policySubject.value;
    if (!currentPolicy || !this.agree) {
      alert("Please accept the terms to continue.");
      return;
    }

    const user = this.auth.getUser();
    if (!user) return;

    this.loading = true;

    // Fetch customer record
    this.http.get<any[]>(`http://localhost:3000/customers?userId=${user.id}`)
      .subscribe({
        next: (customers) => {
          if (customers.length === 0) {
            alert("Customer record not found.");
            this.loading = false;
            return;
          }

          const customer = customers[0];

          if (customer.policyIds.includes(currentPolicy.id)) {
            alert("You are already enrolled in this policy.");
            this.loading = false;
            return;
          }

          customer.policyIds.push(currentPolicy.id);

          this.http.put(`http://localhost:3000/customers/${customer.id}`, customer)
            .subscribe({
              next: () => {
                this.loading = false;
                alert(`Successfully enrolled in ${currentPolicy.name}`);
                this.goBack(); 
              },
              error: () => {
                this.loading = false;
                alert("Enrollment failed. Please try again.");
              }
            });
        }
      });
  }
}