// Assessment Types
export interface AssessmentQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'scale' | 'text';
  options?: string[];
  weight: number;
  category: 'security_awareness' | 'compliance_needs' | 'technical_readiness' | 'budget';
}

export interface AssessmentResponse {
  questionId: string;
  answer: string | number;
  timestamp: Date;
}

export interface AssessmentResult {
  leadId: string;
  score: number;
  readinessLevel: 'nurture' | 'co_creator_qualified' | 'priority';
  recommendations: string[];
  vulnerabilities: string[];
  nextSteps: string[];
}

// Lead Types
export interface LeadData {
  email: string;
  name: string;
  company?: string;
  role?: string;
  phone?: string;
}

// Co-Creator Program
export interface CoCreatorStatus {
  seatsRemaining: number;
  totalSeats: number;
  urgencyLevel: 'high' | 'medium' | 'low';
}
