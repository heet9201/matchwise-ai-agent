import React, { useState } from 'react';
import {
    Paper,
    Typography,
    Box,
    Slider,
    Alert,
    Tooltip,
    IconButton,
    Grid,
    Chip,
    Collapse,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import ScoreIcon from '@mui/icons-material/Score';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useMode } from '../contexts/ModeContext';

export interface RecruitmentSettings {
    minimumScore: number;
    maxMissingSkills: number;
}

interface SettingsProps {
    settings: RecruitmentSettings;
    onSettingsChange: (settings: RecruitmentSettings) => void;
    isCandidateMode?: boolean;
    hasResults?: boolean; // New prop to know if analysis has been done
}

export const defaultSettings: RecruitmentSettings = {
    minimumScore: 70,
    maxMissingSkills: 3,
};

const Settings: React.FC<SettingsProps> = ({
    settings,
    onSettingsChange,
    isCandidateMode = false,
    hasResults = false
}) => {
    const { mode } = useMode();
    const [isExpanded, setIsExpanded] = useState(hasResults); // Collapsed initially, expanded after results

    const handleScoreChange = (_: Event, newValue: number | number[]) => {
        onSettingsChange({
            ...settings,
            minimumScore: newValue as number,
        });
    };

    const getScoreLabel = (score: number) => {
        if (isCandidateMode) {
            // Goal-oriented labels for candidates
            if (score >= 90) return 'Dream Jobs Only';
            if (score >= 75) return 'Top Opportunities';
            if (score >= 60) return 'Good Matches';
            return 'All Opportunities';
        }
        // Recruiter labels
        if (score >= 90) return 'Very Selective';
        if (score >= 75) return 'Selective';
        if (score >= 60) return 'Moderate';
        return 'Lenient';
    };

    return (
        <Paper
            elevation={2}
            sx={{
                p: 4,
                mb: 3,
                borderRadius: 3,
                background: mode === 'recruiter'
                    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)'
                    : 'linear-gradient(135deg, rgba(24, 17, 43, 0.95) 0%, rgba(45, 27, 61, 0.95) 100%)',
                backdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid',
                borderColor: mode === 'recruiter'
                    ? 'rgba(99, 102, 241, 0.15)'
                    : 'rgba(168, 85, 247, 0.15)',
                boxShadow: mode === 'recruiter'
                    ? '0 8px 32px 0 rgba(99, 102, 241, 0.08)'
                    : '0 8px 32px 0 rgba(168, 85, 247, 0.08)',
            }}
        >
            {/* Header - Always Visible */}
            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={isCandidateMode && !isExpanded ? 0 : 3}
                sx={{
                    cursor: isCandidateMode ? 'pointer' : 'default',
                    '&:hover': isCandidateMode ? { opacity: 0.9 } : {}
                }}
                onClick={() => isCandidateMode && setIsExpanded(!isExpanded)}
            >
                <Box display="flex" alignItems="center">
                    <Box
                        sx={{
                            background: mode === 'recruiter'
                                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                : 'linear-gradient(135deg, #a855f7, #ec4899)',
                            borderRadius: '50%',
                            p: 1,
                            display: 'flex',
                            mr: 2,
                            boxShadow: mode === 'recruiter'
                                ? '0 4px 16px rgba(99, 102, 241, 0.3)'
                                : '0 4px 16px rgba(168, 85, 247, 0.3)',
                        }}
                    >
                        {isCandidateMode ? (
                            <EmojiEventsIcon sx={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: 28 }} />
                        ) : (
                            <SettingsIcon sx={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: 28 }} />
                        )}
                    </Box>
                    <Box>
                        <Typography variant="h5" component="h2" fontWeight={600}>
                            {isCandidateMode ? 'Your Job Match Goal' : 'Recruitment Settings'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {isCandidateMode
                                ? hasResults
                                    ? 'Adjust your goal to see more or fewer opportunities'
                                    : 'Set your match goal after analyzing jobs'
                                : 'Configure your candidate screening criteria'
                            }
                        </Typography>
                    </Box>
                </Box>

                {isCandidateMode && (
                    <Box display="flex" alignItems="center" gap={2}>
                        {!isExpanded && (
                            <Chip
                                label={`${settings.minimumScore}% Goal`}
                                color="primary"
                                sx={{ fontWeight: 600 }}
                            />
                        )}
                        <IconButton size="small" sx={{ color: 'white' }}>
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    </Box>
                )}
            </Box>

            {/* Collapsible Content for Candidate Mode */}
            <Collapse in={!isCandidateMode || isExpanded}>
                {isCandidateMode && hasResults && (
                    <Alert
                        severity="info"
                        icon={<TrendingUpIcon />}
                        sx={{
                            mb: 4,
                            borderRadius: 2,
                            bgcolor: 'rgba(168, 85, 247, 0.1)',
                            border: '1px solid rgba(168, 85, 247, 0.3)',
                        }}
                    >
                        <Typography variant="body2" fontWeight={500}>
                            🎯 <strong>Set Your Goal:</strong> A 70% match means you meet most job requirements.
                            Increase to 80%+ for top opportunities, or lower to 60% to see more options and improve gradually.
                        </Typography>
                    </Alert>
                )}

                {isCandidateMode && !hasResults && (
                    <Alert
                        severity="success"
                        sx={{
                            mb: 4,
                            borderRadius: 2,
                            bgcolor: 'rgba(76, 175, 80, 0.1)',
                            border: '1px solid rgba(76, 175, 80, 0.3)',
                        }}
                    >
                        <Typography variant="body2">
                            💡 <strong>Tip:</strong> Upload your resume and add job descriptions first.
                            After analysis, you can adjust your match goal here to filter opportunities!
                        </Typography>
                    </Alert>
                )}

                {!isCandidateMode && (
                    <Alert
                        severity="info"
                        sx={{
                            mb: 4,
                            borderRadius: 2,
                            bgcolor: 'primary.lighter',
                        }}
                    >
                        <Typography variant="body2">
                            These settings determine which candidates qualify for interviews. Adjust them based on your hiring needs and role requirements.
                        </Typography>
                    </Alert>
                )}

                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <Paper
                            elevation={1}
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                border: '2px solid',
                                borderColor: 'primary.light',
                                bgcolor: 'background.paper',
                            }}
                        >
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                                <Box display="flex" alignItems="center">
                                    <ScoreIcon sx={{ color: 'primary.main', mr: 1 }} />
                                    <Typography variant="h6" fontWeight={600}>
                                        Minimum Score
                                    </Typography>
                                </Box>
                                <Tooltip title={isCandidateMode
                                    ? "Jobs must have at least this match score to be considered good matches. A higher percentage means you're being more selective about opportunities."
                                    : "Candidates must achieve at least this score to receive acceptance emails. A higher percentage means more selective screening."
                                }>
                                    <IconButton size="small">
                                        <HelpOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            <Box sx={{ px: 1 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Chip
                                        label={getScoreLabel(settings.minimumScore)}
                                        color="primary"
                                        size="small"
                                    />
                                    <Typography
                                        variant="h4"
                                        color="primary.main"
                                        fontWeight={700}
                                    >
                                        {settings.minimumScore}%
                                    </Typography>
                                </Box>
                                <Slider
                                    value={settings.minimumScore}
                                    onChange={handleScoreChange}
                                    valueLabelDisplay="auto"
                                    step={5}
                                    marks={[
                                        { value: 0, label: '0%' },
                                        { value: 50, label: '50%' },
                                        { value: 100, label: '100%' },
                                    ]}
                                    min={0}
                                    max={100}
                                    sx={{
                                        '& .MuiSlider-thumb': {
                                            width: 24,
                                            height: 24,
                                        },
                                        '& .MuiSlider-track': {
                                            height: 8,
                                        },
                                        '& .MuiSlider-rail': {
                                            height: 8,
                                        },
                                    }}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    {isCandidateMode
                                        ? 'Lower goal = More opportunities | Higher goal = Better matches'
                                        : 'Lower scores = More candidates qualify | Higher scores = More selective'}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {isCandidateMode && hasResults && (
                    <Box mt={3}>
                        <Alert
                            severity="success"
                            sx={{
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'success.light',
                            }}
                        >
                            <Typography variant="body2" fontWeight={500}>
                                ✅ Current Goal: Jobs need at least <strong>{settings.minimumScore}%</strong> match to be shown as good opportunities.
                                {settings.minimumScore >= 80 && ' 🌟 Aiming high! Focus on top matches.'}
                                {settings.minimumScore >= 60 && settings.minimumScore < 80 && ' 💪 Balanced approach! Good mix of opportunities.'}
                                {settings.minimumScore < 60 && ' 🎯 Exploring widely! More opportunities to consider.'}
                            </Typography>
                        </Alert>
                    </Box>
                )}

                {!isCandidateMode && (
                    <Box mt={3}>
                        <Alert
                            severity="success"
                            sx={{
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'success.light',
                            }}
                        >
                            <Typography variant="body2" fontWeight={500}>
                                ✅ Current settings: Candidates need at least <strong>{settings.minimumScore}%</strong> match to receive acceptance emails.
                            </Typography>
                        </Alert>
                    </Box>
                )}
            </Collapse>
        </Paper>
    );
};

export default Settings;
