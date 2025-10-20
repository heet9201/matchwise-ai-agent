import React, { useState, useCallback } from 'react';
import {
    Paper,
    Typography,
    Box,
    Alert,
    Chip,
    IconButton,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';

interface CandidateResumeUploadProps {
    resume: File | null;
    onResumeChange: (file: File | null) => void;
}

const CandidateResumeUpload: React.FC<CandidateResumeUploadProps> = ({ resume, onResumeChange }) => {
    const [error, setError] = useState<string | null>(null);

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setError('File size exceeds 10MB limit');
            return;
        }

        setError(null);
        onResumeChange(file);
    }, [onResumeChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc', '.docx'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        multiple: false,
    });

    const handleRemove = () => {
        onResumeChange(null);
        setError(null);
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DescriptionIcon color="primary" />
                Upload Your Resume
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload your resume to analyze job matches
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {!resume ? (
                <Box
                    {...getRootProps()}
                    sx={{
                        border: '2px dashed',
                        borderColor: isDragActive ? 'primary.main' : 'grey.300',
                        borderRadius: 2,
                        p: 4,
                        textAlign: 'center',
                        cursor: 'pointer',
                        bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: 'action.hover',
                        },
                    }}
                >
                    <input {...getInputProps()} />
                    <UploadFileIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        or click to browse (PDF, DOC, DOCX - max 10MB)
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <DescriptionIcon color="primary" sx={{ fontSize: 40 }} />
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" fontWeight={500}>
                            {resume.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {(resume.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                    </Box>
                    <Chip label="Ready" color="success" size="small" />
                    <IconButton onClick={handleRemove} color="error" size="small">
                        <DeleteIcon />
                    </IconButton>
                </Box>
            )}
        </Paper>
    );
};

export default CandidateResumeUpload;
