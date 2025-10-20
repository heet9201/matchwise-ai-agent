import React, { useState } from 'react';
import { Box, Button, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CandidateResumeUpload from './CandidateResumeUpload';
import JobDescriptionsUpload, { JobDescription } from './JobDescriptionsUpload';
import { useSettings } from '../contexts/SettingsContext';
import { apiService, JobAnalysisResult } from '../services/api';
import ProgressOverlay from './ProgressOverlay';
import Settings from './Settings';
import Instructions from './Instructions';

interface CandidateModeProps {
    onResultsChange: (results: JobAnalysisResult[]) => void;
}

const CandidateMode: React.FC<CandidateModeProps> = ({ onResultsChange }) => {
    const [resume, setResume] = useState<File | null>(null);
    const [jobs, setJobs] = useState<JobDescription[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');
    const { settings, setSettings } = useSettings();

    const handleAnalyze = async () => {
        if (!resume) {
            setError('Please upload your resume first');
            return;
        }

        if (jobs.length === 0) {
            setError('Please add at least one job description');
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setProgress(0);
        setProgressMessage('Starting job analysis...');

        try {
            const formData = new FormData();
            formData.append('resume', resume);
            formData.append('minimum_score', settings.minimumScore.toString());
            formData.append('max_missing_skills', settings.maxMissingSkills.toString());

            // Add text-based jobs
            const textJobs = jobs.filter(j => j.type === 'text');
            const fileJobs = jobs.filter(j => j.type === 'file');
            const urlJobs = jobs.filter(j => j.type === 'url');

            textJobs.forEach(job => {
                formData.append('job_texts', job.content as string);
            });

            fileJobs.forEach(job => {
                formData.append('job_files', job.content as File);
            });

            urlJobs.forEach(job => {
                formData.append('job_urls', job.content as string);
            });

            // Company names
            jobs.forEach(job => {
                formData.append('company_names', job.companyName);
            });

            let allResults: JobAnalysisResult[] = [];

            await apiService.analyzeJobsStream(formData, (update) => {
                if (update.type === 'progress') {
                    const percentage = update.percentage || 0;
                    setProgress(percentage);

                    if (update.status === 'analyzing') {
                        setProgressMessage(`Analyzing ${update.company_name || 'job'}...`);
                    } else if (update.status === 'generating_email') {
                        setProgressMessage(`Generating application email for ${update.company_name || 'job'}...`);
                    } else if (update.status === 'complete') {
                        if (update.result) {
                            const existingIndex = allResults.findIndex(
                                r => r.job_source === (update.result as JobAnalysisResult).job_source
                            );
                            if (existingIndex >= 0) {
                                allResults[existingIndex] = update.result as JobAnalysisResult;
                            } else {
                                allResults.push(update.result as JobAnalysisResult);
                            }
                            onResultsChange([...allResults]);
                        }
                    }
                } else if (update.type === 'complete') {
                    if (update.results) {
                        allResults = update.results as JobAnalysisResult[];
                        onResultsChange(allResults);
                    }
                    setProgressMessage('Analysis complete!');
                }
            });

            setIsAnalyzing(false);
        } catch (err) {
            console.error('Job analysis error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to analyze jobs';
            setError(errorMessage);
            setIsAnalyzing(false);
            setProgress(0);
        }
    };

    const handleClearAll = () => {
        setResume(null);
        setJobs([]);
        setError(null);
        setProgress(0);
        setProgressMessage('');
        onResultsChange([]);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {isAnalyzing && (
                <ProgressOverlay
                    progress={progress}
                    message={progressMessage}
                />
            )}

            <Instructions isCandidateMode={true} />

            <Settings settings={settings} onSettingsChange={setSettings} isCandidateMode={true} />

            <CandidateResumeUpload resume={resume} onResumeChange={setResume} />

            <JobDescriptionsUpload jobs={jobs} onJobsChange={setJobs} />

            {error && (
                <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                    variant="outlined"
                    onClick={handleClearAll}
                    disabled={isAnalyzing || (!resume && jobs.length === 0)}
                >
                    Clear All
                </Button>
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleAnalyze}
                    disabled={!resume || jobs.length === 0 || isAnalyzing}
                    startIcon={<SendIcon />}
                    sx={{
                        background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #7b1fa2 0%, #6a1b9a 100%)',
                        },
                    }}
                >
                    Analyze Job Matches
                </Button>
            </Box>
        </Box>
    );
};

export default CandidateMode;
