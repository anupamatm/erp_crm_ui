import { Customer } from './Customer';
import { Product } from './Product';
import { User } from './User';

export interface OpportunityProduct {
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface Competitor {
  name: string;
  strengths: string[];
  weaknesses: string[];
}

export interface Activity {
  type: 'call' | 'meeting' | 'email' | 'note';
  description: string;
  date: Date;
  outcome?: string;
  performedBy: User;
}

export interface Opportunity {
  _id?: string;
  title: string;
  customer: Customer;
  stage: 'prospecting' | 'qualification' | 'needs-analysis' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  value: number;
  probability: number;
  expectedCloseDate: Date;
  products: OpportunityProduct[];
  source: 'website' | 'referral' | 'cold-call' | 'trade-show' | 'social-media' | 'email-campaign' | 'other';
  description?: string;
  nextAction: 'follow-up' | 'meeting' | 'proposal' | 'presentation' | 'contract' | 'none';
  nextActionDate?: Date;
  competitors?: Competitor[];
  lostReason?: 'price' | 'features' | 'timing' | 'competition' | 'no-budget' | 'no-decision' | 'other';
  activities: Activity[];
  assignedTo: User;
  createdBy: User;
  updatedBy?: User;
  createdAt: string;
  updatedAt: string;
  weightedValue?: number;
}