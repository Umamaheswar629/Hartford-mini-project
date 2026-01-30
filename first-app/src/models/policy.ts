export interface Policy {
  id: string;
  name: string;
  type: 'health' | 'life' | 'vehicle' | 'home'; // Specific types based on insurance
  premium: number;
  coverage: number;
  duration: number;
  description: string;
  features: string[];
  createdAt: string;
}