// src/utils/dummyData.ts
import type { Job } from '../types/job';

export const SEEDED_JOBS: Job[] = [
  {
    id: "1",
    company: "Google",
    role: "Senior Frontend Engineer",
    linkedinUrl: "https://linkedin.com",
    appliedDate: new Date("2025-01-10"),
    status: "Interview",
    priority: 5,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "2",
    company: "Stripe",
    role: "Staff Software Engineer",
    appliedDate: new Date("2025-01-12"),
    status: "Applied",
    priority: 4,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "3",
    company: "Acme Corp",
    role: "Fullstack Dev",
    appliedDate: new Date("2024-12-01"),
    status: "Rejected",
    priority: 2,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "4",
    company: "OpenAI",
    role: "Frontend Architect",
    appliedDate: new Date("2025-02-01"),
    status: "Wishlist",
    priority: 5,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
