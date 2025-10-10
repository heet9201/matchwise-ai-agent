import React from 'react';
import { Box } from '@mui/material';
import Settings from './Settings';
import Instructions from './Instructions';
import JobDescriptionInput from './JobDescriptionInput';
import JobDescriptionDisplay from './JobDescriptionDisplay';
import ResumeUpload from './ResumeUpload';
import ResultsDisplay from './ResultsDisplay';
import { useSettings } from '../contexts/SettingsContext';
import { useResume } from '../contexts/ResumeContext';

const RecruitmentContent: React.FC = () => {
    const { settings, setSettings } = useSettings();
    const { results } = useResume();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Instructions />
            <Settings
                settings={settings}
                onSettingsChange={setSettings}
            />
            <JobDescriptionInput />
            <JobDescriptionDisplay />
            <ResumeUpload />
            <ResultsDisplay results={(results || []).map(result => ({
                ...result,
                is_best_match: result.is_best_match || false  // Ensure is_best_match is never undefined
            }))} />
        </Box>
    );
};

export default RecruitmentContent;
