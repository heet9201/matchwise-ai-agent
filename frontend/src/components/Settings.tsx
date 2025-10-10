import React from 'react';
import {
    Paper,
    Typography,
    Box,
    Slider,
    TextField,
    Alert,
    Tooltip,
    IconButton,
    Grid,
    Chip,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import ScoreIcon from '@mui/icons-material/Score';
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove';

export interface RecruitmentSettings {
    minimumScore: number;
    maxMissingSkills: number;
}

interface SettingsProps {
    settings: RecruitmentSettings;
    onSettingsChange: (settings: RecruitmentSettings) => void;
}

export const defaultSettings: RecruitmentSettings = {
    minimumScore: 70,
    maxMissingSkills: 3,
};

const Settings: React.FC<SettingsProps> = ({ settings, onSettingsChange }) => {
    const handleScoreChange = (_: Event, newValue: number | number[]) => {
        onSettingsChange({
            ...settings,
            minimumScore: newValue as number,
        });
    };

    const handleMissingSkillsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(0, Math.min(10, Number(event.target.value)));
        onSettingsChange({
            ...settings,
            maxMissingSkills: value,
        });
    };

    const getScoreLabel = (score: number) => {
        if (score >= 90) return 'Very Selective';
        if (score >= 75) return 'Selective';
        if (score >= 60) return 'Moderate';
        return 'Lenient';
    };

    const getSkillsLabel = (skills: number) => {
        if (skills === 0) return 'Perfect Match Only';
        if (skills <= 2) return 'High Standards';
        if (skills <= 5) return 'Balanced';
        return 'Flexible';
    };

    return (
        <Paper
            elevation={2}
            sx={{
                p: 4,
                mb: 3,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                border: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Box display="flex" alignItems="center" mb={3}>
                <Box
                    sx={{
                        bgcolor: 'primary.main',
                        borderRadius: '50%',
                        p: 1,
                        display: 'flex',
                        mr: 2,
                    }}
                >
                    <SettingsIcon sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                <Box>
                    <Typography variant="h5" component="h2" fontWeight={600}>
                        Recruitment Settings
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Configure your candidate screening criteria
                    </Typography>
                </Box>
            </Box>

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

            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
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
                            <Tooltip title="Candidates must achieve at least this score to be considered qualified. A higher percentage means more selective screening.">
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
                                Lower scores = More candidates qualify
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={1}
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            border: '2px solid',
                            borderColor: 'secondary.light',
                            bgcolor: 'background.paper',
                        }}
                    >
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                            <Box display="flex" alignItems="center">
                                <PlaylistRemoveIcon sx={{ color: 'secondary.main', mr: 1 }} />
                                <Typography variant="h6" fontWeight={600}>
                                    Missing Skills
                                </Typography>
                            </Box>
                            <Tooltip title="The maximum number of required skills that a candidate can be missing while still being considered qualified. Lower numbers mean candidates must match more required skills.">
                                <IconButton size="small">
                                    <HelpOutlineIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>

                        <Box sx={{ px: 1 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                <Chip
                                    label={getSkillsLabel(settings.maxMissingSkills)}
                                    color="secondary"
                                    size="small"
                                />
                                <Typography
                                    variant="h4"
                                    color="secondary.main"
                                    fontWeight={700}
                                >
                                    {settings.maxMissingSkills}
                                </Typography>
                            </Box>
                            <TextField
                                type="number"
                                value={settings.maxMissingSkills}
                                onChange={handleMissingSkillsChange}
                                inputProps={{
                                    min: 0,
                                    max: 10,
                                    style: {
                                        fontSize: '1.5rem',
                                        fontWeight: 600,
                                        textAlign: 'center'
                                    }
                                }}
                                fullWidth
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    },
                                }}
                                helperText="Enter a number between 0-10"
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Lower values = Stricter requirements
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

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
                        ✅ Current settings: Candidates need at least <strong>{settings.minimumScore}%</strong> match
                        and can miss up to <strong>{settings.maxMissingSkills}</strong> required skills to qualify for interviews.
                    </Typography>
                </Alert>
            </Box>
        </Paper>
    );
};

export default Settings;
