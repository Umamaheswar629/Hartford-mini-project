import { User } from './user';
import { Policy } from './policy';
import { Customer } from './customer';
import { Claim } from './claim';
import { Agent } from './agent';

export interface InsuranceData {
  users: User[];
  policies: Policy[];
  customers: Customer[];
  claims: Claim[];
  agents: Agent[];
}