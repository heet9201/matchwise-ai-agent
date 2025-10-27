import React, { useState, useEffect } from 'react'
import Lottie from 'lottie-react'
import { cn } from '@/lib/cn'

interface AnimatedLottieProps {
    animation: 'loading' | 'success' | 'error' | 'upload' | 'processing' | 'ai-thinking'
    className?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    loop?: boolean
    autoplay?: boolean
}

// Animation file paths
const animationPaths = {
    loading: '/animations/loading.json',
    success: '/animations/success.json',
    error: '/animations/error.json',
    upload: '/animations/upload.json',
    processing: '/animations/processing.json',
    'ai-thinking': '/animations/ai-thinking.json',
}

const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
}

export const AnimatedLottie: React.FC<AnimatedLottieProps> = ({
    animation,
    className,
    size = 'md',
    loop = true,
    autoplay = true,
}) => {
    const [animationData, setAnimationData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        const loadAnimation = async () => {
            try {
                setIsLoading(true)
                const path = animationPaths[animation]
                const response = await fetch(path)

                if (!response.ok) {
                    throw new Error(`Failed to load animation: ${path}`)
                }

                const data = await response.json()
                setAnimationData(data)
                setError(false)
            } catch (err) {
                console.error(`Error loading animation ${animation}:`, err)
                setError(true)
            } finally {
                setIsLoading(false)
            }
        }

        loadAnimation()
    }, [animation])

    // Show loading spinner while fetching animation
    if (isLoading || error || !animationData) {
        return (
            <div className={cn('flex items-center justify-center', sizeClasses[size], className)}>
                <div className="animate-spin rounded-full border-4 border-primary-500 border-t-transparent w-3/4 h-3/4" />
            </div>
        )
    }

    return (
        <div className={cn(sizeClasses[size], className)}>
            <Lottie
                animationData={animationData}
                loop={loop}
                autoplay={autoplay}
            />
        </div>
    )
}

// Simple loading spinner component as fallback
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
    size = 'md',
    className,
}) => {
    return (
        <div className={cn('flex items-center justify-center', sizeClasses[size], className)}>
            <div className="animate-spin rounded-full border-4 border-primary border-t-transparent w-full h-full" />
        </div>
    )
}
