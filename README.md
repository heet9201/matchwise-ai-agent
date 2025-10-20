# 🎯 MatchWise

<div align="center">

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![MUI](https://img.shields.io/badge/MUI-%230081CB.svg?style=for-the-badge&logo=mui&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

**Smart matching for both recruiters and candidates**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Technologies](#-technologies) • [Contributing](#-contributing) • [License](#-license)

</div>

---

## 📖 Description

**MatchWise** is an intelligent full-stack web application that revolutionizes the hiring process by providing AI-powered matching capabilities for both recruiters and job seekers. Using advanced natural language processing and machine learning models via the Groq API, MatchWise delivers sophisticated resume analysis, candidate scoring, and personalized communication automation.

### 🎭 Dual-Mode System

**Recruiter Mode** 🏢

- Analyze multiple candidate resumes against job descriptions
- Automated scoring and skill gap analysis
- Generate personalized interview invitations and rejection emails
- Identify best-fit candidates automatically

**Candidate Mode** 👤

- Match your resume against multiple job opportunities
- Discover which jobs fit your profile best
- Get personalized cover letters for each position
- Identify skill gaps and improvement areas

---

## 📑 Table of Contents

- [Description](#-description)
- [Features](#-features)
- [Technologies](#-technologies)
- [Installation](#-installation)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Usage](#-usage)
  - [Running the Application](#running-the-application)
  - [Recruiter Mode](#recruiter-mode)
  - [Candidate Mode](#candidate-mode)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## ✨ Features

### For Recruiters

- 📝 **Automated Job Description Generation**: Create professional job descriptions from simple inputs
- 🔍 **Intelligent Resume Analysis**: AI-powered resume scoring and evaluation
- 🏆 **Smart Candidate Ranking**: Automatic identification of top matches based on skills, experience, and cultural fit
- 📧 **Email Automation**: Generate personalized acceptance and rejection emails
- 📊 **Batch Processing**: Analyze up to 10 resumes simultaneously
- 💾 **PDF Support**: Direct upload and parsing of PDF resumes and job descriptions
- 📈 **Detailed Analytics**: Comprehensive candidate scoring with skill gap analysis

### For Candidates

- 🎯 **Job Matching**: Discover best-fit opportunities from multiple job postings
- 📄 **Cover Letter Generation**: Personalized cover letters for each application
- 🔍 **Skill Gap Analysis**: Identify areas for professional development
- 📊 **Match Scoring**: Understand how well you fit each position
- 💼 **Resume Optimization**: Get insights on improving your resume

### Technical Features

- 🚀 **Real-time Processing**: Streaming responses for enhanced user experience
- 🔐 **Secure API**: RESTful API with proper error handling
- 🎨 **Modern UI/UX**: Responsive Material-UI design
- ⚡ **Fast Performance**: Optimized for quick analysis and response times
- 🔄 **Async Processing**: Non-blocking operations for better scalability

---

## 🛠 Technologies

### Frontend

- **React** (v18.2.0) - UI library for building interactive interfaces
- **TypeScript** (v5.9.3) - Type-safe JavaScript
- **Material-UI (MUI)** (v5.14.10) - Component library
- **Vite** (v4.4.5) - Fast build tool and dev server
- **Axios** (v1.5.0) - HTTP client for API requests
- **React Hook Form** (v7.46.2) - Form state management
- **React Dropzone** (v14.2.3) - File upload functionality

### Backend

- **Python** (3.10+) - Core programming language
- **FastAPI** - Modern, fast web framework for building APIs
- **Uvicorn** - ASGI server for running FastAPI applications
- **PyPDF2** - PDF parsing and text extraction
- **python-multipart** - File upload handling
- **httpx** - Async HTTP client
- **python-dotenv** - Environment variable management

### AI/ML

- **Groq API** - High-performance AI inference
- **Hugging Face Transformers** - NLP models for text analysis
- **LangChain** - Framework for AI application development

### Development Tools

- **ESLint** - JavaScript/TypeScript linting
- **TypeScript ESLint** - TypeScript-specific linting rules
- **CORS Middleware** - Cross-origin resource sharing

---

## 📥 Installation

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.x or higher) - [Download](https://nodejs.org/)
- **Python** (v3.10 or higher) - [Download](https://www.python.org/)
- **npm** or **yarn** - Package manager (comes with Node.js)
- **pip** - Python package manager (comes with Python)
- **Git** - Version control system

### Backend Setup

1. **Clone the repository**

```bash
git clone https://github.com/heet9201/matchwise.git
cd matchwise
```

2. **Navigate to the backend directory**

```bash
cd backend
```

3. **Create a virtual environment**

```bash
# On macOS/Linux
python3 -m venv venv
source venv/bin/activate

# On Windows
python -m venv venv
venv\Scripts\activate
```

4. **Install Python dependencies**

```bash
pip install -r requirements.txt
```

5. **Set up environment variables**

Create a `.env` file in the `backend` directory:

```bash
touch .env
```

Add the following configuration:

```env
# Groq API Keys (add multiple keys for rotation)
GROQ_API_KEY_1=your_groq_api_key_here
GROQ_API_KEY_2=your_second_groq_api_key_here

# Application Configuration
DEBUG=True
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# File Upload Settings
MAX_FILE_SIZE_MB=10
MAX_FILES_COUNT=10
```

> **Note**: Get your Groq API key from [https://console.groq.com/](https://console.groq.com/)

6. **Verify installation**

```bash
python -c "import fastapi; print('FastAPI installed successfully')"
```

### Frontend Setup

1. **Navigate to the frontend directory**

```bash
cd ../frontend
```

2. **Install Node.js dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the `frontend` directory:

```bash
touch .env
```

Add the following:

```env
VITE_API_URL=http://localhost:8000
```

4. **Verify installation**

```bash
npm run build
```

---

## 🚀 Usage

### Running the Application

#### Start the Backend Server

1. Open a terminal and navigate to the backend directory:

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Start the FastAPI server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`

- API Documentation: `http://localhost:8000/docs`
- Alternative Docs: `http://localhost:8000/redoc`

#### Start the Frontend Application

1. Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

2. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Recruiter Mode

**Step 1: Generate Job Description** (Optional)

- Click on "Generate with AI" in the Job Description section
- Enter basic job requirements
- AI will generate a comprehensive job description

**Step 2: Upload Job Description**

- Upload a PDF job description or paste text directly
- The system will parse and analyze the requirements

**Step 3: Upload Candidate Resumes**

- Upload up to 10 candidate resumes in PDF format
- Drag and drop or click to browse files

**Step 4: Analyze**

- Click "Analyze Resumes"
- View real-time processing status
- Review results including:
  - Overall match scores
  - Skill assessments
  - Experience analysis
  - Top candidate recommendations

**Step 5: Generate Emails**

- Select candidates for acceptance or rejection
- Generate personalized email templates
- Copy and send through your email client

### Candidate Mode

**Step 1: Upload Your Resume**

- Switch to Candidate Mode using the toggle
- Upload your resume in PDF format

**Step 2: Upload Job Descriptions**

- Upload multiple job descriptions (up to 10)
- Can be PDFs or text input

**Step 3: Analyze Matches**

- Click "Find My Best Matches"
- Review your compatibility with each position
- See detailed breakdowns:
  - Match percentage
  - Skill alignment
  - Experience fit
  - Areas for improvement

**Step 4: Generate Cover Letters**

- Select positions you're interested in
- Generate customized cover letters
- Download or copy for applications

---

## 📚 API Documentation

### Health Check

```http
GET /api/health
```

Returns the health status of the API.

### Generate Job Description

```http
POST /api/generate-job-description
```

**Request Body:**

```json
{
  "title": "Senior Software Engineer",
  "company": "Tech Corp",
  "location": "Remote",
  "experience_level": "Senior",
  "key_skills": ["Python", "FastAPI", "React"],
  "additional_requirements": "5+ years of experience"
}
```

**Response:**

```json
{
  "job_description": "Generated job description text...",
  "metadata": {
    "model": "llama-3.1-70b-versatile",
    "timestamp": "2025-10-20T12:00:00Z"
  }
}
```

### Analyze Resumes

```http
POST /api/analyze-resumes
```

**Request:**

- Form data with job description file and multiple resume files

**Response:**

```json
{
  "status": "success",
  "results": [
    {
      "filename": "candidate1.pdf",
      "overall_score": 85,
      "skill_match": 90,
      "experience_match": 80,
      "recommendation": "Strong Match",
      "analysis": "Detailed analysis...",
      "skill_gaps": ["Kubernetes", "AWS"]
    }
  ],
  "top_candidates": ["candidate1.pdf", "candidate2.pdf"]
}
```

For complete API documentation, visit `http://localhost:8000/docs` when running the server.

---

## 📁 Project Structure

```
matchwise/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── requirements.txt        # Python dependencies
│   ├── .env                    # Environment variables (not in repo)
│   ├── app/
│   │   ├── models.py          # Data models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   │   ├── ai_service.py
│   │   │   ├── file_service.py
│   │   │   └── email_service.py
│   │   ├── pipeline/          # Processing pipelines
│   │   └── utils/             # Utility functions
│   └── model_cache/           # Cached ML models
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # Main application component
│   │   ├── main.tsx           # Application entry point
│   │   ├── components/        # React components
│   │   │   ├── RecruitmentContent.tsx
│   │   │   ├── CandidateMode.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── ...
│   │   ├── contexts/          # React contexts
│   │   ├── services/          # API services
│   │   └── types/             # TypeScript types
│   ├── public/                # Static assets
│   ├── index.html             # HTML entry point
│   ├── package.json           # Node.js dependencies
│   ├── tsconfig.json          # TypeScript configuration
│   └── vite.config.ts         # Vite configuration
├── examples/                  # Sample files
│   ├── job-descriptions/
│   └── resumes/
├── README.md                  # This file
└── LICENSE                    # MIT License
```

---

## ⚙ Configuration

### Backend Configuration

Edit `backend/.env` to configure:

- **API Keys**: Multiple Groq API keys for load balancing
- **CORS Origins**: Allowed frontend origins
- **File Limits**: Maximum file size and count
- **Model Settings**: AI model preferences

### Frontend Configuration

Edit `frontend/.env` to configure:

- **API URL**: Backend server endpoint
- **Upload Limits**: Client-side file restrictions

### Model Configuration

The application uses the following AI models:

- **Job Description Generation**: `llama-3.1-70b-versatile`
- **Resume Analysis**: `llama-3.1-70b-versatile`
- **Email Generation**: `llama-3.1-8b-instant`

Models can be changed in `backend/app/services/ai_service.py`

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

- 🐛 **Report Bugs**: Submit issues for any bugs you find
- 💡 **Suggest Features**: Propose new features or improvements
- 📝 **Improve Documentation**: Help us make our docs better
- 🔧 **Submit Pull Requests**: Fix bugs or implement features

### Development Setup

1. **Fork the repository**

```bash
# Click the "Fork" button on GitHub
```

2. **Clone your fork**

```bash
git clone https://github.com/YOUR_USERNAME/matchwise.git
cd matchwise
```

3. **Create a feature branch**

```bash
git checkout -b feature/your-feature-name
```

4. **Make your changes**

- Follow the existing code style
- Add tests for new features
- Update documentation as needed

5. **Commit your changes**

```bash
git add .
git commit -m "feat: add your feature description"
```

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions or modifications
- `chore:` Maintenance tasks

6. **Push to your fork**

```bash
git push origin feature/your-feature-name
```

7. **Create a Pull Request**

- Go to the original repository
- Click "New Pull Request"
- Select your fork and branch
- Fill in the PR template with details

### Code Style Guidelines

**Python (Backend)**

- Follow PEP 8 style guide
- Use type hints
- Add docstrings to functions and classes
- Maximum line length: 100 characters

**TypeScript/React (Frontend)**

- Use functional components with hooks
- Follow ESLint configuration
- Use meaningful variable names
- Add JSDoc comments for complex functions

### Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 MatchWise

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Contact

We'd love to hear from you!

### Project Maintainer

- **Name**: Heet Dedakiya
- **GitHub**: [@heet9201](https://github.com/heet9201)
- **Email**: heet.dedakiya@example.com

### Project Links

- **Repository**: [https://github.com/heet9201/matchwise](https://github.com/heet9201/matchwise)
- **Issues**: [https://github.com/heet9201/matchwise/issues](https://github.com/heet9201/matchwise/issues)
- **Discussions**: [https://github.com/heet9201/matchwise/discussions](https://github.com/heet9201/matchwise/discussions)

<!-- ### Support

- 📧 **Email Support**: support@matchwise.dev
- 💬 **Discord Community**: [Join our server](https://discord.gg/matchwise)
- 📖 **Documentation**: [docs.matchwise.dev](https://docs.matchwise.dev)
- 🐦 **Twitter**: [@MatchWiseApp](https://twitter.com/MatchWiseApp) -->

---

<div align="center">

### ⭐ Star us on GitHub!

If you find MatchWise helpful, please consider giving it a star! It helps others discover the project.

**Made with ❤️ by [Heet Dedakiya](https://github.com/heet9201)**

</div>
