from fastapi import UploadFile
import PyPDF2
from docx import Document
import io

class FileService:
    async def process_file(self, file: UploadFile) -> str:
        """Process uploaded PDF or DOCX files and extract text content"""
        content = await file.read()
        
        if file.filename.endswith('.pdf'):
            return self._extract_pdf_text(content)
        elif file.filename.endswith(('.doc', '.docx')):
            return self._extract_docx_text(content)
        else:
            raise ValueError("Unsupported file format. Please upload PDF or DOCX files only.")

    def _extract_pdf_text(self, content: bytes) -> str:
        """Extract text from PDF file"""
        pdf_file = io.BytesIO(content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text

    def _extract_docx_text(self, content: bytes) -> str:
        """Extract text from DOCX file"""
        doc = Document(io.BytesIO(content))
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
