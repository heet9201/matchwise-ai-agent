import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { AnimatedLottie } from './ui/animated-lottie'
import { fadeInUp } from '../lib/animations'
import { cn } from '../lib/cn'
import { apiService } from '../services/api'
import {
    DocumentTextIcon,
    PencilSquareIcon,
    SparklesIcon,
    CloudArrowUpIcon,
    CheckCircleIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline'

// Validation schemas
const manualInputSchema = z.object({
    title: z.string().min(3, 'Job title must be at least 3 characters').max(100, 'Too long'),
    company: z.string().min(2, 'Company name must be at least 2 characters'),
    description: z.string().min(50, 'Description must be at least 50 characters').max(5000, 'Too long'),
    requirements: z.string().min(20, 'Requirements must be at least 20 characters'),
    skills: z.array(z.string()).min(1, 'At least one skill is required'),
    experience: z.string().min(1, 'Experience level is required'),
    location: z.string().optional(),
    salary: z.string().optional(),
})

const aiGenerateSchema = z.object({
    jobTitle: z.string().min(3, 'Job title is required'),
    companyName: z.string().min(2, 'Company name is required'),
    department: z.string().optional(),
    experienceLevel: z.string().min(1, 'Experience level is required'),
    keyResponsibilities: z.string().min(20, 'Key responsibilities are required'),
    requiredSkills: z.string().min(10, 'Required skills are required'),
    preferredSkills: z.string().optional(),
    educationLevel: z.string().optional(),
    workLocation: z.string().optional(),
    employmentType: z.string().optional(),
})

type ManualInputData = z.infer<typeof manualInputSchema>
type AIGenerateData = z.infer<typeof aiGenerateSchema>

interface JobDescriptionTabsProps {
    onJobDescriptionSubmit: (description: string) => void
    className?: string
}

interface UploadedFile {
    file: File
    id: string
    status: 'parsing' | 'success' | 'error'
    extractedText?: string
    error?: string
}

const JobDescriptionTabs: React.FC<JobDescriptionTabsProps> = ({
    onJobDescriptionSubmit,
    className,
}) => {
    const [activeTab, setActiveTab] = useState('upload')
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [skillInput, setSkillInput] = useState('')

    // Manual input form
    const manualForm = useForm<ManualInputData>({
        resolver: zodResolver(manualInputSchema),
        defaultValues: {
            title: '',
            company: '',
            description: '',
            requirements: '',
            skills: [],
            experience: 'mid',
            location: '',
            salary: '',
        },
    })

    // AI generate form
    const aiForm = useForm<AIGenerateData>({
        resolver: zodResolver(aiGenerateSchema),
        defaultValues: {
            jobTitle: '',
            companyName: '',
            department: '',
            experienceLevel: 'mid',
            keyResponsibilities: '',
            requiredSkills: '',
            preferredSkills: '',
            educationLevel: '',
            workLocation: '',
            employmentType: 'full-time',
        },
    })

    // Handle manual form submission
    const handleManualSubmit = useCallback((data: ManualInputData) => {
        const fullDescription = `
Job Title: ${data.title}
Company: ${data.company}
Location: ${data.location || 'Not specified'}
Salary: ${data.salary || 'Not specified'}
Experience: ${data.experience}

Description:
${data.description}

Requirements:
${data.requirements}

Required Skills:
${data.skills.join(', ')}
        `.trim()

        onJobDescriptionSubmit(fullDescription)
    }, [onJobDescriptionSubmit])

    // Handle AI generation
    const handleAIGenerate = useCallback(async (data: AIGenerateData) => {
        setIsGenerating(true)

        try {
            // Simulate AI generation (replace with actual API call)
            await new Promise(resolve => setTimeout(resolve, 2000))

            const generatedDescription = `
Job Title: ${data.jobTitle}
Company: ${data.companyName}
${data.department ? `Department: ${data.department}` : ''}
Experience Level: ${data.experienceLevel}
${data.workLocation ? `Location: ${data.workLocation}` : ''}
${data.employmentType ? `Employment Type: ${data.employmentType}` : ''}

Job Description:
We are seeking a talented ${data.jobTitle} to join our ${data.companyName} team. This role offers an exciting opportunity to work on challenging projects and contribute to our company's success.

Key Responsibilities:
${data.keyResponsibilities}

Required Skills:
${data.requiredSkills}

${data.preferredSkills ? `Preferred Skills:\n${data.preferredSkills}` : ''}

${data.educationLevel ? `Education:\n${data.educationLevel}` : ''}

We offer competitive compensation, excellent benefits, and opportunities for professional growth.
            `.trim()

            onJobDescriptionSubmit(generatedDescription)
        } catch (error) {
            console.error('AI generation error:', error)
        } finally {
            setIsGenerating(false)
        }
    }, [onJobDescriptionSubmit])

    // Handle file upload
    const handleFileUpload = useCallback(async (files: File[]) => {
        const newFiles: UploadedFile[] = files.map(file => ({
            file,
            id: `${file.name}-${Date.now()}`,
            status: 'parsing' as const,
        }))

        setUploadedFiles(prev => [...prev, ...newFiles])

        // Process each file
        for (const uploadedFile of newFiles) {
            try {
                // Update status to parsing
                setUploadedFiles(prev =>
                    prev.map(f =>
                        f.id === uploadedFile.id
                            ? { ...f, status: 'parsing' }
                            : f
                    )
                )

                // Actually call the API to extract text from the file
                console.log('Uploading file to extract content:', uploadedFile.file.name);
                const response = await apiService.uploadJobDescriptionFile(uploadedFile.file);

                if (!response.success || !response.data) {
                    throw new Error(response.error || 'Failed to process file');
                }

                const extractedText = response.data.job_description;
                console.log('Extracted text length:', extractedText?.length);
                console.log('First 200 chars:', extractedText?.substring(0, 200));

                if (!extractedText || extractedText.trim().length < 50) {
                    throw new Error(`File processed but text is too short (${extractedText?.trim().length || 0} characters). Please ensure the file contains readable text.`);
                }

                setUploadedFiles(prev =>
                    prev.map(f =>
                        f.id === uploadedFile.id
                            ? { ...f, status: 'success', extractedText }
                            : f
                    )
                )

                // Auto-submit if only one file
                if (files.length === 1) {
                    onJobDescriptionSubmit(extractedText)
                }
            } catch (error) {
                console.error('File processing error:', error);
                setUploadedFiles(prev =>
                    prev.map(f =>
                        f.id === uploadedFile.id
                            ? { ...f, status: 'error', error: 'Failed to parse file' }
                            : f
                    )
                )
            }
        }
    }, [onJobDescriptionSubmit])

    // Handle drag and drop
    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }, [])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        const files = Array.from(e.dataTransfer.files).filter(file =>
            file.type === 'application/pdf' ||
            file.type === 'application/msword' ||
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )

        if (files.length > 0) {
            handleFileUpload(files)
        }
    }, [handleFileUpload])

    // Handle file input change
    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length > 0) {
            handleFileUpload(files)
        }
    }, [handleFileUpload])

    // Remove uploaded file
    const removeFile = useCallback((id: string) => {
        setUploadedFiles(prev => prev.filter(f => f.id !== id))
    }, [])

    // Use selected file
    const useFile = useCallback((id: string) => {
        const file = uploadedFiles.find(f => f.id === id)
        if (file && file.extractedText) {
            onJobDescriptionSubmit(file.extractedText)
        }
    }, [uploadedFiles, onJobDescriptionSubmit])

    // Add skill to manual form
    const addSkill = useCallback(() => {
        if (skillInput.trim()) {
            const currentSkills = manualForm.getValues('skills')
            if (!currentSkills.includes(skillInput.trim())) {
                manualForm.setValue('skills', [...currentSkills, skillInput.trim()])
            }
            setSkillInput('')
        }
    }, [skillInput, manualForm])

    // Remove skill from manual form
    const removeSkill = useCallback((skill: string) => {
        const currentSkills = manualForm.getValues('skills')
        manualForm.setValue('skills', currentSkills.filter(s => s !== skill))
    }, [manualForm])

    // Tab change handler with smooth transition
    const handleTabChange = useCallback((value: string) => {
        setActiveTab(value)
    }, [])

    // Character count for textareas
    const descriptionLength = manualForm.watch('description')?.length || 0
    const requirementsLength = manualForm.watch('requirements')?.length || 0
    const responsibilitiesLength = aiForm.watch('keyResponsibilities')?.length || 0

    return (
        <Card className={cn('bg-slate-900/40 backdrop-blur-xl border border-white/10', className)}>
            <CardContent className="p-3 sm:p-6">
                <motion.div {...fadeInUp}>
                    <Tabs value={activeTab} onValueChange={handleTabChange}>
                        <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6 h-auto gap-1">
                            <TabsTrigger value="upload" className="gap-1 sm:gap-2 px-1.5 sm:px-3 py-2.5 text-[0.7rem] sm:text-sm flex-col xs:flex-row min-h-[60px] xs:min-h-[48px]">
                                <CloudArrowUpIcon className="w-5 h-5 xs:w-4 xs:h-4 flex-shrink-0" />
                                <span className="leading-tight text-center xs:text-left">Upload</span>
                            </TabsTrigger>
                            <TabsTrigger value="manual" className="gap-1 sm:gap-2 px-1.5 sm:px-3 py-2.5 text-[0.7rem] sm:text-sm flex-col xs:flex-row min-h-[60px] xs:min-h-[48px]">
                                <PencilSquareIcon className="w-5 h-5 xs:w-4 xs:h-4 flex-shrink-0" />
                                <span className="leading-tight text-center xs:text-left">Manual</span>
                            </TabsTrigger>
                            <TabsTrigger value="ai-generate" className="gap-1 sm:gap-2 px-1 sm:px-3 py-2.5 text-[0.65rem] sm:text-sm flex-col xs:flex-row min-h-[60px] xs:min-h-[48px]">
                                <SparklesIcon className="w-5 h-5 xs:w-4 xs:h-4 flex-shrink-0" />
                                <span className="leading-tight text-center xs:text-left whitespace-normal">Generate with AI</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* Upload Tab */}
                        <TabsContent value="upload" className="space-y-4">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key="upload-content"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {/* Drop zone */}
                                    <div
                                        onDragEnter={handleDragEnter}
                                        onDragLeave={handleDragLeave}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                        className={cn(
                                            'relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 bg-gradient-to-br',
                                            isDragging
                                                ? 'border-primary-400 bg-primary-500/10 from-primary-500/5 to-secondary-500/5'
                                                : 'border-white/20 hover:border-primary-400/50 from-slate-900/20 to-slate-800/20 hover:from-primary-500/5 hover:to-secondary-500/5'
                                        )}
                                    >
                                        <input
                                            type="file"
                                            id="job-file-upload"
                                            className="sr-only"
                                            accept=".pdf,.doc,.docx"
                                            multiple
                                            onChange={handleFileInputChange}
                                        />
                                        <label
                                            htmlFor="job-file-upload"
                                            className="flex flex-col items-center justify-center cursor-pointer"
                                        >
                                            {isDragging ? (
                                                <AnimatedLottie animation="upload" size="lg" />
                                            ) : (
                                                <CloudArrowUpIcon className="w-12 h-12 text-primary-400 mb-4" />
                                            )}
                                            <h3 className="text-lg font-semibold text-white mb-2">
                                                {isDragging ? 'Drop files here' : 'Upload Job Description'}
                                            </h3>
                                            <p className="text-sm text-white/60 mb-4">
                                                Drag & drop or click to browse
                                            </p>
                                            <div className="flex gap-2">
                                                {['.pdf', '.doc', '.docx'].map(ext => (
                                                    <span
                                                        key={ext}
                                                        className="px-2 py-1 text-xs rounded-md bg-primary-500/10 text-primary-300"
                                                    >
                                                        {ext}
                                                    </span>
                                                ))}
                                            </div>
                                        </label>
                                    </div>

                                    {/* Uploaded files list */}
                                    {uploadedFiles.length > 0 && (
                                        <div className="space-y-2 mt-4">
                                            <h4 className="text-sm font-medium text-white/90 mb-3">Uploaded Files</h4>
                                            <AnimatePresence>
                                                {uploadedFiles.map(file => (
                                                    <motion.div
                                                        key={file.id}
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="bg-slate-800/30 backdrop-blur-sm border border-white/5 rounded-lg p-4 hover:bg-slate-800/40 hover:border-white/10 transition-all duration-200"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3 flex-1">
                                                                <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                                                                    <DocumentTextIcon className="w-5 h-5 text-primary-400" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-white truncate">
                                                                        {file.file.name}
                                                                    </p>
                                                                    <p className="text-xs text-white/60">
                                                                        {(file.file.size / 1024).toFixed(1)} KB
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {file.status === 'parsing' && (
                                                                    <AnimatedLottie animation="processing" size="sm" />
                                                                )}
                                                                {file.status === 'success' && (
                                                                    <>
                                                                        <CheckCircleIcon className="w-5 h-5 text-green-400" />
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => useFile(file.id)}
                                                                            variant="gradient"
                                                                        >
                                                                            Use
                                                                        </Button>
                                                                    </>
                                                                )}
                                                                {file.status === 'error' && (
                                                                    <span className="text-xs text-red-400">
                                                                        {file.error}
                                                                    </span>
                                                                )}
                                                                <button
                                                                    onClick={() => removeFile(file.id)}
                                                                    className="p-1 hover:bg-white/10 rounded transition-colors"
                                                                    aria-label="Remove file"
                                                                >
                                                                    <XMarkIcon className="w-4 h-4 text-white/60 hover:text-white transition-colors" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </TabsContent>

                        {/* Manual Input Tab */}
                        <TabsContent value="manual" className="space-y-4">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key="manual-content"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Form {...manualForm}>
                                        <form onSubmit={manualForm.handleSubmit(handleManualSubmit)} className="space-y-4">
                                            {/* Title and Company Row */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={manualForm.control}
                                                    name="title"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Job Title *</FormLabel>
                                                            <FormControl>
                                                                <input
                                                                    {...field}
                                                                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                                                    placeholder="e.g., Senior Frontend Developer"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={manualForm.control}
                                                    name="company"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Company *</FormLabel>
                                                            <FormControl>
                                                                <input
                                                                    {...field}
                                                                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                                                    placeholder="e.g., TechCorp Inc."
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {/* Description */}
                                            <FormField
                                                control={manualForm.control}
                                                name="description"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Job Description *</FormLabel>
                                                        <FormControl>
                                                            <textarea
                                                                {...field}
                                                                rows={6}
                                                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                                                                placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                                                            />
                                                        </FormControl>
                                                        <FormDescription className="flex justify-between">
                                                            <span>Provide a detailed job description</span>
                                                            <span className={cn(
                                                                'text-xs',
                                                                descriptionLength > 4500 ? 'text-red-400' :
                                                                    descriptionLength > 4000 ? 'text-yellow-400' :
                                                                        'text-white/60'
                                                            )}>
                                                                {descriptionLength}/5000
                                                            </span>
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Requirements */}
                                            <FormField
                                                control={manualForm.control}
                                                name="requirements"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Requirements *</FormLabel>
                                                        <FormControl>
                                                            <textarea
                                                                {...field}
                                                                rows={4}
                                                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                                                                placeholder="List the must-have requirements and qualifications..."
                                                            />
                                                        </FormControl>
                                                        <FormDescription className="flex justify-between">
                                                            <span>List key requirements</span>
                                                            <span className="text-xs text-white/60">
                                                                {requirementsLength} characters
                                                            </span>
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Skills */}
                                            <FormField
                                                control={manualForm.control}
                                                name="skills"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Required Skills *</FormLabel>
                                                        <div className="space-y-3">
                                                            <div className="flex gap-2">
                                                                <input
                                                                    value={skillInput}
                                                                    onChange={(e) => setSkillInput(e.target.value)}
                                                                    onKeyPress={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault()
                                                                            addSkill()
                                                                        }
                                                                    }}
                                                                    className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                                                    placeholder="Type a skill and press Enter"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    onClick={addSkill}
                                                                    size="default"
                                                                >
                                                                    Add
                                                                </Button>
                                                            </div>
                                                            {field.value.length > 0 && (
                                                                <div className="flex flex-wrap gap-2">
                                                                    <AnimatePresence>
                                                                        {field.value.map((skill) => (
                                                                            <motion.div
                                                                                key={skill}
                                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                                animate={{ opacity: 1, scale: 1 }}
                                                                                exit={{ opacity: 0, scale: 0.8 }}
                                                                                className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-sm"
                                                                            >
                                                                                <span>{skill}</span>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => removeSkill(skill)}
                                                                                    className="ml-1 hover:text-white transition-colors"
                                                                                >
                                                                                    <XMarkIcon className="w-3 h-3" />
                                                                                </button>
                                                                            </motion.div>
                                                                        ))}
                                                                    </AnimatePresence>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Experience, Location, Salary Row */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <FormField
                                                    control={manualForm.control}
                                                    name="experience"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Experience Level *</FormLabel>
                                                            <FormControl>
                                                                <select
                                                                    {...field}
                                                                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                                                >
                                                                    <option value="entry">Entry Level (0-2 years)</option>
                                                                    <option value="mid">Mid Level (3-5 years)</option>
                                                                    <option value="senior">Senior (5+ years)</option>
                                                                    <option value="lead">Lead/Manager (8+ years)</option>
                                                                </select>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={manualForm.control}
                                                    name="location"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Location</FormLabel>
                                                            <FormControl>
                                                                <input
                                                                    {...field}
                                                                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                                                    placeholder="e.g., Remote, NYC"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={manualForm.control}
                                                    name="salary"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Salary Range</FormLabel>
                                                            <FormControl>
                                                                <input
                                                                    {...field}
                                                                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                                                    placeholder="e.g., $80k-$120k"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <Button type="submit" className="w-full" size="lg">
                                                Continue with this Job Description
                                            </Button>
                                        </form>
                                    </Form>
                                </motion.div>
                            </AnimatePresence>
                        </TabsContent>

                        {/* AI Generate Tab */}
                        <TabsContent value="ai-generate" className="space-y-4">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key="ai-content"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Form {...aiForm}>
                                        <form onSubmit={aiForm.handleSubmit(handleAIGenerate)} className="space-y-4">
                                            <div className="bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-500/20 rounded-lg p-4 mb-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                                                        <SparklesIcon className="w-5 h-5 text-primary-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-white mb-1">AI-Powered Job Description</h4>
                                                        <p className="text-xs text-white/70 leading-relaxed">
                                                            Provide key details and our AI will generate a comprehensive, professional job description for you.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Basic Info Row */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={aiForm.control}
                                                    name="jobTitle"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Job Title *</FormLabel>
                                                            <FormControl>
                                                                <input
                                                                    {...field}
                                                                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                                                    placeholder="e.g., Senior Backend Engineer"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={aiForm.control}
                                                    name="companyName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Company Name *</FormLabel>
                                                            <FormControl>
                                                                <input
                                                                    {...field}
                                                                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                                                    placeholder="e.g., Acme Corp"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {/* Department and Experience Row */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={aiForm.control}
                                                    name="department"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Department</FormLabel>
                                                            <FormControl>
                                                                <input
                                                                    {...field}
                                                                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                                                    placeholder="e.g., Engineering"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={aiForm.control}
                                                    name="experienceLevel"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Experience Level *</FormLabel>
                                                            <FormControl>
                                                                <select
                                                                    {...field}
                                                                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                                                >
                                                                    <option value="entry">Entry Level</option>
                                                                    <option value="mid">Mid Level</option>
                                                                    <option value="senior">Senior</option>
                                                                    <option value="lead">Lead/Manager</option>
                                                                </select>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {/* Key Responsibilities */}
                                            <FormField
                                                control={aiForm.control}
                                                name="keyResponsibilities"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Key Responsibilities *</FormLabel>
                                                        <FormControl>
                                                            <textarea
                                                                {...field}
                                                                rows={4}
                                                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                                                                placeholder="List main responsibilities, one per line..."
                                                            />
                                                        </FormControl>
                                                        <FormDescription className="flex justify-between">
                                                            <span>List key responsibilities</span>
                                                            <span className="text-xs text-white/60">
                                                                {responsibilitiesLength} characters
                                                            </span>
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Skills Row */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={aiForm.control}
                                                    name="requiredSkills"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Required Skills *</FormLabel>
                                                            <FormControl>
                                                                <textarea
                                                                    {...field}
                                                                    rows={3}
                                                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                                                                    placeholder="e.g., Python, Django, PostgreSQL"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={aiForm.control}
                                                    name="preferredSkills"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Preferred Skills</FormLabel>
                                                            <FormControl>
                                                                <textarea
                                                                    {...field}
                                                                    rows={3}
                                                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                                                                    placeholder="e.g., Docker, AWS, CI/CD"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {/* Additional Details Row */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <FormField
                                                    control={aiForm.control}
                                                    name="educationLevel"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Education Level</FormLabel>
                                                            <FormControl>
                                                                <input
                                                                    {...field}
                                                                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                                                    placeholder="e.g., Bachelor's"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={aiForm.control}
                                                    name="workLocation"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Work Location</FormLabel>
                                                            <FormControl>
                                                                <input
                                                                    {...field}
                                                                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                                                    placeholder="e.g., Remote"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={aiForm.control}
                                                    name="employmentType"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Employment Type</FormLabel>
                                                            <FormControl>
                                                                <select
                                                                    {...field}
                                                                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                                                >
                                                                    <option value="full-time">Full-Time</option>
                                                                    <option value="part-time">Part-Time</option>
                                                                    <option value="contract">Contract</option>
                                                                    <option value="internship">Internship</option>
                                                                </select>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full"
                                                size="lg"
                                                disabled={isGenerating}
                                            >
                                                {isGenerating ? (
                                                    <span className="flex items-center gap-2">
                                                        <AnimatedLottie animation="ai-thinking" size="sm" />
                                                        Generating Job Description...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        <SparklesIcon className="w-5 h-5" />
                                                        Generate with AI
                                                    </span>
                                                )}
                                            </Button>
                                        </form>
                                    </Form>
                                </motion.div>
                            </AnimatePresence>
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </CardContent>
        </Card>
    )
}

export default JobDescriptionTabs
