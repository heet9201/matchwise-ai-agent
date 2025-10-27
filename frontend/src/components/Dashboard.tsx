import React, { useState } from 'react'
import { motion } from 'framer-motion'
import MetricCard from './MetricCard'
import SkillRadarChart from './SkillRadarChart'
import ScoreGauge from './ScoreGauge'
import SortableTable, { CandidateData } from './SortableTable'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { fadeInUp, staggerContainer } from '../lib/animations'
import {
    UserGroupIcon,
    DocumentCheckIcon,
    ClockIcon,
    TrophyIcon,
} from '@heroicons/react/24/outline'

interface DashboardProps {
    candidates?: CandidateData[]
    totalResumes?: number
    averageScore?: number
    processingTime?: number
    className?: string
}

// Mock data for demonstration
const mockCandidates: CandidateData[] = [
    {
        id: '1',
        name: 'Sarah Johnson',
        score: 92,
        email: 'sarah.j@example.com',
        experience: '5 years',
        skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker'],
        missingSkills: ['Kubernetes'],
        isBestMatch: true,
    },
    {
        id: '2',
        name: 'Michael Chen',
        score: 85,
        email: 'michael.c@example.com',
        experience: '4 years',
        skills: ['Vue.js', 'JavaScript', 'Python', 'PostgreSQL'],
        missingSkills: ['TypeScript', 'AWS'],
    },
    {
        id: '3',
        name: 'Emily Rodriguez',
        score: 78,
        email: 'emily.r@example.com',
        experience: '3 years',
        skills: ['Angular', 'TypeScript', 'MongoDB', 'Express'],
        missingSkills: ['React', 'AWS', 'Docker'],
    },
    {
        id: '4',
        name: 'David Park',
        score: 71,
        email: 'david.p@example.com',
        experience: '6 years',
        skills: ['React', 'JavaScript', 'Node.js', 'MySQL'],
        missingSkills: ['TypeScript', 'AWS', 'Docker', 'Kubernetes'],
    },
    {
        id: '5',
        name: 'Lisa Thompson',
        score: 65,
        email: 'lisa.t@example.com',
        experience: '2 years',
        skills: ['React', 'JavaScript', 'CSS', 'HTML'],
        missingSkills: ['TypeScript', 'Node.js', 'AWS', 'Docker'],
    },
]

const mockSkillData = [
    { skill: 'React', candidate: 90, required: 95, fullMark: 100 },
    { skill: 'TypeScript', candidate: 85, required: 90, fullMark: 100 },
    { skill: 'Node.js', candidate: 80, required: 85, fullMark: 100 },
    { skill: 'AWS', candidate: 75, required: 80, fullMark: 100 },
    { skill: 'Docker', candidate: 70, required: 75, fullMark: 100 },
    { skill: 'Testing', candidate: 65, required: 70, fullMark: 100 },
]

const Dashboard: React.FC<DashboardProps> = ({
    candidates = mockCandidates,
    totalResumes = 25,
    averageScore = 75,
    processingTime = 45,
    className,
}) => {
    const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(
        candidates[0] || null
    )

    const bestMatch = candidates.find((c) => c.isBestMatch) || candidates[0]

    return (
        <div className={`w-full space-y-6 ${className || ''}`}>
            {/* Header */}
            <motion.div {...fadeInUp}>
                <Card className="glassmorphism border-primary-500/30">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-3xl">Recruitment Dashboard</CardTitle>
                                <p className="text-white/60 mt-2">
                                    AI-powered candidate analysis and matching results
                                </p>
                            </div>
                            <Button variant="gradient" size="lg">
                                Export Report
                            </Button>
                        </div>
                    </CardHeader>
                </Card>
            </motion.div>

            {/* Metrics Grid */}
            <motion.div
                {...staggerContainer}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                <MetricCard
                    title="Total Candidates"
                    value={totalResumes}
                    icon={<UserGroupIcon className="w-6 h-6" />}
                    color="primary"
                    trend={{ value: 12, isPositive: true }}
                    delay={0}
                />
                <MetricCard
                    title="Processed"
                    value={candidates.length}
                    suffix={` / ${totalResumes}`}
                    icon={<DocumentCheckIcon className="w-6 h-6" />}
                    color="success"
                    delay={0.1}
                />
                <MetricCard
                    title="Average Score"
                    value={averageScore}
                    suffix="%"
                    icon={<TrophyIcon className="w-6 h-6" />}
                    color="secondary"
                    trend={{ value: 5, isPositive: true }}
                    delay={0.2}
                />
                <MetricCard
                    title="Processing Time"
                    value={processingTime}
                    suffix="s"
                    icon={<ClockIcon className="w-6 h-6" />}
                    color="warning"
                    trend={{ value: 15, isPositive: false }}
                    delay={0.3}
                />
            </motion.div>

            {/* Best Match & Score */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
                    <ScoreGauge
                        score={bestMatch?.score || 0}
                        label="Best Match Score"
                        description={`${bestMatch?.name || 'No candidate'} - Top candidate for this position`}
                        size="md"
                    />
                </motion.div>

                <motion.div {...fadeInUp} transition={{ delay: 0.5 }}>
                    <SkillRadarChart
                        data={mockSkillData}
                        candidateName={selectedCandidate?.name || 'Candidate'}
                    />
                </motion.div>
            </div>

            {/* Candidate Table */}
            <SortableTable
                candidates={candidates}
                onCandidateSelect={(candidate) => setSelectedCandidate(candidate)}
            />

            {/* Comparison View */}
            {selectedCandidate && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Card className="glassmorphism">
                        <CardHeader>
                            <CardTitle>Candidate Details: {selectedCandidate.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-white/60 mb-2">Contact Info</h4>
                                        <p className="text-white">{selectedCandidate.email}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-white/60 mb-2">Experience</h4>
                                        <p className="text-white">{selectedCandidate.experience}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-white/60 mb-2">Match Score</h4>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                                                    style={{ width: `${selectedCandidate.score}%` }}
                                                />
                                            </div>
                                            <span className="text-2xl font-bold text-white">
                                                {selectedCandidate.score}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-white/60 mb-2">
                                            Matched Skills ({selectedCandidate.skills.length})
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedCandidate.skills.map((skill, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1.5 text-sm rounded-lg bg-green-500/10 text-green-300 border border-green-500/20"
                                                >
                                                    ✓ {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-white/60 mb-2">
                                            Missing Skills ({selectedCandidate.missingSkills.length})
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedCandidate.missingSkills.map((skill, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1.5 text-sm rounded-lg bg-red-500/10 text-red-300 border border-red-500/20"
                                                >
                                                    ✗ {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
                                <Button variant="gradient" size="lg">
                                    Schedule Interview
                                </Button>
                                <Button variant="outline" size="lg">
                                    Send Email
                                </Button>
                                <Button variant="ghost" size="lg">
                                    Download Resume
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    )
}

export default Dashboard
