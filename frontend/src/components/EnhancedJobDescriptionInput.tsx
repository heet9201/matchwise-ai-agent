import React, { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { AnimatedLottie } from './ui/animated-lottie'
import { fadeInUp, scaleIn } from '../lib/animations'
import { cn } from '../lib/cn'
import {
    DocumentTextIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline'

// Validation schema
const jobDescriptionSchema = z.object({
    title: z.string().min(3, 'Job title must be at least 3 characters').max(100, 'Too long'),
    company: z.string().min(2, 'Company name must be at least 2 characters'),
    description: z.string().min(50, 'Description must be at least 50 characters').max(5000, 'Too long'),
    requirements: z.string().min(20, 'Requirements must be at least 20 characters'),
    skills: z.array(z.string()).min(1, 'At least one skill is required'),
    experience: z.string().min(1, 'Experience level is required'),
    location: z.string().optional(),
    salary: z.string().optional(),
})

type JobDescriptionFormData = z.infer<typeof jobDescriptionSchema>

interface EnhancedJobDescriptionInputProps {
    onSubmit: (data: JobDescriptionFormData) => void
    initialData?: Partial<JobDescriptionFormData>
    autoSave?: boolean
    className?: string
}

const EnhancedJobDescriptionInput: React.FC<EnhancedJobDescriptionInputProps> = ({
    onSubmit,
    initialData,
    autoSave = true,
    className,
}) => {
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [skillInput, setSkillInput] = useState('')
    const [charCounts, setCharCounts] = useState({ description: 0, requirements: 0 })

    const form = useForm<JobDescriptionFormData>({
        resolver: zodResolver(jobDescriptionSchema),
        defaultValues: {
            title: initialData?.title || '',
            company: initialData?.company || '',
            description: initialData?.description || '',
            requirements: initialData?.requirements || '',
            skills: initialData?.skills || [],
            experience: initialData?.experience || '',
            location: initialData?.location || '',
            salary: initialData?.salary || '',
        },
    })

    const { watch } = form
    const watchedValues = watch()

    // Auto-save functionality
    useEffect(() => {
        if (!autoSave) return

        const subscription = watch(() => {
            const timer = setTimeout(() => {
                setIsSaving(true)
                // Simulate auto-save
                setTimeout(() => {
                    setIsSaving(false)
                    setLastSaved(new Date())
                }, 500)
            }, 2000) // 2 second debounce

            return () => clearTimeout(timer)
        })

        return () => subscription.unsubscribe()
    }, [watch, autoSave])

    // Character count tracking
    useEffect(() => {
        setCharCounts({
            description: watchedValues.description?.length || 0,
            requirements: watchedValues.requirements?.length || 0,
        })
    }, [watchedValues.description, watchedValues.requirements])

    const handleAddSkill = useCallback(() => {
        if (skillInput.trim()) {
            const currentSkills = form.getValues('skills') || []
            form.setValue('skills', [...currentSkills, skillInput.trim()])
            setSkillInput('')
        }
    }, [skillInput, form])

    const handleRemoveSkill = useCallback((index: number) => {
        const currentSkills = form.getValues('skills') || []
        form.setValue('skills', currentSkills.filter((_, i) => i !== index))
    }, [form])

    const getCharCountColor = (count: number, max: number) => {
        const percentage = (count / max) * 100
        if (percentage < 50) return 'text-green-400'
        if (percentage < 80) return 'text-yellow-400'
        return 'text-red-400'
    }

    return (
        <motion.div {...fadeInUp} className={className}>
            <Card className="glassmorphism">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                                <DocumentTextIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <CardTitle>Job Description</CardTitle>
                                <CardDescription>
                                    Fill in the details for AI-powered candidate matching
                                </CardDescription>
                            </div>
                        </div>
                        {autoSave && lastSaved && (
                            <div className="flex items-center gap-2 text-sm text-white/50">
                                {isSaving ? (
                                    <>
                                        <AnimatedLottie animation="loading" size="sm" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircleIcon className="w-4 h-4 text-green-400" />
                                        <span>Saved {new Date(lastSaved).toLocaleTimeString()}</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Basic Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Job Title *</FormLabel>
                                            <FormControl>
                                                <input
                                                    {...field}
                                                    placeholder="e.g., Senior React Developer"
                                                    className={cn(
                                                        'w-full px-4 py-2 rounded-lg bg-slate-800/50 border text-white',
                                                        'focus:outline-none focus:ring-2 focus:ring-primary-500',
                                                        'placeholder:text-white/40',
                                                        form.formState.errors.title ? 'border-red-500' : 'border-white/10'
                                                    )}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="company"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Company Name *</FormLabel>
                                            <FormControl>
                                                <input
                                                    {...field}
                                                    placeholder="e.g., Tech Corp"
                                                    className={cn(
                                                        'w-full px-4 py-2 rounded-lg bg-slate-800/50 border text-white',
                                                        'focus:outline-none focus:ring-2 focus:ring-primary-500',
                                                        'placeholder:text-white/40',
                                                        form.formState.errors.company ? 'border-red-500' : 'border-white/10'
                                                    )}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Description */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel>Job Description *</FormLabel>
                                            <span className={cn('text-xs', getCharCountColor(charCounts.description, 5000))}>
                                                {charCounts.description} / 5000
                                            </span>
                                        </div>
                                        <FormControl>
                                            <textarea
                                                {...field}
                                                rows={6}
                                                placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                                                className={cn(
                                                    'w-full px-4 py-3 rounded-lg bg-slate-800/50 border text-white resize-none',
                                                    'focus:outline-none focus:ring-2 focus:ring-primary-500',
                                                    'placeholder:text-white/40',
                                                    form.formState.errors.description ? 'border-red-500' : 'border-white/10'
                                                )}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Minimum 50 characters. Be specific about the role and team.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Requirements */}
                            <FormField
                                control={form.control}
                                name="requirements"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel>Requirements *</FormLabel>
                                            <span className={cn('text-xs', getCharCountColor(charCounts.requirements, 5000))}>
                                                {charCounts.requirements} / 5000
                                            </span>
                                        </div>
                                        <FormControl>
                                            <textarea
                                                {...field}
                                                rows={4}
                                                placeholder="List required qualifications, experience, and must-have skills..."
                                                className={cn(
                                                    'w-full px-4 py-3 rounded-lg bg-slate-800/50 border text-white resize-none',
                                                    'focus:outline-none focus:ring-2 focus:ring-primary-500',
                                                    'placeholder:text-white/40',
                                                    form.formState.errors.requirements ? 'border-red-500' : 'border-white/10'
                                                )}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Skills */}
                            <FormField
                                control={form.control}
                                name="skills"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Required Skills *</FormLabel>
                                        <div className="space-y-3">
                                            <div className="flex gap-2">
                                                <input
                                                    value={skillInput}
                                                    onChange={(e) => setSkillInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault()
                                                            handleAddSkill()
                                                        }
                                                    }}
                                                    placeholder="Type a skill and press Enter"
                                                    className={cn(
                                                        'flex-1 px-4 py-2 rounded-lg bg-slate-800/50 border border-white/10 text-white',
                                                        'focus:outline-none focus:ring-2 focus:ring-primary-500',
                                                        'placeholder:text-white/40'
                                                    )}
                                                />
                                                <Button type="button" variant="outline" onClick={handleAddSkill}>
                                                    Add
                                                </Button>
                                            </div>

                                            {/* Skills List */}
                                            <AnimatePresence mode="popLayout">
                                                {field.value && field.value.length > 0 && (
                                                    <motion.div
                                                        {...scaleIn}
                                                        className="flex flex-wrap gap-2 p-4 rounded-lg bg-slate-800/30"
                                                    >
                                                        {field.value.map((skill, index) => (
                                                            <motion.span
                                                                key={index}
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.8 }}
                                                                className="group px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-300 border border-primary-500/20 flex items-center gap-2"
                                                            >
                                                                {skill}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveSkill(index)}
                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    ×
                                                                </button>
                                                            </motion.span>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Experience & Additional Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="experience"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Experience Level *</FormLabel>
                                            <FormControl>
                                                <select
                                                    {...field}
                                                    className={cn(
                                                        'w-full px-4 py-2 rounded-lg bg-slate-800/50 border text-white',
                                                        'focus:outline-none focus:ring-2 focus:ring-primary-500',
                                                        form.formState.errors.experience ? 'border-red-500' : 'border-white/10'
                                                    )}
                                                >
                                                    <option value="">Select experience</option>
                                                    <option value="0-2">Entry Level (0-2 years)</option>
                                                    <option value="2-5">Mid Level (2-5 years)</option>
                                                    <option value="5-10">Senior (5-10 years)</option>
                                                    <option value="10+">Lead/Principal (10+ years)</option>
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Location</FormLabel>
                                            <FormControl>
                                                <input
                                                    {...field}
                                                    placeholder="e.g., San Francisco, CA / Remote"
                                                    className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-white/40"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="salary"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Salary Range</FormLabel>
                                        <FormControl>
                                            <input
                                                {...field}
                                                placeholder="e.g., $120k - $180k"
                                                className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-white/40"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/* Submit Button */}
                            <div className="flex gap-3 pt-4">
                                <Button type="submit" variant="gradient" size="lg" className="flex-1">
                                    <SparklesIcon className="w-5 h-5 mr-2" />
                                    Save & Analyze Candidates
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    onClick={() => form.reset()}
                                >
                                    Reset
                                </Button>
                            </div>

                            {/* Form Validation Summary */}
                            {Object.keys(form.formState.errors).length > 0 && (
                                <motion.div {...scaleIn} className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                    <div className="flex items-start gap-3">
                                        <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-red-300">
                                                Please fix the following errors:
                                            </p>
                                            <ul className="mt-2 text-sm text-red-400 space-y-1">
                                                {Object.entries(form.formState.errors).map(([key, error]) => (
                                                    <li key={key}>• {error.message as string}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </motion.div>
    )
}

export default EnhancedJobDescriptionInput
