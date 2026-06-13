import { createClient } from '@supabase/supabase-js';

export type IncidentCategory =
  | 'POS Issue'
  | 'Delivery Delay'
  | 'Inventory'
  | 'Kitchen Equipment'
  | 'Customer Complaint'
  | 'Other';

export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export type IncidentStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  store_location: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reported_by?: string;
  ai_summary?: string;
  created_at: string;
  updated_at: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
