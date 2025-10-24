import React, { useState } from 'react';
import { Box } from '@mui/material';
import Settings from './Settings';
import Instructions from './Instructions';
import JobDescriptionInput from './JobDescriptionInput';
import JobDescriptionDisplay from './JobDescriptionDisplay';
import ResumeUpload from './ResumeUpload';
import ResultsDisplay from './ResultsDisplay';
import CandidateMode from './CandidateMode';
import AnimatedCard from './AnimatedCard';
import { useSettings } from '../contexts/SettingsContext';
import { useResume } from '../contexts/ResumeContext';
import { useMode } from '../contexts/ModeContext';
import { useJobDescription } from '../contexts/JobDescriptionContext';
import { JobAnalysisResult } from '../services/api';

const RecruitmentContent: React.FC = () => {
    const { settings, setSettings } = useSettings();
    const { results } = useResume();
    const { mode } = useMode();
    const { jobDescription } = useJobDescription();
    const [candidateResults, setCandidateResults] = useState<JobAnalysisResult[]>([]);

    if (mode === 'candidate') {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <CandidateMode onResultsChange={setCandidateResults} />

                {candidateResults.length > 0 && (
                    <AnimatedCard delay={0.5}>
                        <ResultsDisplay
                            results={candidateResults}
                            isCandidateMode={true}
                        />
                    </AnimatedCard>
                )}
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <AnimatedCard delay={0}>
                <Instructions isCandidateMode={false} />
            </AnimatedCard>

            <AnimatedCard delay={0.1}>
                <Settings
                    settings={settings}
                    onSettingsChange={setSettings}
                    isCandidateMode={false}
                />
            </AnimatedCard>

            <AnimatedCard delay={0.2}>
                <JobDescriptionInput />
            </AnimatedCard>

            {jobDescription && jobDescription.trim() !== '' && (
                <AnimatedCard delay={0.3}>
                    <JobDescriptionDisplay />
                </AnimatedCard>
            )}

            <AnimatedCard delay={0.4}>
                <ResumeUpload />
            </AnimatedCard>

            {results && results.length > 0 && (
                <AnimatedCard delay={0.5}>
                    <ResultsDisplay
                        results={(results || []).map(result => ({
                            ...result,
                            is_best_match: result.is_best_match || false
                        }))}
                        isCandidateMode={false}
                    />
                </AnimatedCard>
            )}
        </Box>
    );
};

export default RecruitmentContent;
