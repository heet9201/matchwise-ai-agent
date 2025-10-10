from fastapi import UploadFile, HTTPException, status
import PyPDF2
from docx import Document
import io
import logging
from typing import Set
from datetime import datetime

logger = logging.getLogger(__name__)

class FileProcessingError(Exception):
    """Custom exception for file processing errors"""
    pass

class FileService:
    SUPPORTED_FORMATS: Set[str] = {'.pdf', '.doc', '.docx'}
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB

    async def process_file(self, file: UploadFile) -> str:
        """
        Process uploaded PDF or DOCX files and extract text content
        
        Args:
            file: The uploaded file to process
            
        Returns:
            str: Extracted text content from the file
            
        Raises:
            FileProcessingError: If there's an error processing the file
            HTTPException: If the file format is unsupported or file is too large
        """
        try:
            # Validate file format
            file_ext = self._get_file_extension(file.filename)
            if file_ext not in self.SUPPORTED_FORMATS:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Unsupported file format. Supported formats: {', '.join(self.SUPPORTED_FORMATS)}"
                )

            # Read and validate file content
            content = await file.read()
            if len(content) > self.MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File size exceeds maximum limit of {self.MAX_FILE_SIZE // 1024 // 1024}MB"
                )

            # Process file based on format with progress tracking
            try:
                start_time = datetime.now()
                logger.info(f"Started processing file: {file.filename}")

                if file_ext == '.pdf':
                    text = self._extract_pdf_text(content)
                else:  # .doc or .docx
                    text = self._extract_docx_text(content)

                # Validate extracted content
                if not text or len(text.strip()) < 50:
                    raise FileProcessingError("Extracted text is too short or empty")
                
                processing_time = (datetime.now() - start_time).total_seconds()
                logger.info(f"Completed processing {file.filename} in {processing_time:.2f} seconds")

                return text

            except FileProcessingError as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=str(e)
                )
            except Exception as e:
                logger.error(f"Error processing file {file.filename}: {str(e)}", exc_info=True)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Error processing file"
                )
        except Exception as e:
            logger.error(f"Error reading file {file.filename}: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error reading file"
            )

    def _get_file_extension(self, filename: str) -> str:
        """Extract and validate file extension"""
        if not filename or '.' not in filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid filename"
            )
        return filename[filename.rindex('.'):].lower()

    def _extract_pdf_text(self, content: bytes) -> str:
        """
        Extract text from PDF file
        
        Args:
            content: Raw bytes of the PDF file
            
        Returns:
            str: Extracted text content
            
        Raises:
            FileProcessingError: If text extraction fails
        """
        try:
            pdf_file = io.BytesIO(content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            if len(pdf_reader.pages) == 0:
                raise FileProcessingError("PDF file is empty")

            text = []
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text.append(page_text)

            return "\n".join(text)

        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}", exc_info=True)
            raise FileProcessingError(f"Failed to extract text from PDF: {str(e)}")

    def _extract_docx_text(self, content: bytes) -> str:
        """
        Extract text from DOCX file
        
        Args:
            content: Raw bytes of the DOCX file
            
        Returns:
            str: Extracted text content
            
        Raises:
            FileProcessingError: If text extraction fails
        """
        try:
            doc = Document(io.BytesIO(content))
            
            if len(doc.paragraphs) == 0:
                raise FileProcessingError("DOCX file is empty")

            text = []
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    text.append(paragraph.text)

            return "\n".join(text)

        except Exception as e:
            logger.error(f"Error extracting text from DOCX: {str(e)}", exc_info=True)
            raise FileProcessingError(f"Failed to extract text from DOCX: {str(e)}")
