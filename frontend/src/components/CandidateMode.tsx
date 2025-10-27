import React, { useState } from 'react';
import { Box, Button, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CandidateResumeUpload from './CandidateResumeUpload';
import JobDescriptionsUpload, { JobDescription } from './JobDescriptionsUpload';
import AnimatedCard from './AnimatedCard';
import { useSettings } from '../contexts/SettingsContext';
import { apiService, JobAnalysisResult } from '../services/api';
import ProgressOverlay from './ProgressOverlay';
import Settings from './Settings';
import Instructions from './Instructions';
import { useMode } from '../contexts/ModeContext';

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
    const [hasAnalyzed, setHasAnalyzed] = useState(false); // Track if analysis has been done
    const { settings, setSettings } = useSettings();
    const { mode } = useMode();

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
                    setHasAnalyzed(true); // Mark that analysis has been completed
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
        setHasAnalyzed(false); // Reset analysis state
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

            <AnimatedCard delay={0}>
                <Instructions isCandidateMode={true} />
            </AnimatedCard>

            <AnimatedCard delay={0.1}>
                <Settings
                    settings={settings}
                    onSettingsChange={setSettings}
                    isCandidateMode={true}
                    hasResults={hasAnalyzed}
                />
            </AnimatedCard>

            <AnimatedCard delay={0.2}>
                <CandidateResumeUpload resume={resume} onResumeChange={setResume} />
            </AnimatedCard>

            <AnimatedCard delay={0.3}>
                <JobDescriptionsUpload jobs={jobs} onJobsChange={setJobs} />
            </AnimatedCard>

            {error && (
                <AnimatedCard delay={0.4}>
                    <Alert severity="error" onClose={() => setError(null)}>
                        {error}
                    </Alert>
                </AnimatedCard>
            )}

            <AnimatedCard delay={0.4}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                        variant="outlined"
                        onClick={handleClearAll}
                        disabled={isAnalyzing || (!resume && jobs.length === 0)}
                        sx={{
                            borderColor: mode === 'recruiter'
                                ? 'rgba(99, 102, 241, 0.5)'
                                : 'rgba(168, 85, 247, 0.5)',
                            color: mode === 'recruiter'
                                ? 'rgba(147, 197, 253, 1)'
                                : 'rgba(216, 180, 254, 1)',
                            '&:hover': {
                                borderColor: mode === 'recruiter'
                                    ? 'rgba(99, 102, 241, 0.8)'
                                    : 'rgba(168, 85, 247, 0.8)',
                                background: mode === 'recruiter'
                                    ? 'rgba(99, 102, 241, 0.1)'
                                    : 'rgba(168, 85, 247, 0.1)',
                            },
                        }}
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
                            background: mode === 'recruiter'
                                ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                                : 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                            boxShadow: mode === 'recruiter'
                                ? '0 4px 16px rgba(99, 102, 241, 0.4)'
                                : '0 4px 16px rgba(168, 85, 247, 0.4)',
                            '&:hover': {
                                background: mode === 'recruiter'
                                    ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)'
                                    : 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
                                boxShadow: mode === 'recruiter'
                                    ? '0 6px 20px rgba(99, 102, 241, 0.6)'
                                    : '0 6px 20px rgba(168, 85, 247, 0.6)',
                            },
                            '&:disabled': {
                                background: 'rgba(100, 100, 100, 0.3)',
                                color: 'rgba(150, 150, 150, 0.5)',
                            },
                        }}
                    >
                        Analyze Job Matches
                    </Button>
                </Box>
            </AnimatedCard>
        </Box>
    );
};

export default CandidateMode;
