import React from 'react';
import { Box } from '@mui/material';
import Settings from './Settings';
import Instructions from './Instructions';
import JobDescriptionInput from './JobDescriptionInput';
import JobDescriptionDisplay from './JobDescriptionDisplay';
import ResumeUpload from './ResumeUpload';
import ResultsDisplay from './ResultsDisplay';
import { useSettings } from '../contexts/SettingsContext';

const RecruitmentContent: React.FC = () => {
    const { settings, setSettings } = useSettings();

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
            <ResultsDisplay />
        </Box>
    );
};

export default RecruitmentContent;
