export interface Customer {
  id: string;
  userId: string; // Changed from number to string
  policyIds: string[];
  nominee: string;
  address: string;
  dateOfBirth: string;
  aadharNumber: string;
  panNumber: string;
  kycStatus?: string;
}