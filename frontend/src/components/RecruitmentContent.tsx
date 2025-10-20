import React, { useState } from 'react';
import { Box } from '@mui/material';
import Settings from './Settings';
import Instructions from './Instructions';
import JobDescriptionInput from './JobDescriptionInput';
import JobDescriptionDisplay from './JobDescriptionDisplay';
import ResumeUpload from './ResumeUpload';
import ResultsDisplay from './ResultsDisplay';
import CandidateMode from './CandidateMode';
import { useSettings } from '../contexts/SettingsContext';
import { useResume } from '../contexts/ResumeContext';
import { useMode } from '../contexts/ModeContext';
import { JobAnalysisResult } from '../services/api';

const RecruitmentContent: React.FC = () => {
    const { settings, setSettings } = useSettings();
    const { results } = useResume();
    const { mode } = useMode();
    const [candidateResults, setCandidateResults] = useState<JobAnalysisResult[]>([]);

    if (mode === 'candidate') {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <CandidateMode onResultsChange={setCandidateResults} />
                <ResultsDisplay
                    results={candidateResults}
                    isCandidateMode={true}
                />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Instructions isCandidateMode={false} />
            <Settings
                settings={settings}
                onSettingsChange={setSettings}
                isCandidateMode={false}
            />
            <JobDescriptionInput />
            <JobDescriptionDisplay />
            <ResumeUpload />
            <ResultsDisplay
                results={(results || []).map(result => ({
                    ...result,
                    is_best_match: result.is_best_match || false
                }))}
                isCandidateMode={false}
            />
        </Box>
    );
};

export default RecruitmentContent;
