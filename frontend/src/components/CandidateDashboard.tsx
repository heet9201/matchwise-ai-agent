import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import MetricCard from './MetricCard'
import SkillRadarChart from './SkillRadarChart'
import ScoreGauge from './ScoreGauge'
import CandidateEmailDisplay from './CandidateEmailDisplay'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { fadeInUp, staggerContainer } from '../lib/animations'
import {
    BriefcaseIcon,
    CheckCircleIcon,
    ClockIcon,
    TrophyIcon,
    SparklesIcon,
    ChartBarIcon,
    LightBulbIcon,
    ArrowTrendingUpIcon,
    EnvelopeIcon,
    EnvelopeOpenIcon,
} from '@heroicons/react/24/outline'

interface JobData {
    id: string
    company: string
    score: number
    jobSource: string
    skills: string[]
    missingSkills: string[]
    isBestMatch: boolean
    email?: string
    email_type?: string
}

interface CandidateDashboardProps {
    jobs?: JobData[]
    totalJobs?: number
    averageScore?: number
    processingTime?: number
    className?: string
}

const CandidateDashboard: React.FC<CandidateDashboardProps> = ({
    jobs = [],
    totalJobs = 0,
    averageScore = 0,
    processingTime = 0,
    className,
}) => {
    const [selectedJob, setSelectedJob] = useState<JobData | null>(jobs[0] || null)
    const [emailModalOpen, setEmailModalOpen] = useState(false)
    const [selectedEmailJob, setSelectedEmailJob] = useState<JobData | null>(null)

    const handleViewEmail = (job: JobData) => {
        setSelectedEmailJob(job)
        setEmailModalOpen(true)
    }

    // Calculate metrics
    const metrics = useMemo(() => {
        const goodMatches = jobs.filter(j => j.score >= 70).length
        const bestMatch = jobs.find(j => j.isBestMatch) || jobs[0]
        const emailsReady = jobs.filter(j => j.email && j.email_type === 'application').length

        // Get all missing skills and count frequency
        const skillFrequency = new Map<string, number>()
        jobs.forEach(job => {
            job.missingSkills?.forEach(skill => {
                const normalized = skill.toLowerCase().trim()
                skillFrequency.set(normalized, (skillFrequency.get(normalized) || 0) + 1)
            })
        })

        // Get top 3 most demanded missing skills
        const topMissingSkills = Array.from(skillFrequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([skill, count]) => ({ skill, count }))

        // Calculate potential score increase
        const potentialIncrease = topMissingSkills.length > 0
            ? Math.min(20, topMissingSkills.length * 5)
            : 0

        return {
            goodMatches,
            bestMatch,
            emailsReady,
            topMissingSkills,
            potentialIncrease,
            qualificationRate: totalJobs > 0 ? Math.round((goodMatches / totalJobs) * 100) : 0,
        }
    }, [jobs, totalJobs])

    // Prepare skill radar data from best match
    const skillRadarData = useMemo(() => {
        if (!metrics.bestMatch) return []

        const allSkills = [...(metrics.bestMatch.skills || []), ...(metrics.bestMatch.missingSkills || [])]
        const uniqueSkills = Array.from(new Set(allSkills)).slice(0, 6)

        return uniqueSkills.map(skill => ({
            skill,
            candidate: metrics.bestMatch.skills?.includes(skill) ? 95 : 0,
            required: 90,
            fullMark: 100,
        }))
    }, [metrics.bestMatch])

    return (
        <div className={`w-full space-y-6 ${className || ''}`}>
            {/* Header */}
            <motion.div {...fadeInUp}>
                <Card className="glassmorphism border-purple-500/30">
                    <CardHeader>
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <CardTitle className="text-3xl flex items-center gap-3">
                                    <SparklesIcon className="w-8 h-8 text-purple-400" />
                                    Your Job Match Dashboard
                                </CardTitle>
                                <p className="text-white/60 mt-2">
                                    AI-powered analysis of your resume against {totalJobs} job opportunities
                                </p>
                                {metrics.emailsReady > 0 && (
                                    <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                                        <EnvelopeIcon className="w-5 h-5 text-green-400" />
                                        <span className="text-green-300 font-semibold">
                                            {metrics.emailsReady} application email{metrics.emailsReady > 1 ? 's' : ''} ready to send!
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <Button variant="gradient" size="lg">
                                    <ArrowTrendingUpIcon className="w-5 h-5 mr-2" />
                                    Improve Resume
                                </Button>
                                {metrics.emailsReady > 0 && (
                                    <span className="text-xs text-white/50 text-center">
                                        Scroll down to view emails
                                    </span>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </motion.div>

            {/* Metrics Grid */}
            <motion.div
                {...staggerContainer}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
            >
                <MetricCard
                    title="Jobs Analyzed"
                    value={totalJobs}
                    icon={<BriefcaseIcon className="w-6 h-6" />}
                    color="primary"
                    delay={0}
                />
                <MetricCard
                    title="Good Matches"
                    value={metrics.goodMatches}
                    suffix={` (${metrics.qualificationRate}%)`}
                    icon={<CheckCircleIcon className="w-6 h-6" />}
                    color="success"
                    trend={{ value: metrics.qualificationRate, isPositive: metrics.qualificationRate >= 50 }}
                    delay={0.1}
                />
                <MetricCard
                    title="Emails Ready"
                    value={metrics.emailsReady}
                    suffix={` / ${metrics.goodMatches}`}
                    icon={<EnvelopeIcon className="w-6 h-6" />}
                    color="secondary"
                    trend={{ value: metrics.emailsReady, isPositive: metrics.emailsReady > 0 }}
                    delay={0.15}
                />
                <MetricCard
                    title="Your Average Score"
                    value={averageScore}
                    suffix="%"
                    icon={<TrophyIcon className="w-6 h-6" />}
                    color="secondary"
                    trend={{
                        value: metrics.potentialIncrease,
                        isPositive: true
                    }}
                    delay={0.2}
                />
                <MetricCard
                    title="Analysis Time"
                    value={processingTime}
                    suffix="s"
                    icon={<ClockIcon className="w-6 h-6" />}
                    color="warning"
                    delay={0.3}
                />
            </motion.div>

            {/* Best Match Score & Skills Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
                    <ScoreGauge
                        score={metrics.bestMatch?.score || 0}
                        label="Best Match Score"
                        description={`${metrics.bestMatch?.company || 'No matches yet'} - Your top opportunity`}
                        size="md"
                    />
                </motion.div>

                <motion.div {...fadeInUp} transition={{ delay: 0.5 }}>
                    <SkillRadarChart
                        data={skillRadarData}
                        candidateName="Your Resume"
                    />
                </motion.div>
            </div>

            {/* Key Insights Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Missing Skills */}
                <motion.div {...fadeInUp} transition={{ delay: 0.6 }}>
                    <Card className="glassmorphism border-orange-500/30 h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <LightBulbIcon className="w-6 h-6 text-orange-400" />
                                Skills to Add (Priority)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {metrics.topMissingSkills.length > 0 ? (
                                <div className="space-y-3">
                                    <p className="text-sm text-white/60 mb-4">
                                        Adding these skills could increase your match scores significantly:
                                    </p>
                                    {metrics.topMissingSkills.map(({ skill, count }, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-300 font-bold">
                                                    {idx + 1}
                                                </div>
                                                <span className="text-white font-medium capitalize">{skill}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-orange-300 font-semibold">{count} jobs</div>
                                                <div className="text-xs text-white/50">require this</div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/20">
                                        <div className="flex items-center gap-2 text-sm">
                                            <ArrowTrendingUpIcon className="w-5 h-5 text-orange-400" />
                                            <span className="text-white/80">
                                                <strong className="text-orange-300">Potential Impact:</strong> Adding these could boost your average score by up to <strong className="text-purple-300">{metrics.potentialIncrease}%</strong>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-white/60">
                                    <SparklesIcon className="w-12 h-12 mx-auto mb-3 text-green-400" />
                                    <p>Great job! Your resume matches all key requirements.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Success Rate & Encouragement */}
                <motion.div {...fadeInUp} transition={{ delay: 0.7 }}>
                    <Card className="glassmorphism border-purple-500/30 h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <ChartBarIcon className="w-6 h-6 text-purple-400" />
                                Your Success Rate
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Qualification Rate Gauge */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-white/60">Qualification Rate</span>
                                        <span className="text-2xl font-bold text-purple-300">{metrics.qualificationRate}%</span>
                                    </div>
                                    <div className="h-4 bg-slate-700/50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                                            style={{ width: `${metrics.qualificationRate}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-white/50 mt-2">
                                        {metrics.goodMatches} out of {totalJobs} jobs are good matches for you
                                    </p>
                                </div>

                                {/* Encouragement Message */}
                                <div className="mt-6 p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                                    {metrics.qualificationRate >= 70 ? (
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <TrophyIcon className="w-6 h-6 text-yellow-400" />
                                                <span className="font-semibold text-white">Excellent Profile!</span>
                                            </div>
                                            <p className="text-sm text-white/80">
                                                You're qualified for <strong>{metrics.qualificationRate}%</strong> of analyzed positions.
                                                You're in great shape! Focus on your top matches and apply with confidence.
                                            </p>
                                        </div>
                                    ) : metrics.qualificationRate >= 50 ? (
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <SparklesIcon className="w-6 h-6 text-blue-400" />
                                                <span className="font-semibold text-white">Strong Potential!</span>
                                            </div>
                                            <p className="text-sm text-white/80">
                                                You're qualified for <strong>{metrics.qualificationRate}%</strong> of positions.
                                                With a few resume improvements, you could reach 80%+ qualification rate!
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <LightBulbIcon className="w-6 h-6 text-orange-400" />
                                                <span className="font-semibold text-white">Room for Growth</span>
                                            </div>
                                            <p className="text-sm text-white/80">
                                                Currently qualified for <strong>{metrics.qualificationRate}%</strong> of positions.
                                                Don't worry! Focus on adding the priority skills above to dramatically improve your matches.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Action Items */}
                                <div className="space-y-2 mt-4">
                                    <h4 className="text-sm font-semibold text-white/80 mb-2">Next Steps:</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2 text-sm text-white/70">
                                            <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                            <span>Review the <strong className="text-white">Resume Improvement Plan</strong> below</span>
                                        </div>
                                        <div className="flex items-start gap-2 text-sm text-white/70">
                                            <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                            <span>Add priority skills to your resume</span>
                                        </div>
                                        <div className="flex items-start gap-2 text-sm text-white/70">
                                            <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                            <span>Re-analyze to see improved scores</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Job Opportunities Table */}
            <motion.div {...fadeInUp} transition={{ delay: 0.8 }}>
                <Card className="glassmorphism">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <BriefcaseIcon className="w-6 h-6 text-purple-400" />
                                Your Job Matches
                            </span>
                            <span className="text-sm font-normal text-white/60">
                                Sorted by match score
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {jobs.length > 0 ? (
                                jobs
                                    .sort((a, b) => {
                                        if (a.isBestMatch !== b.isBestMatch) return a.isBestMatch ? -1 : 1
                                        return b.score - a.score
                                    })
                                    .map((job) => (
                                        <div
                                            key={job.id}
                                            className={`p-4 rounded-lg border transition-all ${job.isBestMatch
                                                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/40'
                                                : job.score >= 70
                                                    ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/40'
                                                    : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600/50'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div
                                                    className="flex-1 cursor-pointer"
                                                    onClick={() => setSelectedJob(job)}
                                                >
                                                    <div className="flex items-center gap-3 mb-2">
                                                        {job.isBestMatch && (
                                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                                                                ⭐ Best Match
                                                            </span>
                                                        )}
                                                        {job.email && job.email_type === 'application' && (
                                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-300 border border-green-500/30 flex items-center gap-1">
                                                                <EnvelopeIcon className="w-3 h-3" />
                                                                Email Ready
                                                            </span>
                                                        )}
                                                        <h3 className="text-lg font-semibold text-white">{job.company}</h3>
                                                    </div>
                                                    <p className="text-sm text-white/60">{job.jobSource}</p>
                                                    <div className="flex items-center gap-4 mt-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-white/50">Matched:</span>
                                                            <span className="text-xs font-medium text-green-300">
                                                                {job.skills?.length || 0} skills
                                                            </span>
                                                        </div>
                                                        {job.missingSkills && job.missingSkills.length > 0 && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-white/50">Missing:</span>
                                                                <span className="text-xs font-medium text-orange-300">
                                                                    {job.missingSkills.length} skills
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right ml-4 flex flex-col items-end gap-2">
                                                    <div>
                                                        <div className="text-3xl font-bold text-white mb-1">
                                                            {job.score}%
                                                        </div>
                                                        <div className={`text-xs font-semibold ${job.score >= 80 ? 'text-green-300' :
                                                            job.score >= 70 ? 'text-blue-300' :
                                                                job.score >= 60 ? 'text-yellow-300' :
                                                                    'text-orange-300'
                                                            }`}>
                                                            {job.score >= 80 ? 'Excellent' :
                                                                job.score >= 70 ? 'Good Match' :
                                                                    job.score >= 60 ? 'Fair Match' :
                                                                        'Needs Work'}
                                                        </div>
                                                    </div>
                                                    {job.email && (
                                                        <Button
                                                            variant={job.email_type === 'application' ? 'gradient' : 'outline'}
                                                            size="sm"
                                                            onClick={() => handleViewEmail(job)}
                                                            className="flex items-center gap-1 mt-2"
                                                        >
                                                            <EnvelopeOpenIcon className="w-4 h-4" />
                                                            {job.email_type === 'application' ? 'View Email' : 'View Info'}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <div className="text-center py-12 text-white/60">
                                    <BriefcaseIcon className="w-16 h-16 mx-auto mb-4 text-white/30" />
                                    <p className="text-lg mb-2">No job matches yet</p>
                                    <p className="text-sm">Upload your resume and add job descriptions to get started</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Selected Job Details */}
            {selectedJob && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="glassmorphism border-purple-500/30">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Job Details: {selectedJob.company}</span>
                                {selectedJob.isBestMatch && (
                                    <span className="px-3 py-1.5 text-sm font-semibold rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                                        ⭐ Your Best Match
                                    </span>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-white/60 mb-2">Job Source</h4>
                                        <p className="text-white">{selectedJob.jobSource}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-white/60 mb-2">Your Match Score</h4>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-4 bg-slate-700/50 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                                                    style={{ width: `${selectedJob.score}%` }}
                                                />
                                            </div>
                                            <span className="text-3xl font-bold text-white">
                                                {selectedJob.score}%
                                            </span>
                                        </div>
                                        <p className="text-xs text-white/50 mt-2">
                                            {selectedJob.score >= 80
                                                ? "Excellent match! You should definitely apply."
                                                : selectedJob.score >= 70
                                                    ? "Good match! You meet most requirements."
                                                    : selectedJob.score >= 60
                                                        ? "Fair match. Consider improving your resume."
                                                        : "Needs improvement. Focus on adding missing skills."}
                                        </p>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-white/60 mb-2">
                                            ✓ Your Matching Skills ({selectedJob.skills?.length || 0})
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedJob.skills && selectedJob.skills.length > 0 ? (
                                                selectedJob.skills.map((skill, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1.5 text-sm rounded-lg bg-green-500/10 text-green-300 border border-green-500/20"
                                                    >
                                                        ✓ {skill}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-white/50 text-sm">No skills matched</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-white/60 mb-2">
                                            ⚠️ Skills to Add ({selectedJob.missingSkills?.length || 0})
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedJob.missingSkills && selectedJob.missingSkills.length > 0 ? (
                                                selectedJob.missingSkills.map((skill, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1.5 text-sm rounded-lg bg-orange-500/10 text-orange-300 border border-orange-500/20"
                                                    >
                                                        + {skill}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-green-300 text-sm">✓ All skills matched!</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
                                {selectedJob.email && selectedJob.email_type === 'application' && (
                                    <Button
                                        variant="gradient"
                                        size="lg"
                                        onClick={() => handleViewEmail(selectedJob)}
                                    >
                                        <EnvelopeIcon className="w-5 h-5 mr-2" />
                                        View Application Email
                                    </Button>
                                )}
                                {!selectedJob.email && selectedJob.score >= 70 && (
                                    <Button variant="gradient" size="lg">
                                        <SparklesIcon className="w-5 h-5 mr-2" />
                                        Generate Application Email
                                    </Button>
                                )}
                                <Button variant="outline" size="lg">
                                    View Full Job Details
                                </Button>
                                <Button variant="ghost" size="lg">
                                    Save for Later
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Email Display Modal */}
            {selectedEmailJob && selectedEmailJob.email && (
                <CandidateEmailDisplay
                    email={selectedEmailJob.email}
                    emailType={selectedEmailJob.email_type || 'application'}
                    companyName={selectedEmailJob.company}
                    score={selectedEmailJob.score}
                    jobSource={selectedEmailJob.jobSource}
                    isOpen={emailModalOpen}
                    onClose={() => {
                        setEmailModalOpen(false)
                        setSelectedEmailJob(null)
                    }}
                />
            )}
        </div>
    )
}

export default CandidateDashboard
