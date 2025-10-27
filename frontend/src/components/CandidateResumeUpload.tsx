import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import {
    DocumentTextIcon,
    CloudArrowUpIcon,
    CheckCircleIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

interface CandidateResumeUploadProps {
    resume: File | null;
    onResumeChange: (file: File | null) => void;
}

const CandidateResumeUpload: React.FC<CandidateResumeUploadProps> = ({ resume, onResumeChange }) => {
    const [error, setError] = useState<string | null>(null);

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
        if (rejectedFiles.length > 0) {
            setError('Invalid file type. Please upload PDF, DOC, or DOCX files only.');
            return;
        }

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
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        multiple: false,
        maxSize: MAX_FILE_SIZE,
    });

    const handleRemove = () => {
        onResumeChange(null);
        setError(null);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <Card className="glassmorphism-strong">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DocumentTextIcon className="w-6 h-6 text-primary-400" />
                    Upload Your Resume
                </CardTitle>
                <CardDescription>
                    Upload your resume to analyze job matches and find your perfect opportunity
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <AnimatePresence mode="wait">
                    {!resume ? (
                        <motion.div
                            key="dropzone"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div
                                {...getRootProps()}
                                className={`
                                    relative border-2 border-dashed rounded-xl p-8 transition-all duration-300
                                    cursor-pointer text-center
                                    ${isDragActive
                                        ? 'border-primary-400 bg-primary-500/10'
                                        : 'border-white/20 hover:border-primary-400/50 bg-slate-900/20'
                                    }
                                `}
                            >
                                <input {...getInputProps()} />
                                <motion.div
                                    animate={{
                                        y: isDragActive ? -10 : 0,
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <CloudArrowUpIcon
                                        className={`w-16 h-16 mx-auto mb-4 transition-colors ${isDragActive ? 'text-primary-400' : 'text-slate-400'
                                            }`}
                                    />
                                    <h3 className="text-lg font-semibold mb-2 text-white">
                                        {isDragActive ? 'Drop your resume here' : 'Upload Resume'}
                                    </h3>
                                    <p className="text-sm text-slate-400 mb-4">
                                        Drag & drop your resume or click to browse
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Supported formats: PDF, DOC, DOCX (Max 10MB)
                                    </p>
                                </motion.div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="file-display"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="bg-slate-800/30 backdrop-blur-sm border border-white/10 rounded-xl p-4"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                    <CheckCircleIcon className="w-6 h-6 text-green-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-medium truncate">{resume.name}</h4>
                                    <p className="text-sm text-slate-400">{formatFileSize(resume.size)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                                        Ready
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleRemove}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/10 border border-red-500/30 rounded-lg p-3"
                    >
                        <div className="flex items-start gap-2">
                            <XMarkIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                            <button
                                onClick={() => setError(null)}
                                className="text-red-400 hover:text-red-300"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </CardContent>
        </Card>
    );
};

export default CandidateResumeUpload;
