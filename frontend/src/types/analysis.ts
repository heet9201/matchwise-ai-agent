export interface AnalysisResult {
  filename: string;
  score: number;
  missing_skills: string[];
  remarks: string;
  is_best_match: boolean;
  email?: string;
  email_type?: "acceptance" | "rejection";
  email_error?: string;
}
