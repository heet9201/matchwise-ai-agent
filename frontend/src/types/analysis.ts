export interface AnalysisResult {
  filename: string;
  score: number;
  missing_skills: string[];
  remarks: string;
  email?: string;
  email_type?: "acceptance" | "rejection";
  email_error?: string;
  is_best_match?: boolean;
}
