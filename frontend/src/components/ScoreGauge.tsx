import React from 'react'
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'
import { motion } from 'framer-motion'
import { scaleIn } from '../lib/animations'
import { cn } from '../lib/cn'

interface ScoreGaugeProps {
    score: number
    label?: string
    description?: string
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({
    score,
    label = 'Match Score',
    description,
    size = 'md',
    className,
}) => {
    const data = [
        {
            name: 'Score',
            value: score,
            fill: score >= 80 ? '#10b981' : score >= 60 ? '#6366f1' : score >= 40 ? '#f59e0b' : '#ef4444',
        },
    ]

    const sizeClasses = {
        sm: 192,
        md: 256,
        lg: 320,
    }

    const getScoreLabel = (score: number) => {
        if (score >= 80) return { text: 'Excellent', color: 'text-green-400' }
        if (score >= 60) return { text: 'Good', color: 'text-blue-400' }
        if (score >= 40) return { text: 'Fair', color: 'text-yellow-400' }
        return { text: 'Poor', color: 'text-red-400' }
    }

    const scoreLabel = getScoreLabel(score)

    return (
        <motion.div {...scaleIn}>
            <Card className={cn('glassmorphism', className)}>
                <CardHeader>
                    <CardTitle>{label}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <ResponsiveContainer width="100%" height={sizeClasses[size]}>
                            <RadialBarChart
                                cx="50%"
                                cy="50%"
                                innerRadius="60%"
                                outerRadius="90%"
                                data={data}
                                startAngle={180}
                                endAngle={0}
                            >
                                <RadialBar
                                    background={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                    dataKey="value"
                                    cornerRadius={10}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '8px',
                                        color: '#fff',
                                    }}
                                />
                            </RadialBarChart>
                        </ResponsiveContainer>

                        {/* Center Score Display */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="text-5xl font-bold text-white mb-2">{score}</div>
                            <div className={cn('text-lg font-semibold', scoreLabel.color)}>
                                {scoreLabel.text}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

export default ScoreGauge
