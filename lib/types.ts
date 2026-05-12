export type Role = 'MANAGER' | 'STAFF' | 'RESIDENT';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
}

export type RequestStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface MaintenanceRequest {
  id: number;
  title: string;
  description: string;
  status: RequestStatus;
  created_by: User;
  assigned_to: User | null;
  created_at: string;
  updated_at: string;
}

/** DRF's paginated list response. */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}