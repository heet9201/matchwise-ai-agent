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
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';

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

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
                <SettingsIcon sx={{ mr: 1 }} />
                <Typography variant="h6" component="h2">
                    Recruitment Settings
                </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
                These settings help determine which candidates will be considered qualified for the position.
                You can adjust them based on your recruitment needs.
            </Alert>

            <Box mb={4}>
                <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="subtitle1">Minimum Required Score (%)</Typography>
                    <Tooltip title="Candidates must achieve at least this score to be considered qualified. A higher percentage means more selective screening.">
                        <IconButton size="small" sx={{ ml: 1 }}>
                            <HelpOutlineIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Slider
                    value={settings.minimumScore}
                    onChange={handleScoreChange}
                    valueLabelDisplay="auto"
                    step={5}
                    marks
                    min={0}
                    max={100}
                    sx={{ width: '100%', maxWidth: 400 }}
                />
                <Typography variant="body2" color="textSecondary">
                    Current: {settings.minimumScore}% minimum required score
                </Typography>
            </Box>

            <Box>
                <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="subtitle1">Maximum Allowed Missing Skills</Typography>
                    <Tooltip title="The maximum number of required skills that a candidate can be missing while still being considered qualified. Lower numbers mean candidates must match more required skills.">
                        <IconButton size="small" sx={{ ml: 1 }}>
                            <HelpOutlineIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
                <TextField
                    type="number"
                    value={settings.maxMissingSkills}
                    onChange={handleMissingSkillsChange}
                    inputProps={{ min: 0, max: 10 }}
                    sx={{ width: 100 }}
                    helperText="Enter a number between 0-10"
                />
            </Box>
        </Paper>
    );
};

export default Settings;
