import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

export interface APIResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface JobDescription {
  job_description: string;
}

export interface AnalysisResult {
  filename: string;
  score: number;
  missing_skills: string[];
  remarks: string;
  email: string;
  is_best_match?: boolean;
}

export interface ProgressUpdate {
  type: "progress" | "complete" | "error" | "email_generation";
  current?: number;
  total?: number;
  filename?: string;
  status?:
    | "processing"
    | "analyzing"
    | "analyzed"
    | "generating_email"
    | "complete"
    | "error"
    | "started";
  percentage?: number;
  result?: AnalysisResult;
  results?: AnalysisResult[];
  error?: string;
}

export const apiService = {
  generateJobDescription: async (
    formData: FormData
  ): Promise<APIResponse<JobDescription>> => {
    try {
      const response = await api.post(
        "/api/job-description/generate",
        formData
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.detail || "Failed to generate job description"
        );
      }
      throw error;
    }
  },

  uploadJobDescriptionFile: async (
    file: File
  ): Promise<APIResponse<JobDescription>> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/api/job-description/file", formData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.detail ||
            "Failed to process job description file"
        );
      }
      throw error;
    }
  },

  analyzeResumesStream: async (
    formData: FormData,
    onProgress: (update: ProgressUpdate) => void
  ): Promise<void> => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const response = await fetch(`${API_URL}/api/resumes/analyze-stream`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to start resume analysis");
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("Response body is not readable");
    }

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.substring(6);
            try {
              const update: ProgressUpdate = JSON.parse(data);
              onProgress(update);
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },

  analyzeResumes: async (
    formData: FormData
  ): Promise<APIResponse<{ results: AnalysisResult[] }>> => {
    try {
      const response = await api.post("/api/resumes/analyze", formData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.detail || "Failed to analyze resumes"
        );
      }
      throw error;
    }
  },
};
