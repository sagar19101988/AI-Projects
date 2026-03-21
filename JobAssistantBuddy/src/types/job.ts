// src/types/job.ts
export interface Job {
  id: string;
  company: string;
  role: string;
  linkedinUrl?: string;
  resumeUsed?: string[];
  appliedDate: Date;
  salaryRange?: string;
  notes?: string;
  status:
    | "Wishlist"
    | "Applied"
    | "Follow-up"
    | "Interview"
    | "Offer"
    | "Rejected";
  tags?: string[];
  priority: 1 | 2 | 3 | 4 | 5;
  followUpDate?: Date;      // when follow-up was sent
  interviewDate?: Date;     // scheduled interview date/time
  offerDeadline?: Date;     // offer decision deadline
  rejectedDate?: Date;      // date rejection was received
  rejectionStage?: 'Resume' | 'Interview' | 'Offer';
  createdAt: Date;
  updatedAt: Date;
}
