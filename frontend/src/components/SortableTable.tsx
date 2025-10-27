import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'
import { Button } from './ui/button'
import { fadeInUp, staggerItem } from '../lib/animations'
import { cn } from '../lib/cn'
import {
    ChevronUpIcon,
    ChevronDownIcon,
    FunnelIcon,
    ArrowsUpDownIcon,
} from '@heroicons/react/24/outline'

export interface CandidateData {
    id: string
    name: string
    score: number
    email: string
    experience: string
    skills: string[]
    missingSkills: string[]
    isBestMatch?: boolean
}

interface SortableTableProps {
    candidates: CandidateData[]
    onCandidateSelect?: (candidate: CandidateData) => void
    className?: string
}

type SortField = 'name' | 'score' | 'experience'
type SortDirection = 'asc' | 'desc'

const SortableTable: React.FC<SortableTableProps> = ({
    candidates,
    onCandidateSelect,
    className,
}) => {
    const [sortField, setSortField] = useState<SortField>('score')
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
    const [filterScore, setFilterScore] = useState<number>(0)

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('desc')
        }
    }

    const sortedCandidates = [...candidates]
        .filter((c) => c.score >= filterScore)
        .sort((a, b) => {
            let comparison = 0

            switch (sortField) {
                case 'name':
                    comparison = a.name.localeCompare(b.name)
                    break
                case 'score':
                    comparison = a.score - b.score
                    break
                case 'experience':
                    const expA = parseInt(a.experience) || 0
                    const expB = parseInt(b.experience) || 0
                    comparison = expA - expB
                    break
            }

            return sortDirection === 'asc' ? comparison : -comparison
        })

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-400 bg-green-500/10'
        if (score >= 60) return 'text-blue-400 bg-blue-500/10'
        if (score >= 40) return 'text-yellow-400 bg-yellow-500/10'
        return 'text-red-400 bg-red-500/10'
    }

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) {
            return <ArrowsUpDownIcon className="w-4 h-4 text-white/40" />
        }
        return sortDirection === 'asc' ? (
            <ChevronUpIcon className="w-4 h-4 text-primary-400" />
        ) : (
            <ChevronDownIcon className="w-4 h-4 text-primary-400" />
        )
    }

    return (
        <motion.div {...fadeInUp} className={className}>
            <Card className="glassmorphism">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Candidate Rankings</CardTitle>
                            <CardDescription>
                                {sortedCandidates.length} candidates sorted by {sortField}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <FunnelIcon className="w-4 h-4 text-white/60" />
                                <select
                                    value={filterScore}
                                    onChange={(e) => setFilterScore(Number(e.target.value))}
                                    className="bg-slate-800/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary-500"
                                >
                                    <option value={0}>All Scores</option>
                                    <option value={40}>40+ Score</option>
                                    <option value={60}>60+ Score</option>
                                    <option value={80}>80+ Score</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4">
                                        <button
                                            onClick={() => handleSort('name')}
                                            className="flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-colors"
                                        >
                                            Name
                                            <SortIcon field="name" />
                                        </button>
                                    </th>
                                    <th className="text-left py-3 px-4">
                                        <button
                                            onClick={() => handleSort('score')}
                                            className="flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-colors"
                                        >
                                            Score
                                            <SortIcon field="score" />
                                        </button>
                                    </th>
                                    <th className="text-left py-3 px-4">
                                        <button
                                            onClick={() => handleSort('experience')}
                                            className="flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-colors"
                                        >
                                            Experience
                                            <SortIcon field="experience" />
                                        </button>
                                    </th>
                                    <th className="text-left py-3 px-4">
                                        <span className="text-sm font-semibold text-white/80">Skills Match</span>
                                    </th>
                                    <th className="text-right py-3 px-4">
                                        <span className="text-sm font-semibold text-white/80">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="popLayout">
                                    {sortedCandidates.map((candidate, index) => (
                                        <motion.tr
                                            key={candidate.id}
                                            {...staggerItem}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={cn(
                                                'border-b border-white/5 hover:bg-white/5 transition-colors',
                                                candidate.isBestMatch && 'bg-primary-500/10'
                                            )}
                                        >
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold">
                                                        {candidate.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-white flex items-center gap-2">
                                                            {candidate.name}
                                                            {candidate.isBestMatch && (
                                                                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary-500/20 text-primary-300">
                                                                    Best Match
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-white/50">{candidate.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div
                                                    className={cn(
                                                        'inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold',
                                                        getScoreColor(candidate.score)
                                                    )}
                                                >
                                                    {candidate.score}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="text-sm text-white/70">{candidate.experience}</span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {candidate.skills.slice(0, 3).map((skill, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-0.5 text-xs rounded-md bg-primary-500/10 text-primary-300"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {candidate.skills.length > 3 && (
                                                        <span className="px-2 py-0.5 text-xs rounded-md bg-white/5 text-white/50">
                                                            +{candidate.skills.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onCandidateSelect?.(candidate)}
                                                    className="text-primary-400 hover:text-primary-300"
                                                >
                                                    View Details
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>

                        {sortedCandidates.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-white/50">No candidates match the current filter</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

export default SortableTable
