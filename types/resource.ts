import { StatKey } from './game';

// --- Resource Library Types ---
export interface PolicyDocument {
  id: string;
  title: string;
  content: string;
  source: string;
  uploadDate: string;
  tags: string[];
  fileUrl?: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  description: string;
  location: string;
  category: StatKey;
  content: string;
  uploadDate: string;
  author?: string;
  status: 'pending' | 'approved' | 'rejected';
  tags: string[];
}

export interface ResourceLibrary {
  policies: PolicyDocument[];
  cases: CaseStudy[];
}


