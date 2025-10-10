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

    // Add timeout for production (5 minutes)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 min timeout

    try {
      const response = await fetch(`${API_URL}/api/resumes/analyze-stream`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to start resume analysis: ${response.status} ${errorText}`
        );
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("Response body is not readable");
      }

      let buffer = ""; // Buffer to accumulate incomplete chunks
      let messageCount = 0;

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            // Process any remaining data in buffer
            if (buffer.trim()) {
              console.warn(
                "Unprocessed buffer on stream end:",
                buffer.substring(0, 100)
              );
            }
            console.log(
              `Stream completed. Total messages processed: ${messageCount}`
            );
            break;
          }

          // Decode chunk and add to buffer
          buffer += decoder.decode(value, { stream: true });

          // Split by double newline (SSE message separator) to get complete messages
          const messages = buffer.split("\n\n");

          // Keep the last incomplete message in buffer
          buffer = messages.pop() || "";

          // Process complete messages
          for (const message of messages) {
            if (!message.trim()) continue;

            const lines = message.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.substring(6).trim();

                if (!data) continue;

                try {
                  const update: ProgressUpdate = JSON.parse(data);
                  messageCount++;
                  console.log(
                    `Message #${messageCount}: type=${update.type}, status=${update.status}, filename=${update.filename}`
                  );
                  onProgress(update);
                } catch (e) {
                  console.error("Error parsing SSE data:", e);
                  console.error("Problematic data:", data.substring(0, 200));
                  // Don't throw, continue processing other messages
                }
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
        clearTimeout(timeoutId);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error(
            "Request timeout: Analysis is taking too long. Please try with fewer resumes."
          );
        }
        throw error;
      }
      throw new Error("Unknown error occurred during streaming");
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
