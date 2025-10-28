import React, { useState, useMemo } from 'react';
import {
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Box,
    IconButton,
    Tooltip,
    Collapse,
    Grid
} from '@mui/material';
import EmailDisplayDialog from './EmailDisplayDialog';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import StarIcon from '@mui/icons-material/Star';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';

interface BaseResult {
    score: number;
    is_best_match?: boolean;
    email_type?: 'acceptance' | 'rejection' | 'application' | 'no_application';
    missing_skills?: string[];
    remarks?: string;
    email?: string;
}

interface RecruiterResult extends BaseResult {
    filename: string;
}

interface CandidateResult extends BaseResult {
    job_source: string;
    company_name: string;
}

interface ResultsDisplayProps {
    results: Array<RecruiterResult | CandidateResult>;
    isCandidateMode?: boolean;
}

const isCandidateResult = (result: RecruiterResult | CandidateResult): result is CandidateResult => {
    return 'job_source' in result;
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, isCandidateMode = false }) => {
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [selectedEmail, setSelectedEmail] = useState<{
        email: string;
        emailType: 'acceptance' | 'rejection' | 'application' | 'no_application';
        name: string;
        score: number;
        isBestMatch: boolean;
    } | null>(null);

    const getResultKey = (result: RecruiterResult | CandidateResult): string => {
        return isCandidateResult(result) ? result.job_source : result.filename;
    };

    const getResultName = (result: RecruiterResult | CandidateResult): string => {
        return isCandidateResult(result) ? result.company_name : result.filename;
    };

    const toggleRow = (key: string) => {
        setExpandedRow(expandedRow === key ? null : key);
    };

    const handleEmailClick = (result: RecruiterResult | CandidateResult) => {
        console.log('Email icon clicked:', {
            email: result.email,
            emailType: result.email_type,
            hasEmail: !!result.email,
            hasEmailType: !!result.email_type,
        });

        if (result.email_type) {
            setSelectedEmail({
                email: result.email || '',
                emailType: result.email_type,
                name: getResultName(result),
                score: result.score,
                isBestMatch: result.is_best_match || false,
            });
        } else {
            console.warn('Email type is missing, cannot open dialog');
        }
    };

    const { qualifiedCount, avgScore } = useMemo(() => {
        if (!results.length) return { qualifiedCount: 0, avgScore: 0 };

        const qualified = results.filter(r => r.score >= 70);
        const total = results.reduce((sum, r) => sum + r.score, 0);

        return {
            qualifiedCount: qualified.length,
            avgScore: Math.round(total / results.length)
        };
    }, [results]);

    const sortedResults = useMemo(() => {
        return [...results].sort((a, b) => {
            if (a.is_best_match !== b.is_best_match) {
                return a.is_best_match ? -1 : 1;
            }
            return b.score - a.score;
        });
    }, [results]);

    if (!results || results.length === 0) {
        return null;
    }

    return (
        <Paper elevation={2}>
            <Box p={2} mb={2}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                    {isCandidateMode ? <WorkIcon color="primary" /> : <PersonIcon color="primary" />}
                    <Typography variant="h6">
                        {isCandidateMode ? 'Job Match Results' : 'Analysis Results'}
                    </Typography>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <Paper elevation={3} sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
                            <Typography variant="subtitle2">
                                {isCandidateMode ? 'Total Jobs' : 'Total Candidates'}
                            </Typography>
                            <Typography variant="h4">{results.length}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper elevation={3} sx={{ p: 2, bgcolor: 'success.light', color: 'white' }}>
                            <Typography variant="subtitle2">
                                {isCandidateMode ? 'Good Matches' : 'Qualified Candidates'}
                            </Typography>
                            <Typography variant="h4">{qualifiedCount}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper elevation={3} sx={{ p: 2, bgcolor: 'info.light', color: 'white' }}>
                            <Typography variant="subtitle2">Average Score</Typography>
                            <Typography variant="h4">{avgScore}%</Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: '30%' }}>
                                {isCandidateMode ? 'Company / Job' : 'Resume'}
                            </TableCell>
                            <TableCell>Score</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Missing Skills</TableCell>
                            <TableCell align="center">Details</TableCell>
                            <TableCell align="center">Email</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedResults.map((result) => {
                            const resultKey = getResultKey(result);
                            const resultName = getResultName(result);
                            const isQualified = result.score >= 70;

                            return (
                                <React.Fragment key={resultKey}>
                                    <TableRow
                                        hover
                                        sx={{
                                            '& > *': { borderBottom: expandedRow === resultKey ? 'none' : 'inherit' },
                                            backgroundColor: result.is_best_match
                                                ? 'rgba(76, 175, 80, 0.1)'
                                                : (result.email_type === 'acceptance' || result.email_type === 'application')
                                                    ? 'rgba(76, 175, 80, 0.05)'
                                                    : 'inherit'
                                        }}
                                    >
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {result.is_best_match && (
                                                    <Tooltip title="Best Match">
                                                        <StarIcon color="warning" />
                                                    </Tooltip>
                                                )}
                                                {resultName}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={`${result.score}%`}
                                                color={isQualified ? 'success' : 'warning'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={isQualified ? <CheckCircleIcon /> : <CancelIcon />}
                                                label={isQualified ? 'Good Match' : 'Weak Match'}
                                                color={isQualified ? 'success' : 'error'}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                {result.missing_skills?.map((skill) => (
                                                    <Chip
                                                        key={skill}
                                                        label={skill}
                                                        size="small"
                                                        color="default"
                                                        variant="outlined"
                                                    />
                                                ))}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title={expandedRow === resultKey ? "Hide Details" : "Show Details"}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => toggleRow(resultKey)}
                                                >
                                                    {expandedRow === resultKey ? (
                                                        <ExpandLessIcon />
                                                    ) : (
                                                        <ExpandMoreIcon />
                                                    )}
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                <Tooltip title={isCandidateMode ? "View Cover Letter" : "View Email"}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEmailClick(result)}
                                                        disabled={!result.email_type || result.email_type === 'no_application'}
                                                    >
                                                        <EmailIcon
                                                            color={result.email_type && result.email_type !== 'no_application' ? 'primary' : 'disabled'}
                                                            fontSize="small"
                                                        />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                    {expandedRow === resultKey && (
                                        <TableRow>
                                            <TableCell colSpan={6} sx={{ py: 0 }}>
                                                <Collapse in={expandedRow === resultKey}>
                                                    <Box sx={{ p: 2 }}>
                                                        <Typography variant="h6" gutterBottom>
                                                            Remarks
                                                        </Typography>
                                                        <Box sx={{ mb: 2 }}>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {result.remarks || 'No remarks available.'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Collapse>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            )
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            {selectedEmail && (
                <EmailDisplayDialog
                    email={selectedEmail.email}
                    emailType={selectedEmail.emailType}
                    candidateName={selectedEmail.name}
                    score={selectedEmail.score}
                    isBestMatch={selectedEmail.isBestMatch}
                    open={Boolean(selectedEmail)}
                    onClose={() => setSelectedEmail(null)}
                />
            )}
        </Paper>
    );
};

export default ResultsDisplay;