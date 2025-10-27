import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { animated } from '@react-spring/web'
import { Card, CardContent } from './ui/card'
import { AnimatedLottie } from './ui/animated-lottie'
import { staggerContainer } from '../lib/animations'
import { cn } from '../lib/cn'
import {
    CheckCircleIcon,
    ClockIcon,
} from '@heroicons/react/24/outline'

interface Step {
    id: string
    label: string
    description: string
    status: 'pending' | 'processing' | 'complete' | 'error'
    progress?: number
    animation?: 'loading' | 'success' | 'error' | 'upload' | 'processing' | 'ai-thinking'
}

interface AIStepperProps {
    steps?: Step[]
    currentStep?: number
    streamingText?: string
    onComplete?: () => void
    className?: string
}

const defaultSteps: Step[] = [
    {
        id: '1',
        label: 'Parsing PDFs',
        description: 'Extracting text and structure from resume documents',
        status: 'pending',
        animation: 'upload',
    },
    {
        id: '2',
        label: 'Analyzing Content',
        description: 'Understanding skills, experience, and qualifications',
        status: 'pending',
        animation: 'processing',
    },
    {
        id: '3',
        label: 'Matching Skills',
        description: 'Comparing candidate skills with job requirements',
        status: 'pending',
        animation: 'ai-thinking',
    },
    {
        id: '4',
        label: 'Calculating Scores',
        description: 'Computing compatibility scores and ranking candidates',
        status: 'pending',
        animation: 'success',
    },
]

const AIStepper: React.FC<AIStepperProps> = ({
    steps = defaultSteps,
    currentStep = 0,
    streamingText,
    onComplete,
    className,
}) => {
    const [displayedText, setDisplayedText] = useState('')
    const [textIndex, setTextIndex] = useState(0)

    // Typewriter effect for streaming text
    useEffect(() => {
        if (!streamingText) return

        if (textIndex < streamingText.length) {
            const timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + streamingText[textIndex])
                setTextIndex((prev) => prev + 1)
            }, 30) // Typing speed

            return () => clearTimeout(timeout)
        }
    }, [streamingText, textIndex])

    // Reset text when streamingText changes
    useEffect(() => {
        setDisplayedText('')
        setTextIndex(0)
    }, [streamingText])

    // Call onComplete when all steps are done
    useEffect(() => {
        const allComplete = steps.every((step) => step.status === 'complete')
        if (allComplete && onComplete) {
            onComplete()
        }
    }, [steps, onComplete])

    const StepIcon: React.FC<{ step: Step; index: number }> = ({ step, index }) => {
        const isActive = currentStep === index
        const isComplete = step.status === 'complete'
        const isProcessing = step.status === 'processing'

        if (isComplete) {
            return (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-12 h-12 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center"
                >
                    <CheckCircleIcon className="w-6 h-6 text-green-400" />
                </motion.div>
            )
        }

        if (isProcessing || isActive) {
            return (
                <div className="w-12 h-12 rounded-full bg-primary-500/20 border-2 border-primary-500 flex items-center justify-center">
                    <AnimatedLottie animation={step.animation || 'loading'} size="md" />
                </div>
            )
        }

        return (
            <div className="w-12 h-12 rounded-full bg-slate-700/50 border-2 border-slate-600 flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-white/40" />
            </div>
        )
    }

    return (
        <motion.div {...staggerContainer} className={className}>
            <Card className="glassmorphism">
                <CardContent className="p-8">
                    {/* Steps */}
                    <div className="space-y-8">
                        {steps.map((step, index) => {
                            const isActive = currentStep === index
                            const isComplete = step.status === 'complete'
                            const isProcessing = step.status === 'processing'

                            return (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <StepIcon step={step} index={index} />

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3
                                                    className={cn(
                                                        'text-lg font-semibold',
                                                        isComplete
                                                            ? 'text-green-400'
                                                            : isActive || isProcessing
                                                                ? 'text-white'
                                                                : 'text-white/40'
                                                    )}
                                                >
                                                    {step.label}
                                                </h3>
                                                {isProcessing && step.progress !== undefined && (
                                                    <span className="text-sm text-primary-300">
                                                        {step.progress}%
                                                    </span>
                                                )}
                                            </div>
                                            <p
                                                className={cn(
                                                    'text-sm',
                                                    isActive || isProcessing ? 'text-white/70' : 'text-white/40'
                                                )}
                                            >
                                                {step.description}
                                            </p>

                                            {/* Progress Bar */}
                                            {isProcessing && step.progress !== undefined && (
                                                <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                    <animated.div
                                                        className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                                                        style={{ width: `${step.progress}%` }}
                                                    />
                                                </div>
                                            )}

                                            {/* Streaming Text */}
                                            <AnimatePresence>
                                                {isActive && displayedText && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="mt-3 p-3 rounded-lg bg-primary-500/10 border border-primary-500/20"
                                                    >
                                                        <p className="text-sm text-primary-200 font-mono">
                                                            {displayedText}
                                                            <span className="animate-pulse">|</span>
                                                        </p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Status Badge */}
                                        {step.status === 'error' && (
                                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-300">
                                                Error
                                            </span>
                                        )}
                                    </div>

                                    {/* Connector Line */}
                                    {index < steps.length - 1 && (
                                        <div className="absolute left-6 top-16 w-0.5 h-8 bg-slate-700/50" />
                                    )}
                                </motion.div>
                            )
                        })}
                    </div>

                    {/* Overall Progress */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-8 pt-8 border-t border-white/10"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-white/70">Overall Progress</span>
                            <span className="text-sm font-semibold text-white">
                                {Math.round((currentStep / steps.length) * 100)}%
                            </span>
                        </div>
                        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-primary-500 via-purple-500 to-secondary-500"
                                initial={{ width: '0%' }}
                                animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                                transition={{ duration: 0.5, ease: 'easeInOut' }}
                            />
                        </div>
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

export default AIStepper
export type { Step, AIStepperProps }
