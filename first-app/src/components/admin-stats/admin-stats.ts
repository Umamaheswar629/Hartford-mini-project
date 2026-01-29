import { Component, inject, OnInit } from '@angular/core';
import { ClaimService } from '../../services/claim-service';
import { Agentservice } from '../../services/agentservice';
import { map, Observable,combineLatest } from 'rxjs';
import { AsyncPipe, CommonModule, DecimalPipe, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [AsyncPipe, CommonModule],
  templateUrl: './admin-stats.html',
  styleUrl: './admin-stats.css',
})
export class AdminStats implements OnInit {
  private claimService = inject(ClaimService);
  private agentService = inject(Agentservice);
  private http=inject(HttpClient);

  agents: any = [];

  stats$: Observable<any> = this.claimService.claims$.pipe(
    map(claims => {
      const total = claims.length || 0;
      const approved = claims.filter(c => c.status === 'approved').length;
      const rejected = claims.filter(c => c.status === 'rejected').length;
      const pending = claims.filter(c => c.status === 'pending').length;
      
      const totalApprovedAmount = claims
        .filter(c => c.status === 'approved')
        .reduce((acc, c) => acc + (Number(c.amount) || 0), 0);

      // Calculating percentages for the chart
      const appPct = total > 0 ? (approved / total) * 100 : 0;
      const rejPct = total > 0 ? (rejected / total) * 100 : 0;
      const penPct = total > 0 ? (pending / total) * 100 : 0;

      return {
        totalClaims: total,
        unassigned: claims.filter(c => !c.assignedAgentId).length,
        totalApproved: totalApprovedAmount,
        approvedPct: Math.round(appPct),
        rejectedPct: Math.round(rejPct),
        pendingPct: Math.round(penPct),
        // CSS Conic Gradient string for the Pie Chart
        chartGradient: `conic-gradient(#22c55e ${appPct}%, #ef4444 ${appPct}% ${appPct + rejPct}%, #f59e0b ${appPct + rejPct}% 100%)`
      };
    })
  );
  // Inside AdminStats class
revenueStats$: Observable<any> = combineLatest([
  this.claimService.claims$,
  this.http.get<any[]>('http://localhost:3000/customers'),
  this.http.get<any[]>('http://localhost:3000/policies')
]).pipe(
  map(([claims, customers, policies]) => {
    let grossRevenue = 0;
    const revenueByType: { [key: string]: number } = { health: 0, life: 0, vehicle: 0 };

    customers.forEach(cust => {
      cust.policyIds.forEach((pId: string) => {
        const policy = policies.find(p => p.id === pId);
        if (policy) {
          grossRevenue += policy.premium;
          revenueByType[policy.type] += policy.premium;
        }
      });
    });

    // 2. Calculate Payouts
    const totalPayouts = claims
      .filter(c => c.status === 'approved')
      .reduce((acc, c) => acc + (Number(c.amount) || 0), 0);

    return {
      gross: grossRevenue,
      payouts: totalPayouts,
      net: grossRevenue - totalPayouts,
      byType: revenueByType
    };
  })
);

  ngOnInit() {
    this.agentService.getAllAgents().subscribe((data) => {
      this.agents = data;
    });
    this.claimService.refreshClaims();
  }
}