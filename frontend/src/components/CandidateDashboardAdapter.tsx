import React, { useMemo } from 'react'
import CandidateDashboard from './CandidateDashboard'

interface BaseResult {
    score: number
    is_best_match?: boolean
    missing_skills?: string[]
    remarks?: string
    email?: string
    email_type?: string
}

interface CandidateResult extends BaseResult {
    job_source: string
    company_name: string
}

interface CandidateDashboardAdapterProps {
    results: CandidateResult[]
    className?: string
}

/**
 * CandidateDashboardAdapter
 * 
 * Converts candidate job analysis results to the format expected by CandidateDashboard component.
 * Focuses on job opportunities and how the candidate matches against them.
 */
const CandidateDashboardAdapter: React.FC<CandidateDashboardAdapterProps> = ({ results, className }) => {
    const adaptedData = useMemo(() => {
        const jobs = results.map((result, index) => {
            // Extract matched skills from remarks (skills that are present)
            // This is a heuristic - in reality, the backend should provide this explicitly
            const matchedSkillsMatch = result.remarks?.match(/(?:Matched|Has|Possesses)[\s\S]*?:\s*([^.]+)/i)
            const matchedSkillsText = matchedSkillsMatch ? matchedSkillsMatch[1] : ''
            const matchedSkills = matchedSkillsText
                ? matchedSkillsText.split(',').map(s => s.trim()).filter(Boolean)
                : []

            return {
                id: `job-${index}`,
                company: result.company_name || 'Unknown Company',
                jobSource: result.job_source || 'Job Posting',
                score: result.score,
                skills: matchedSkills,
                missingSkills: result.missing_skills || [],
                isBestMatch: result.is_best_match || false,
                email: result.email,
                email_type: result.email_type,
            }
        })

        // Calculate metrics
        const totalJobs = jobs.length
        const averageScore = jobs.length > 0
            ? Math.round(jobs.reduce((sum, j) => sum + j.score, 0) / jobs.length)
            : 0

        // Mock processing time (could be calculated from actual timing data)
        const processingTime = Math.round(totalJobs * 2.5) // ~2.5 seconds per job

        return {
            jobs,
            totalJobs,
            averageScore,
            processingTime,
        }
    }, [results])

    return (
        <CandidateDashboard
            jobs={adaptedData.jobs}
            totalJobs={adaptedData.totalJobs}
            averageScore={adaptedData.averageScore}
            processingTime={adaptedData.processingTime}
            className={className}
        />
    )
}

export default CandidateDashboardAdapter
