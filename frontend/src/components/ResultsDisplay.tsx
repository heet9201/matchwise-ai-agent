import React, { useState } from 'react';
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
    Button,
    IconButton,
    Tooltip,
} from '@mui/material';
import { useResume } from '../contexts/ResumeContext';
import type { AnalysisResult } from '../types/analysis';
import EmailDisplayDialog from './EmailDisplayDialog';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import StarIcon from '@mui/icons-material/Star';

const ResultsDisplay: React.FC = () => {
    const { results } = useResume();
    const [selectedEmail, setSelectedEmail] = useState<{
        email: string;
        emailType: 'acceptance' | 'rejection';
        candidateName: string;
        score: number;
        isBestMatch: boolean;
    } | null>(null);

    if (!results || results.length === 0) return null;

    // Sort results by score in descending order and then by missing skills
    const sortedResults = [...results].sort((a, b) => {
        // First sort by score
        const scoreDiff = b.score - a.score;
        if (scoreDiff !== 0) return scoreDiff;
        // If scores are equal, sort by number of missing skills
        return (a.missing_skills?.length || 0) - (b.missing_skills?.length || 0);
    });

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Analysis Results
            </Typography>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Resume</TableCell>
                            <TableCell align="center">Score</TableCell>
                            <TableCell>Missing Skills</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Email</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedResults.map((result) => (
                            <TableRow
                                key={result.filename}
                                sx={{
                                    backgroundColor: result.is_best_match
                                        ? 'rgba(76, 175, 80, 0.1)'
                                        : result.email_type === 'acceptance'
                                            ? 'rgba(76, 175, 80, 0.05)'
                                            : 'inherit',
                                }}
                            >
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        {result.is_best_match && (
                                            <Tooltip title="Best Match">
                                                <StarIcon color="primary" fontSize="small" />
                                            </Tooltip>
                                        )}
                                        <Typography>{result.filename}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="center">
                                    <Box display="flex" alignItems="center" justifyContent="center">
                                        <Typography
                                            variant="h6"
                                            color={result.score >= 70 ? 'success.main' : 'error.main'}
                                        >
                                            {result.score}%
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                                        {result.missing_skills.map((skill) => (
                                            <Chip
                                                key={skill}
                                                label={skill}
                                                size="small"
                                                color="error"
                                            />
                                        ))}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        {result.email_type === 'acceptance' ? (
                                            <Chip
                                                icon={<CheckCircleIcon />}
                                                label="Selected for Interview"
                                                color="success"
                                                size="small"
                                            />
                                        ) : (
                                            <Chip
                                                icon={<CancelIcon />}
                                                label="Not Selected"
                                                color="error"
                                                size="small"
                                            />
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell align="center">
                                    {result.email ? (
                                        <Tooltip title="View Email">
                                            <IconButton
                                                onClick={() => setSelectedEmail({
                                                    email: result.email!,
                                                    emailType: result.email_type!,
                                                    candidateName: result.filename,
                                                    score: result.score,
                                                    isBestMatch: result.is_best_match || false,
                                                })}
                                                color={result.email_type === 'acceptance' ? 'success' : 'error'}
                                            >
                                                <EmailIcon />
                                            </IconButton>
                                        </Tooltip>
                                    ) : (
                                        <Tooltip title={result.email_error || 'Email generation failed'}>
                                            <IconButton color="error" disabled>
                                                <EmailIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {selectedEmail && (
                <EmailDisplayDialog
                    open={true}
                    onClose={() => setSelectedEmail(null)}
                    {...selectedEmail}
                />
            )}
        </Paper>
    );
};

export default ResultsDisplay;
