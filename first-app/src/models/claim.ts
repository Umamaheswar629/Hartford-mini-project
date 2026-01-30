export interface Claim {
  id: string;
  policyId: string;
  customerId: string;
  type: string;
  amount: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  description: string;
  documents?: { [key: string]: string };
  remarks?: string,
  assignedAgentId?: string;
}