import React from 'react'
import {
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'
import { motion } from 'framer-motion'
import { fadeInUp } from '../lib/animations'

interface SkillMatchData {
    skill: string
    candidate: number
    required: number
    fullMark: number
}

interface SkillRadarChartProps {
    data: SkillMatchData[]
    candidateName?: string
    className?: string
}

const SkillRadarChart: React.FC<SkillRadarChartProps> = ({
    data,
    candidateName = 'Candidate',
    className,
}) => {
    return (
        <motion.div {...fadeInUp}>
            <Card className={`glassmorphism ${className || ''}`}>
                <CardHeader>
                    <CardTitle>Skill Match Analysis</CardTitle>
                    <CardDescription>
                        Comparing {candidateName}'s skills against job requirements
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <RadarChart data={data}>
                            <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
                            <PolarAngleAxis
                                dataKey="skill"
                                tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
                            />
                            <PolarRadiusAxis
                                angle={90}
                                domain={[0, 100]}
                                tick={{ fill: 'rgba(255, 255, 255, 0.5)' }}
                            />
                            <Radar
                                name="Required"
                                dataKey="required"
                                stroke="#a855f7"
                                fill="#a855f7"
                                fillOpacity={0.3}
                            />
                            <Radar
                                name={candidateName}
                                dataKey="candidate"
                                stroke="#6366f1"
                                fill="#6366f1"
                                fillOpacity={0.6}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                }}
                            />
                            <Legend
                                wrapperStyle={{ color: '#fff' }}
                                iconType="circle"
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </motion.div>
    )
}

export default SkillRadarChart
