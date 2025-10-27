import React, { useMemo } from 'react'
import Dashboard from './Dashboard'
import { CandidateData } from './SortableTable'

interface BaseResult {
    score: number
    is_best_match?: boolean
    missing_skills?: string[]
    remarks?: string
    email?: string
}

interface RecruiterResult extends BaseResult {
    filename: string
}

interface DashboardAdapterProps {
    results: RecruiterResult[]
    className?: string
}

/**
 * DashboardAdapter
 * 
 * Converts API results (AnalysisResult[]) to the format expected by Dashboard component.
 * Extracts skills from remarks/filenames and adapts the data structure.
 */
const DashboardAdapter: React.FC<DashboardAdapterProps> = ({ results, className }) => {
    const adaptedData = useMemo(() => {
        const candidates: CandidateData[] = results.map((result, index) => {
            // Extract name from filename (remove extension)
            const name = result.filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')

            // Try to extract skills from remarks or use empty array
            const skillsMatch = result.remarks?.match(/Skills?:\s*([^.]+)/i)
            const skillsText = skillsMatch ? skillsMatch[1] : ''
            const skills = skillsText
                ? skillsText.split(',').map(s => s.trim()).filter(Boolean)
                : []

            // Extract experience from remarks or default
            const experienceMatch = result.remarks?.match(/(\d+)\s*years?/i)
            const experience = experienceMatch ? `${experienceMatch[1]} years` : 'N/A'

            return {
                id: `candidate-${index}`,
                name,
                score: result.score,
                email: result.email || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
                experience,
                skills,
                missingSkills: result.missing_skills || [],
                isBestMatch: result.is_best_match || false,
            }
        })

        // Calculate metrics
        const totalResumes = candidates.length
        const averageScore = candidates.length > 0
            ? Math.round(candidates.reduce((sum, c) => sum + c.score, 0) / candidates.length)
            : 0

        // Mock processing time (could be calculated from actual timing data)
        const processingTime = Math.round(totalResumes * 1.8) // ~1.8 seconds per resume

        return {
            candidates,
            totalResumes,
            averageScore,
            processingTime,
        }
    }, [results])

    return (
        <Dashboard
            candidates={adaptedData.candidates}
            totalResumes={adaptedData.totalResumes}
            averageScore={adaptedData.averageScore}
            processingTime={adaptedData.processingTime}
            className={className}
        />
    )
}

export default DashboardAdapter
