export interface Agent {
  id: string;
  userId: string; // Changed from number to string
  licenseNumber: string;
  commissionRate: number;
  assignedCustomers: string[];
  totalPoliciesSold: number;
  status: string;
}