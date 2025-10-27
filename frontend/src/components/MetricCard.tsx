import React, { useEffect, useState } from 'react'
import { useSpring, animated, config } from '@react-spring/web'
import { motion } from 'framer-motion'
import { Card, CardContent } from './ui/card'
import { scaleIn } from '../lib/animations'
import { cn } from '../lib/cn'

interface MetricCardProps {
    title: string
    value: number
    suffix?: string
    prefix?: string
    icon?: React.ReactNode
    trend?: {
        value: number
        isPositive: boolean
    }
    color?: 'primary' | 'secondary' | 'success' | 'warning'
    className?: string
    delay?: number
}

const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    suffix = '',
    prefix = '',
    icon,
    trend,
    color = 'primary',
    className,
    delay = 0,
}) => {
    const [hasAnimated, setHasAnimated] = useState(false)

    // Count-up animation
    const { number } = useSpring({
        from: { number: 0 },
        number: hasAnimated ? value : 0,
        delay: delay * 1000,
        config: config.molasses,
        onRest: () => setHasAnimated(true),
    })

    useEffect(() => {
        setHasAnimated(true)
    }, [])

    const colorClasses = {
        primary: 'from-primary-500 to-primary-600',
        secondary: 'from-secondary-500 to-secondary-600',
        success: 'from-green-500 to-green-600',
        warning: 'from-yellow-500 to-yellow-600',
    }

    const bgColorClasses = {
        primary: 'bg-primary-500/10',
        secondary: 'bg-secondary-500/10',
        success: 'bg-green-500/10',
        warning: 'bg-yellow-500/10',
    }

    const textColorClasses = {
        primary: 'text-primary-400',
        secondary: 'text-secondary-400',
        success: 'text-green-400',
        warning: 'text-yellow-400',
    }

    return (
        <motion.div {...scaleIn} transition={{ delay }}>
            <Card className={cn('glassmorphism hover:bg-white/5 transition-all duration-300', className)}>
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-white/60 mb-1">{title}</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-white">
                                    {prefix}
                                    <animated.span>
                                        {number.to((n) => Math.floor(n).toLocaleString())}
                                    </animated.span>
                                    {suffix}
                                </span>
                                {trend && (
                                    <span
                                        className={cn(
                                            'text-sm font-medium flex items-center gap-1',
                                            trend.isPositive ? 'text-green-400' : 'text-red-400'
                                        )}
                                    >
                                        {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                                    </span>
                                )}
                            </div>
                        </div>
                        {icon && (
                            <div
                                className={cn(
                                    'w-12 h-12 rounded-xl flex items-center justify-center',
                                    bgColorClasses[color]
                                )}
                            >
                                <div className={textColorClasses[color]}>{icon}</div>
                            </div>
                        )}
                    </div>

                    {/* Gradient Progress Bar */}
                    <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                        <animated.div
                            className={cn('h-full bg-gradient-to-r', colorClasses[color])}
                            style={{
                                width: number.to((n) => `${(n / value) * 100}%`),
                            }}
                        />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

export default MetricCard
