import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import EnhancedDropzone, { UploadedFile } from './EnhancedDropzone'
import AIStepper from './AIStepper'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card'
import { Button } from './ui/button'
import { fadeInUp, staggerContainer } from '../lib/animations'
import { useJobDescription } from '../contexts/JobDescriptionContext'
import { useResume } from '../contexts/ResumeContext'
import { apiService, AnalysisResult } from '../services/api'
import {
    DocumentTextIcon,
    SparklesIcon,
    CheckIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline'

interface ProcessingFile extends UploadedFile {
    stage?: 'parsing' | 'analyzing' | 'matching' | 'complete'
    result?: AnalysisResult
}

const EnhancedResumeUpload: React.FC = () => {
    const [uploadedFiles, setUploadedFiles] = useState<ProcessingFile[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [showResults, setShowResults] = useState(false)

    const { jobDescription } = useJobDescription()
    const { setResults } = useResume()

    const handleFilesAccepted = useCallback((files: File[]) => {
        const newFiles: ProcessingFile[] = files.map((file) => ({
            file,
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            progress: 0,
            status: 'uploading',
            stage: 'parsing',
        }))

        setUploadedFiles((prev) => [...prev, ...newFiles])

        // Simulate upload progress
        newFiles.forEach((uploadedFile) => {
            let progress = 0
            const interval = setInterval(() => {
                progress += 10
                if (progress >= 100) {
                    clearInterval(interval)
                    setUploadedFiles((prev) =>
                        prev.map((f) =>
                            f.id === uploadedFile.id
                                ? { ...f, progress: 100, status: 'success' as const }
                                : f
                        )
                    )
                } else {
                    setUploadedFiles((prev) =>
                        prev.map((f) =>
                            f.id === uploadedFile.id ? { ...f, progress } : f
                        )
                    )
                }
            }, 200)
        })
    }, [])

    const handleFileRemove = useCallback((fileId: string) => {
        setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
    }, [])

    const handleAnalyzeResumes = async () => {
        if (!jobDescription) {
            alert('Please add a job description first!')
            return
        }

        if (uploadedFiles.length === 0) {
            alert('Please upload at least one resume!')
            return
        }

        setIsProcessing(true)

        try {
            // Update stages progressively as API processes
            // Stage 1: Parsing
            setUploadedFiles((prev) =>
                prev.map((f) => ({ ...f, stage: 'parsing' as const }))
            )
            await new Promise((resolve) => setTimeout(resolve, 800))

            // Stage 2: Analyzing
            setUploadedFiles((prev) =>
                prev.map((f) => ({ ...f, stage: 'analyzing' as const }))
            )
            await new Promise((resolve) => setTimeout(resolve, 800))

            // Stage 3: Matching
            setUploadedFiles((prev) =>
                prev.map((f) => ({ ...f, stage: 'matching' as const }))
            )

            // Call API - Create FormData
            const formData = new FormData()
            formData.append('job_description', jobDescription)
            uploadedFiles.forEach((uploadedFile) => {
                formData.append('resumes', uploadedFile.file)
            })

            const response = await apiService.analyzeResumes(formData)

            // Stage 4: Complete
            if (response.success && response.data) {
                const results = response.data.results.map(r => ({
                    ...r,
                    is_best_match: r.is_best_match || false
                }))

                setUploadedFiles((prev) =>
                    prev.map((f, idx) => ({
                        ...f,
                        stage: 'complete' as const,
                        result: response.data!.results[idx],
                    }))
                )

                setResults(results)
                setShowResults(true)
            } else {
                throw new Error(response.error || 'Analysis failed')
            }
        } catch (error) {
            console.error('Analysis error:', error)
            setUploadedFiles((prev) =>
                prev.map((f) => ({
                    ...f,
                    status: 'error' as const,
                    error: 'Failed to analyze resume',
                }))
            )
        } finally {
            setIsProcessing(false)
        }
    }

    const successfulUploads = uploadedFiles.filter((f) => f.status === 'success')

    return (
        <motion.div {...staggerContainer} className="w-full space-y-6">
            {/* Header Card */}
            <motion.div {...fadeInUp}>
                <Card className="glassmorphism">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                                <DocumentTextIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <CardTitle>Upload Resumes</CardTitle>
                                <CardDescription>
                                    Upload candidate resumes for AI-powered analysis and matching
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </motion.div>

            {/* Dropzone */}
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
                <EnhancedDropzone
                    onFilesAccepted={handleFilesAccepted}
                    onFileRemove={handleFileRemove}
                    uploadedFiles={uploadedFiles}
                    maxFiles={10}
                    accept={{
                        'application/pdf': ['.pdf'],
                        'application/msword': ['.doc'],
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
                            '.docx',
                        ],
                    }}
                    variant="glassmorphism"
                />
            </motion.div>

            {/* Processing Status with AIStepper */}
            <AnimatePresence>
                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <AIStepper
                            currentStep={
                                uploadedFiles[0]?.stage === 'parsing' ? 0 :
                                    uploadedFiles[0]?.stage === 'analyzing' ? 1 :
                                        uploadedFiles[0]?.stage === 'matching' ? 2 :
                                            uploadedFiles[0]?.stage === 'complete' ? 3 : 0
                            }
                            onComplete={() => {
                                console.log('All steps completed')
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Action Buttons */}
            {successfulUploads.length > 0 && !isProcessing && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4"
                >
                    <Button
                        variant="gradient"
                        size="lg"
                        onClick={handleAnalyzeResumes}
                        disabled={!jobDescription}
                        className="flex-1"
                    >
                        <SparklesIcon className="w-5 h-5 mr-2" />
                        Analyze {successfulUploads.length} Resume{successfulUploads.length !== 1 ? 's' : ''}
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setUploadedFiles([])}
                    >
                        <XMarkIcon className="w-5 h-5 mr-2" />
                        Clear All
                    </Button>
                </motion.div>
            )}

            {/* Job Description Warning */}
            {!jobDescription && successfulUploads.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Card className="bg-yellow-500/10 border-yellow-500/50">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <SparklesIcon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-yellow-300">
                                        Job Description Required
                                    </p>
                                    <p className="text-xs text-yellow-400/80 mt-1">
                                        Please add a job description before analyzing resumes. The AI needs job requirements to match candidates.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Success Results */}
            {showResults && !isProcessing && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Card className="glassmorphism border-green-500/50">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <CheckIcon className="w-6 h-6 text-green-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-green-400">Analysis Complete!</CardTitle>
                                    <CardDescription>
                                        Successfully analyzed {successfulUploads.length} resume{successfulUploads.length !== 1 ? 's' : ''}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardFooter className="flex gap-3">
                            <Button
                                variant="gradient"
                                onClick={() => {
                                    setShowResults(false)
                                    // Navigate to results - implement based on your routing
                                }}
                            >
                                View Results
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowResults(false)
                                    setUploadedFiles([])
                                }}
                            >
                                Upload More
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            )}
        </motion.div>
    )
}

export default EnhancedResumeUpload
