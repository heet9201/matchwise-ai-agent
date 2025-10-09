# Recruitment AI Agent 🎯

A comprehensive AI-powered recruitment assistant that streamlines the hiring process by automating candidate screening, resume analysis, and communication. This project leverages advanced AI models to provide intelligent recruitment solutions while maintaining cost-ef## 🧪 Example Files

The project includes example files in the `/examples` directory to help you test the system:tiveness.

## 📋 Table of Contents

- [🛠️ Setup Instructions](#-setup-instructions)
- [🚀 How to Run Locally](#-how-to-run-locally)
- [🔍 AI Logic Description](#-ai-logic-description)
- [🧠 Model Choices](#-model-choices)
- [� Example Files](#-example-files)
- [📚 Additional Documentation](#-additional-documentation)

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- Git
- Groq API key (free tier)

### Environment Setup

1. **Backend Environment Variables**

   ```
   GROQ_API_KEY=your_api_key_here
   MODEL_NAME=llama-3.3-70b-versatile
   MAX_TOKENS=2048
   TEMPERATURE=0.7
   ```

2. **Frontend Environment Variables**
   ```
   VITE_API_URL=http://localhost:8000
   VITE_MAX_FILE_SIZE=10
   ```

## 🚀 How to Run Locally

## 🔍 AI Logic Description

The AI system implements a sophisticated pipeline for recruitment automation:

1. **Document Processing**

   - PDF/DOC/DOCX parsing using PyPDF2 and python-docx
   - Text cleaning and normalization
   - Section identification (education, experience, skills)

2. **Semantic Analysis**

   - Deep semantic understanding of job requirements
   - Skills extraction and categorization
   - Experience level assessment
   - Educational qualification matching

3. **Matching Algorithm**

   - Vector embedding comparison
   - Skills alignment scoring
   - Experience relevance calculation
   - Education requirements verification
   - Weighted scoring system (configurable weights)

4. **Communication Engine**
   - Context-aware email generation
   - Professional tone maintenance
   - Dynamic content adaptation
   - Personalization based on candidate profile

## 🧠 Model Choices

### Primary Model Selection

For this project, I chose to implement the **Llama-3.3-70b-versatile** model through the Groq API. Here's the reasoning behind this choice:

- **Performance**: Offers excellent natural language understanding and generation capabilities
- **Versatility**: Well-suited for both resume analysis and email generation tasks
- **Cost-Effectiveness**: Available in free tier while maintaining good performance
- **Response Speed**: Provides quick responses essential for real-time analysis

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

### AI Logic Implementation

The AI system performs several key functions:

1. **Resume Analysis**

   - Extracts key information from resumes using OCR and text processing
   - Identifies skills, experience, and qualifications
   - Compares against job requirements using semantic matching

2. **Score Calculation**

   - Weights different factors (skills match, experience, qualifications)
   - Considers both explicit and implicit requirements
   - Generates a normalized score (0-100)

3. **Email Generation**
   - Creates personalized emails based on candidate scores
   - Adapts tone and content based on acceptance/rejection
   - Includes relevant details from the analysis

## 🎯 Project Overview

This application helps HR professionals by:

- Processing and analyzing job descriptions
- Evaluating candidate resumes against job requirements
- Generating personalized communication
- Providing detailed candidate insights

## 🚀 Quick Start Guide

### 1. Clone the Repository

```bash
git clone https://github.com/heet9201/recruitment-ai-agent.git
cd recruitment-ai-agent
```

### 2. Setup Backend

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Add your OpenAI API key to .env file

# Start backend server
uvicorn main:app --reload
```

### 3. Setup Frontend

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Update API URL if needed

# Start development server
npm run dev
```

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

## 🔧 Optimization for Render Free Tier

### Memory Optimization (512MB limit)

- Efficient file processing
- Proper cleanup
- Memory-aware operations

### CPU Optimization (0.1 CPU)

- Asynchronous operations
- Efficient algorithms
- Resource-conscious processing

## 📚 Additional Documentation

- Backend API docs: `http://localhost:8000/docs`
- Detailed setup guides in respective directories:
  - [Backend README](./backend/README.md)
  - [Frontend README](./frontend/README.md)

## � Example Files

The project includes example files to help you test the system:

### Sample Job Descriptions

Located in `/examples/job-descriptions/`:

- `software-engineer.pdf` - Full-stack developer position
- `data-scientist.pdf` - Machine learning specialist role
- `product-manager.pdf` - Technical product management position

### Sample Resumes

Located in `/examples/resumes/`:

- `candidate1.pdf` - Senior developer resume
- `candidate2.pdf` - Mid-level engineer resume
- `candidate3.pdf` - Junior developer resume

To test the system:

1. Use any of the provided job descriptions
2. Upload sample resumes
3. Review the AI analysis and generated communications

## �🤝 Contributing

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
