import React, { useMemo, useState } from 'react';
import {
    Paper,
    Typography,
    Box,
    Chip,
    Alert,
    IconButton,
    Collapse,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    LightbulbOutlined as LightbulbIcon,
    TrendingUp as TrendingUpIcon,
    AutoAwesome as AutoAwesomeIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    School as SchoolIcon,
    Build as BuildIcon,
    Description as DescriptionIcon,
    EmojiObjects as IdeaIcon,
} from '@mui/icons-material';
import { useMode } from '../contexts/ModeContext';

interface CandidateResult {
    job_source: string;
    company_name: string;
    score: number;
    missing_skills?: string[];
    remarks?: string;
    is_best_match?: boolean;
}

interface ResumeImprovementSuggestionsProps {
    results: CandidateResult[];
}

interface SkillFrequency {
    skill: string;
    frequency: number;
    companies: string[];
}

interface ImprovementSuggestion {
    category: 'critical' | 'important' | 'recommended';
    title: string;
    description: string;
    icon: React.ReactNode;
    actionItems: string[];
}

const ResumeImprovementSuggestions: React.FC<ResumeImprovementSuggestionsProps> = ({ results }) => {
    const { mode } = useMode();
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
        critical: true,
        important: true,
        recommended: false,
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Analyze missing skills across all jobs
    const skillAnalysis = useMemo(() => {
        const skillMap = new Map<string, { frequency: number; companies: Set<string> }>();

        results.forEach(result => {
            if (result.missing_skills && result.missing_skills.length > 0) {
                result.missing_skills.forEach(skill => {
                    const normalizedSkill = skill.trim().toLowerCase();
                    if (!skillMap.has(normalizedSkill)) {
                        skillMap.set(normalizedSkill, { frequency: 0, companies: new Set() });
                    }
                    const data = skillMap.get(normalizedSkill)!;
                    data.frequency += 1;
                    data.companies.add(result.company_name);
                });
            }
        });

        // Convert to array and sort by frequency
        const skillFrequencies: SkillFrequency[] = Array.from(skillMap.entries())
            .map(([skill, data]) => ({
                skill,
                frequency: data.frequency,
                companies: Array.from(data.companies),
            }))
            .sort((a, b) => b.frequency - a.frequency);

        return skillFrequencies;
    }, [results]);

    // Calculate average score
    const avgScore = useMemo(() => {
        if (results.length === 0) return 0;
        const total = results.reduce((sum, result) => sum + result.score, 0);
        return Math.round(total / results.length);
    }, [results]);

    // Generate improvement suggestions
    const suggestions = useMemo((): ImprovementSuggestion[] => {
        const suggestions: ImprovementSuggestion[] = [];

        // Critical: Top 3 most frequently missing skills
        const topMissingSkills = skillAnalysis.slice(0, 3);
        if (topMissingSkills.length > 0) {
            suggestions.push({
                category: 'critical',
                title: '🎯 Add High-Demand Skills',
                description: `These skills are required by ${topMissingSkills[0].frequency} or more job postings you analyzed. Adding them to your resume will significantly increase your match scores.`,
                icon: <WarningIcon sx={{ color: '#f44336' }} />,
                actionItems: topMissingSkills.map(skill =>
                    `Add "${skill.skill}" - Required by ${skill.frequency} job(s) at: ${skill.companies.slice(0, 2).join(', ')}${skill.companies.length > 2 ? '...' : ''}`
                ),
            });
        }

        // Important: Average score improvement
        if (avgScore < 80) {
            const skillsToAdd = skillAnalysis.slice(0, 5).map(s => s.skill);
            suggestions.push({
                category: 'important',
                title: '📈 Boost Your Match Score',
                description: `Your average match score is ${avgScore}%. To reach 80%+ and stand out to employers, focus on these areas:`,
                icon: <TrendingUpIcon sx={{ color: '#ff9800' }} />,
                actionItems: [
                    `Add or expand sections for: ${skillsToAdd.slice(0, 3).join(', ')}`,
                    'Quantify your achievements with metrics (e.g., "Increased sales by 30%")',
                    'Use action verbs and industry-specific keywords from job descriptions',
                    'Ensure your summary/objective aligns with target roles',
                ],
            });
        }

        // Recommended: Skills mentioned by multiple companies
        const commonSkills = skillAnalysis.filter(s => s.frequency >= 2 && s.frequency < topMissingSkills[0]?.frequency);
        if (commonSkills.length > 0) {
            suggestions.push({
                category: 'recommended',
                title: '💡 Enhance Your Competitive Edge',
                description: 'These skills are valued by multiple employers in your target jobs. Adding them will make you more versatile.',
                icon: <IdeaIcon sx={{ color: '#2196f3' }} />,
                actionItems: commonSkills.slice(0, 5).map(skill =>
                    `Consider adding "${skill.skill}" (${skill.frequency} companies: ${skill.companies.join(', ')})`
                ),
            });
        }

        // Resume Structure Recommendations
        suggestions.push({
            category: 'recommended',
            title: '📝 Resume Structure Tips',
            description: 'Optimize your resume format to pass ATS systems and catch recruiters\' attention.',
            icon: <DescriptionIcon sx={{ color: '#4caf50' }} />,
            actionItems: [
                'Place most relevant keywords in the top 1/3 of your resume',
                'Create a dedicated "Skills" or "Technical Skills" section',
                'Tailor your resume for each application using job-specific keywords',
                'Keep resume to 1-2 pages with clear section headers',
                'Use a clean, ATS-friendly format (avoid tables, graphics, or complex layouts)',
            ],
        });

        // Learning Resources
        if (topMissingSkills.length > 0) {
            suggestions.push({
                category: 'recommended',
                title: '🎓 Skill Development Resources',
                description: 'Invest in learning these high-priority skills to expand your opportunities.',
                icon: <SchoolIcon sx={{ color: '#9c27b0' }} />,
                actionItems: [
                    `Priority Learning: ${topMissingSkills.slice(0, 2).map(s => s.skill).join(', ')}`,
                    'Explore free courses on Coursera, edX, or Udemy',
                    'Earn certifications to validate your new skills',
                    'Build portfolio projects demonstrating these skills',
                    'Join relevant communities (LinkedIn groups, Reddit, Discord)',
                ],
            });
        }

        return suggestions;
    }, [skillAnalysis, avgScore]);

    const criticalSuggestions = suggestions.filter(s => s.category === 'critical');
    const importantSuggestions = suggestions.filter(s => s.category === 'important');
    const recommendedSuggestions = suggestions.filter(s => s.category === 'recommended');

    if (!results || results.length === 0) {
        return null;
    }

    return (
        <Paper
            elevation={2}
            sx={{
                p: 4,
                borderRadius: 3,
                background: mode === 'candidate'
                    ? 'linear-gradient(135deg, rgba(24, 17, 43, 0.95) 0%, rgba(45, 27, 61, 0.95) 100%)'
                    : 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
                backdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid',
                borderColor: 'rgba(168, 85, 247, 0.15)',
                boxShadow: '0 8px 32px 0 rgba(168, 85, 247, 0.08)',
            }}
        >
            {/* Header */}
            <Box display="flex" alignItems="center" mb={3}>
                <Box
                    sx={{
                        background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                        borderRadius: '50%',
                        p: 1.5,
                        display: 'flex',
                        mr: 2,
                        boxShadow: '0 4px 16px rgba(168, 85, 247, 0.3)',
                    }}
                >
                    <AutoAwesomeIcon sx={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: 32 }} />
                </Box>
                <Box>
                    <Typography variant="h5" component="h2" fontWeight={600} sx={{ color: 'white' }}>
                        AI-Powered Resume Improvement Plan
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Personalized suggestions based on {results.length} job{results.length !== 1 ? 's' : ''} analyzed
                    </Typography>
                </Box>
            </Box>

            {/* Summary Alert */}
            <Alert
                severity={avgScore >= 80 ? 'success' : avgScore >= 60 ? 'info' : 'warning'}
                icon={<LightbulbIcon />}
                sx={{
                    mb: 3,
                    borderRadius: 2,
                    '& .MuiAlert-message': { width: '100%' },
                }}
            >
                <Typography variant="body2" fontWeight={500}>
                    {avgScore >= 80
                        ? `🎉 Great job! Your average match score is ${avgScore}%. Fine-tune your resume with the suggestions below to maximize your chances.`
                        : avgScore >= 60
                            ? `Your average match score is ${avgScore}%. Follow these recommendations to reach 80%+ and significantly increase interview opportunities.`
                            : `Your average match score is ${avgScore}%. Don't worry! We've identified key areas to improve. Following these suggestions can dramatically increase your match scores.`
                    }
                </Typography>
            </Alert>

            {/* Critical Suggestions */}
            {criticalSuggestions.length > 0 && (
                <Box mb={3}>
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                            cursor: 'pointer',
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'rgba(244, 67, 54, 0.1)',
                            border: '2px solid',
                            borderColor: 'rgba(244, 67, 54, 0.3)',
                            mb: 1,
                        }}
                        onClick={() => toggleSection('critical')}
                    >
                        <Box display="flex" alignItems="center" gap={1}>
                            <WarningIcon sx={{ color: '#f44336' }} />
                            <Typography variant="h6" fontWeight={600} sx={{ color: 'white' }}>
                                Critical Improvements
                            </Typography>
                            <Chip
                                label={criticalSuggestions.length}
                                size="small"
                                sx={{
                                    bgcolor: '#f44336',
                                    color: 'white',
                                    fontWeight: 600,
                                }}
                            />
                        </Box>
                        <IconButton size="small">
                            {expandedSections.critical ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    </Box>
                    <Collapse in={expandedSections.critical}>
                        <Box sx={{ pl: 2, pr: 2, pb: 2 }}>
                            {criticalSuggestions.map((suggestion, idx) => (
                                <Paper
                                    key={idx}
                                    elevation={1}
                                    sx={{
                                        p: 3,
                                        mb: 2,
                                        borderRadius: 2,
                                        border: '1px solid rgba(244, 67, 54, 0.2)',
                                        bgcolor: 'rgba(244, 67, 54, 0.05)',
                                    }}
                                >
                                    <Typography variant="h6" gutterBottom fontWeight={600} sx={{ color: 'white' }}>
                                        {suggestion.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {suggestion.description}
                                    </Typography>
                                    <List dense>
                                        {suggestion.actionItems.map((item, itemIdx) => (
                                            <ListItem key={itemIdx} sx={{ py: 0.5 }}>
                                                <ListItemIcon sx={{ minWidth: 32 }}>
                                                    <CheckCircleIcon sx={{ fontSize: 18, color: '#f44336' }} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={item}
                                                    primaryTypographyProps={{
                                                        variant: 'body2',
                                                        sx: { color: 'rgba(255, 255, 255, 0.9)' },
                                                    }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Paper>
                            ))}
                        </Box>
                    </Collapse>
                </Box>
            )}

            {/* Important Suggestions */}
            {importantSuggestions.length > 0 && (
                <Box mb={3}>
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                            cursor: 'pointer',
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'rgba(255, 152, 0, 0.1)',
                            border: '2px solid',
                            borderColor: 'rgba(255, 152, 0, 0.3)',
                            mb: 1,
                        }}
                        onClick={() => toggleSection('important')}
                    >
                        <Box display="flex" alignItems="center" gap={1}>
                            <TrendingUpIcon sx={{ color: '#ff9800' }} />
                            <Typography variant="h6" fontWeight={600} sx={{ color: 'white' }}>
                                Important Enhancements
                            </Typography>
                            <Chip
                                label={importantSuggestions.length}
                                size="small"
                                sx={{
                                    bgcolor: '#ff9800',
                                    color: 'white',
                                    fontWeight: 600,
                                }}
                            />
                        </Box>
                        <IconButton size="small">
                            {expandedSections.important ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    </Box>
                    <Collapse in={expandedSections.important}>
                        <Box sx={{ pl: 2, pr: 2, pb: 2 }}>
                            {importantSuggestions.map((suggestion, idx) => (
                                <Paper
                                    key={idx}
                                    elevation={1}
                                    sx={{
                                        p: 3,
                                        mb: 2,
                                        borderRadius: 2,
                                        border: '1px solid rgba(255, 152, 0, 0.2)',
                                        bgcolor: 'rgba(255, 152, 0, 0.05)',
                                    }}
                                >
                                    <Typography variant="h6" gutterBottom fontWeight={600} sx={{ color: 'white' }}>
                                        {suggestion.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {suggestion.description}
                                    </Typography>
                                    <List dense>
                                        {suggestion.actionItems.map((item, itemIdx) => (
                                            <ListItem key={itemIdx} sx={{ py: 0.5 }}>
                                                <ListItemIcon sx={{ minWidth: 32 }}>
                                                    <CheckCircleIcon sx={{ fontSize: 18, color: '#ff9800' }} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={item}
                                                    primaryTypographyProps={{
                                                        variant: 'body2',
                                                        sx: { color: 'rgba(255, 255, 255, 0.9)' },
                                                    }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Paper>
                            ))}
                        </Box>
                    </Collapse>
                </Box>
            )}

            {/* Recommended Suggestions */}
            {recommendedSuggestions.length > 0 && (
                <Box>
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                            cursor: 'pointer',
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'rgba(33, 150, 243, 0.1)',
                            border: '2px solid',
                            borderColor: 'rgba(33, 150, 243, 0.3)',
                            mb: 1,
                        }}
                        onClick={() => toggleSection('recommended')}
                    >
                        <Box display="flex" alignItems="center" gap={1}>
                            <IdeaIcon sx={{ color: '#2196f3' }} />
                            <Typography variant="h6" fontWeight={600} sx={{ color: 'white' }}>
                                Recommended Optimizations
                            </Typography>
                            <Chip
                                label={recommendedSuggestions.length}
                                size="small"
                                sx={{
                                    bgcolor: '#2196f3',
                                    color: 'white',
                                    fontWeight: 600,
                                }}
                            />
                        </Box>
                        <IconButton size="small">
                            {expandedSections.recommended ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    </Box>
                    <Collapse in={expandedSections.recommended}>
                        <Box sx={{ pl: 2, pr: 2, pb: 2 }}>
                            {recommendedSuggestions.map((suggestion, idx) => (
                                <Paper
                                    key={idx}
                                    elevation={1}
                                    sx={{
                                        p: 3,
                                        mb: 2,
                                        borderRadius: 2,
                                        border: '1px solid rgba(33, 150, 243, 0.2)',
                                        bgcolor: 'rgba(33, 150, 243, 0.05)',
                                    }}
                                >
                                    <Typography variant="h6" gutterBottom fontWeight={600} sx={{ color: 'white' }}>
                                        {suggestion.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {suggestion.description}
                                    </Typography>
                                    <List dense>
                                        {suggestion.actionItems.map((item, itemIdx) => (
                                            <ListItem key={itemIdx} sx={{ py: 0.5 }}>
                                                <ListItemIcon sx={{ minWidth: 32 }}>
                                                    <CheckCircleIcon sx={{ fontSize: 18, color: '#2196f3' }} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={item}
                                                    primaryTypographyProps={{
                                                        variant: 'body2',
                                                        sx: { color: 'rgba(255, 255, 255, 0.9)' },
                                                    }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Paper>
                            ))}
                        </Box>
                    </Collapse>
                </Box>
            )}

            {/* Action Button */}
            <Box mt={4} display="flex" justifyContent="center">
                <Alert
                    severity="info"
                    icon={<BuildIcon />}
                    sx={{ maxWidth: 800, borderRadius: 2 }}
                >
                    <Typography variant="body2" fontWeight={500}>
                        💪 <strong>Next Step:</strong> Update your resume with the critical improvements above, then re-analyze
                        to see your improved match scores. Small changes can lead to big results!
                    </Typography>
                </Alert>
            </Box>
        </Paper>
    );
};

export default ResumeImprovementSuggestions;
