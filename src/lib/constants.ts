import { IncidentCategory, IncidentSeverity, IncidentStatus } from './supabase';

export const CATEGORIES: IncidentCategory[] = [
  'POS Issue',
  'Delivery Delay',
  'Inventory',
  'Kitchen Equipment',
  'Customer Complaint',
  'Other',
];

export const SEVERITIES: IncidentSeverity[] = ['Low', 'Medium', 'High', 'Critical'];

export const STATUSES: IncidentStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed'];

export const SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  Low: 'bg-green-100 text-green-800 border-green-200',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  High: 'bg-orange-100 text-orange-800 border-orange-200',
  Critical: 'bg-red-100 text-red-800 border-red-200',
};

export const STATUS_COLORS: Record<IncidentStatus, string> = {
  Open: 'bg-blue-100 text-blue-800 border-blue-200',
  'In Progress': 'bg-purple-100 text-purple-800 border-purple-200',
  Resolved: 'bg-green-100 text-green-800 border-green-200',
  Closed: 'bg-gray-100 text-gray-800 border-gray-200',
};
