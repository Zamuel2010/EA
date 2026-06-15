export type UserRole = 'student' | 'staff' | null;

export interface SubjectScore {
  ca: number;
  exam: number;
  total: number;
  grade: string;
}

export interface TermResult {
  term: string;
  attendance: { present: number; total: number };
  personality: {
    discipline: string;
    punctuality: string;
    application: string;
    conduct: string;
    leadership: string;
    cleanliness: string;
  };
  remarks: string;
  subjects: Record<string, SubjectScore>;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  current_class: string;
  ca_score: number;
  exam_score: number;
  total_score: number;
  results?: Record<string, TermResult>;
  createdAt: any;
  updatedAt: any;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  assigned_class: string;
  createdAt: any;
  updatedAt: any;
}

export interface Resource {
  id: string;
  staffId: string;
  class_name: string;
  title: string;
  type: 'pdf' | 'video';
  url: string;
  createdAt: any;
  updatedAt: any;
}
