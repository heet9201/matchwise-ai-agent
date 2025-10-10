# 🤖 Recruitment AI Agent

An intelligent recruitment assistant that leverages advanced AI models to streamline the hiring process. This system automates job description generation and performs sophisticated resume analysis using state-of-the-art language models via the Groq API.

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![MUI](https://img.shields.io/badge/MUI-%230081CB.svg?style=for-the-badge&logo=mui&logoColor=white)

## 🎯 Key Features

- **Automated Job Description Generation**: Create professional JDs from simple inputs
- **Intelligent Resume Analysis**: Compare resumes against job requirements with detailed scoring
- **Smart Candidate Ranking**: Automatically identify best matches using AI
- **Automated Email Generation**: Generate personalized acceptance/rejection emails
- **Modern UI/UX**: Clean, responsive interface with Material-UI components

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- Python (3.8 or higher)
- Groq API key

### Environment Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/heet9201/recruitment-ai-agent.git
   cd recruitment-ai-agent
   ```

2. **Backend Setup**

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\\Scripts\\activate
   pip install -r requirements.txt
   ```

   Create `.env` file in backend directory:

   ```env
   GROQ_API_KEY=your_groq_api_key
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

## 🚀 Running the Project Locally

1. **Start the Backend Server**

   ```bash
   cd backend
   source venv/bin/activate  # On Windows: venv\\Scripts\\activate
   uvicorn main:app --reload
   ```

   The API will be available at `http://localhost:8000`

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

## 🧠 Model Choice Explanation

### Model Selection Journey

Initially, I explored traditional NLP approaches:

1. **First Attempt: Hugging Face + spaCy**

   - Started with Hugging Face transformers for text generation
   - Used spaCy for NER and skill extraction
   - Challenges encountered:
     - Limited accuracy in understanding context
     - Inconsistent response quality
     - Difficulty in maintaining professional tone
     - Insufficient understanding of recruitment domain

2. **Final Choice: Groq API with Llama Models**
   - Switched to Groq API for significant improvements:
     - Better understanding of recruitment context
     - More accurate skill matching
     - Professional and consistent outputs
     - Faster response times
     - Cost-effective solution

Currently implementing the **Llama-3.3-70b-versatile** model through Groq API, which offers:

- **Superior Performance**: Excellent natural language understanding and generation
- **Versatility**: Perfect for both resume analysis and email generation
- **Cost-Effectiveness**: Available in free tier while maintaining high quality
- **Response Speed**: Quick responses essential for real-time analysis

### Alternative Model Considerations

During development, I evaluated several options:

1. **OpenAI GPT Models**

   - Initially considered but not implemented due to paid API requirements

2. **Other Groq Models**
   - Llama-3-Groq-70B-Tool-Use (Premium tier)
   - Mixtral-8x7B-Instruct (Premium tier)
   - Llama-3-Groq-8B-Tool-Use (Premium tier)

For production environments, a multi-model approach could be implemented:

- Use larger models (70B) for critical tasks like final scoring and personalized emails
- Use smaller models (8B) for bulk processing and quick previews

## 🧠 AI Logic and Architecture

### Overview
A concise, end-to-end pipeline that converts structured JD inputs and uploaded resumes into validated candidate recommendations and communication assets.

### Pipeline
- Job Description Generation
   - Takes structured fields (title, skills, experience, company) and produces consistent sections (About, Role, Requirements).
   - Enforces professional tone and standardized formatting for downstream matching.
- Resume Processing
   - Supports PDF/DOC/DOCX; extracts text while preserving structure.
   - Normalizes, cleans, and tags content (skills, roles, dates, education).
- Semantic Matching
   - Extracts required skills from the JD and detects both explicit and implicit matches in resumes.
   - Uses embeddings/semantic similarity to handle synonyms and contextual matches.

### Scoring & Candidate Evaluation
- Composite score (0–100) computed from weighted factors:
   - Skill match, relevant experience, role fit, qualifications.
- Identifies critical missing skills and ranks candidates by composite score.
- Produces concise strength/weakness remarks and rationale for the score.

### Outputs & Reliability
- Generates personalized emails (invite/reject) tailored to candidate score and context.
- Validates outputs for structure and content quality before returning results.
- Includes monitoring and fallback mechanisms to ensure consistent responses.

This streamlined section replaces repetitive details while keeping the pipeline, scoring, and outputs clear and actionable.


## 🎯 Model Choice and AI Implementation

This project implements a sophisticated AI architecture using Groq's advanced language models. Here's a detailed explanation of our model choices and implementation strategy:

### Model Selection Strategy

We implement a cascading model architecture with intelligent fallback mechanisms:

```python
MODELS = [
    "llama-3.3-70b-versatile",    # Primary: Our workhorse model
    "llama-3.1-8b-instant",       # Quick fallback for time-sensitive tasks
    "openai/gpt-oss-120b",        # Heavy-duty processing when needed
    "openai/gpt-oss-20b",         # Balanced performance-cost option
    "meta-llama/llama-guard-4-12b"# Security and content filtering
]
```

#### Why These Models?

1. **Llama-3.3-70b-versatile (Primary)**

   - Best balance of performance and response time
   - Excellent at understanding context and nuance
   - Superior at generating professional content
   - Ideal for complex tasks like resume analysis

2. **Llama-3.1-8b-instant (Fast Fallback)**

   - Quick response times
   - Perfect for real-time interactions
   - Good for simpler tasks
   - Efficient resource utilization

3. **GPT-OSS Models (Alternative Options)**
   - High reliability
   - Good for specialized tasks
   - Backup for primary model unavailability

### Task-Specific Optimizations

We fine-tune parameters for each task type:

1. **Job Description Generation**

   ```python
   {
       "temperature": 0.7,        # Balanced creativity with consistency
       "max_tokens": 1000,        # Allows for comprehensive descriptions
       "system_message": "You are a professional HR content writer."
   }
   ```

   - Higher temperature for creative yet professional writing
   - Generous token limit for detailed descriptions
   - HR-focused system message for appropriate tone

2. **Resume Analysis**

   ```python
   {
       "temperature": 0.5,        # Prioritizes accuracy over creativity
       "max_tokens": 500,        # Concise, focused analysis
       "system_message": "You are an AI recruitment expert."
   }
   ```

   - Lower temperature for more consistent analysis
   - Optimized token limit for efficient processing
   - Expert system context for accurate evaluations

3. **Email Generation**
   ```python
   {
       "temperature": 0.7,        # Allows for personalization
       "max_tokens": 400,        # Email-appropriate length
       "system_message": "You are a professional HR manager crafting personalized emails."
   }
   ```
   - Balanced temperature for professional yet warm tone
   - Controlled length for effective communication
   - HR manager persona for appropriate style

### Reliability Features

1. **Smart Fallback System**

   - Automatic model switching on failure
   - Performance monitoring and adjustment
   - Graceful degradation paths

2. **Error Handling**

   - Comprehensive error catching
   - Retry mechanisms with exponential backoff
   - Detailed error logging for debugging

3. **Output Validation**

   - Structure verification
   - Content quality checks
   - Format standardization

4. **Performance Optimization**
   - Caching for frequently used prompts
   - Batch processing where applicable
   - Resource usage monitoring

These model choices and configurations ensure robust, efficient, and reliable AI-powered recruitment assistance while maintaining high-quality output across all features.

## 📄 Example Files for Testing

### Sample Job Description Input

```json
{
  "job_title": "Senior Full Stack Developer",
  "years_experience": 5,
  "must_have_skills": "React, Node.js, TypeScript, AWS",
  "company_name": "TechCorp",
  "employment_type": "Full-time",
  "industry": "Software Development",
  "location": "Remote"
}
```

### Sample Resume Format

Your resume should be in PDF, DOC, or DOCX format and include:

- Clear sections for Experience, Skills, Education
- Quantifiable achievements
- Technical skills clearly listed
- Professional experience with dates

Example test files are available in the `/examples` directory.

## 🎯 Project Overview

This application helps HR professionals by:

- Processing and analyzing job descriptions
- Evaluating candidate resumes against job requirements
- Generating personalized communication
- Providing detailed candidate insights

## 💻 Using the Application

### 1. Job Description Input

You have three options to input a job description:

a) **Upload File**

- Click "Upload File" tab
- Drop or select PDF/DOC/DOCX file
- System will extract the content

b) **Manual Input**

- Click "Manual Input" tab
- Type or paste job description

c) **Generate with AI**

- Click "Generate" tab
- Fill in the required fields:
  - Job Title
  - Years of Experience
  - Required Skills
  - Company Details
  - Other specifications

### 2. Resume Processing

- Click "Upload Resumes" section
- Select up to 10 resumes (PDF/DOC/DOCX)
- Wait for analysis to complete

### 3. View Results

Results will show:

- Match score for each candidate
- Missing skills
- Detailed remarks
- Generated emails
  - Interview invitation for top matches
  - Rejection emails for others

## 🏗️ Project Structure

```
recruitment-ai-agent/
├── backend/                # FastAPI backend
│   ├── app/               # Application code
│   ├── requirements.txt   # Python dependencies
│   └── README.md         # Backend documentation
├── frontend/              # React frontend
│   ├── src/              # Source code
│   ├── package.json      # Node dependencies
│   └── README.md         # Frontend documentation
└── examples/             # Example files
    ├── job-descriptions/
    └── resumes/
```

## 🌟 Key Features

1. **Smart Document Processing**

   - Multiple file format support
   - Text extraction
   - Content analysis

2. **AI-Powered Analysis**

   - Resume-JD matching
   - Skill gap analysis
   - Automated scoring

3. **Communication Automation**
   - Personalized emails
   - Professional templates
   - Contextual content

## 🌍 Deployment

### Backend Deployment (Render)

1. Create new Web Service
2. Connect GitHub repository
3. Configure:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables
5. Deploy

### Frontend Deployment (Render)

1. Create new Static Site
2. Connect GitHub repository
3. Configure:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. Add environment variables
5. Deploy

## 📚 Additional Documentation

- Backend API docs: `http://localhost:8000/docs`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues and questions:

1. Check documentation
2. Review common issues in README files
3. Open GitHub issue

---

Made with ❤️ by [Heet Dedakiya](https://github.com/heet9201)