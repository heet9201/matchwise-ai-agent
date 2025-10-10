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
    Collapse
} from '@mui/material';
import EmailDisplayDialog from './EmailDisplayDialog';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import StarIcon from '@mui/icons-material/Star';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface ResultsDisplayProps {
    results: Array<{
        filename: string;
        score: number;
        is_best_match: boolean;
        email_type?: 'acceptance' | 'rejection';
        missing_skills?: string[];
        remarks?: string;
        email?: string;
    }>;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [selectedEmail, setSelectedEmail] = useState<{
        email: string;
        emailType: 'acceptance' | 'rejection';
        candidateName: string;
        score: number;
        isBestMatch: boolean;
    } | null>(null);

    const toggleRow = (filename: string) => {
        setExpandedRow(expandedRow === filename ? null : filename);
    };

    const handleEmailClick = (result: any) => {
        if (result.email_type) {
            setSelectedEmail({
                email: result.email || '',
                emailType: result.email_type,
                candidateName: result.filename,
                score: result.score,
                isBestMatch: result.is_best_match,
            });
        }
    };

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
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: '30%' }}>Resume</TableCell>
                            <TableCell>Score</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Missing Skills</TableCell>
                            <TableCell align="center">Details</TableCell>
                            <TableCell align="center">Email</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedResults.map((result) => (
                            <React.Fragment key={result.filename}>
                                <TableRow
                                    hover
                                    sx={{
                                        '& > *': { borderBottom: expandedRow === result.filename ? 'none' : 'inherit' },
                                        backgroundColor: result.is_best_match
                                            ? 'rgba(76, 175, 80, 0.1)'
                                            : result.email_type === 'acceptance'
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
                                            {result.filename}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={`${result.score}%`}
                                            color={result.score >= 70 ? 'success' : 'warning'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            icon={result.score >= 70 ? <CheckCircleIcon /> : <CancelIcon />}
                                            label={result.score >= 70 ? 'Qualified' : 'Not Qualified'}
                                            color={result.score >= 70 ? 'success' : 'error'}
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
                                        <Tooltip title={expandedRow === result.filename ? "Hide Details" : "Show Details"}>
                                            <IconButton
                                                size="small"
                                                onClick={() => toggleRow(result.filename)}
                                            >
                                                {expandedRow === result.filename ? (
                                                    <ExpandLessIcon />
                                                ) : (
                                                    <ExpandMoreIcon />
                                                )}
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                            <Tooltip title="View Email">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEmailClick(result)}
                                                    disabled={!result.email_type}
                                                >
                                                    <EmailIcon
                                                        color={result.email_type ? 'primary' : 'disabled'}
                                                        fontSize="small"
                                                    />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                                {expandedRow === result.filename && (
                                    <TableRow>
                                        <TableCell colSpan={6} sx={{ py: 0 }}>
                                            <Collapse in={expandedRow === result.filename}>
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
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {selectedEmail && (
                <EmailDisplayDialog
                    email={selectedEmail.email}
                    emailType={selectedEmail.emailType}
                    candidateName={selectedEmail.candidateName}
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