import type { Readiness } from './intelligence';

export type ApplicationStatus =
  | 'discovered'
  | 'preparing'
  | 'ready'
  | 'submitted'
  | 'under_review'
  | 'additional_information_required'
  | 'approved'
  | 'rejected'
  | 'completed';

export interface ApplicationEvent {
  oldStatus: string | null;
  newStatus: string;
  source: string;
  note: string | null;
  at: string;
}

export interface Application {
  id: string;
  serviceId: string;
  status: ApplicationStatus;
  notes: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationDetail extends Application {
  readiness: Readiness | null;
  timeline: ApplicationEvent[];
}
