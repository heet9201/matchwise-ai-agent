import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Chip,
    Stack,
    Card,
    CardContent,
    IconButton,
    Divider,
    Alert,
    CircularProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Menu,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    ThumbUp as ThumbUpIcon,
    BugReport as BugIcon,
    Lightbulb as IdeaIcon,
    Error as ErrorIcon,
    Refresh as RefreshIcon,
    Timeline as TimelineIcon,
    Download as DownloadIcon,
    InsertDriveFile as JsonIcon,
    TableChart as CsvIcon,
    Description as ExcelIcon,
} from '@mui/icons-material';
import { apiService, FeedbackResponse } from '../services/api';
import AnimatedCard from './AnimatedCard';

const FeedbackViewer: React.FC = () => {
    const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>('all');
    const [stats, setStats] = useState<any>(null);
    const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

    const feedbackTypeConfig = {
        feature_liked: {
            label: '👍 Feature Liked',
            icon: <ThumbUpIcon />,
            color: '#4caf50',
        },
        not_working: {
            label: '⚠️ Not Working',
            icon: <ErrorIcon />,
            color: '#ff9800',
        },
        improvement: {
            label: '💡 Improvement',
            icon: <IdeaIcon />,
            color: '#2196f3',
        },
        bug_report: {
            label: '🐛 Bug Report',
            icon: <BugIcon />,
            color: '#f44336',
        },
        other: {
            label: '📝 Other',
            icon: <TimelineIcon />,
            color: '#9e9e9e',
        },
    };

    const loadFeedbacks = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiService.getFeedbacks(
                undefined,
                filter === 'all' ? undefined : filter
            );
            setFeedbacks(response.feedbacks);

            const statsData = await apiService.getFeedbackStats();
            setStats(statsData.stats);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load feedbacks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFeedbacks();
    }, [filter]);

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        });
    };

    const getTypeConfig = (type: string) => {
        return feedbackTypeConfig[type as keyof typeof feedbackTypeConfig] || feedbackTypeConfig.other;
    };

    // Export Functions
    const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setExportMenuAnchor(event.currentTarget);
    };

    const handleExportMenuClose = () => {
        setExportMenuAnchor(null);
    };

    const formatFullDate = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const exportToJSON = () => {
        const dataToExport = feedbacks.map(fb => ({
            id: fb.id,
            type: fb.feedback_type,
            type_label: getTypeConfig(fb.feedback_type).label,
            message: fb.message,
            feature_name: fb.feature_name || 'N/A',
            page: fb.page || 'N/A',
            timestamp: formatFullDate(fb.timestamp),
            timestamp_iso: fb.timestamp,
        }));

        const exportData = {
            export_date: new Date().toISOString(),
            total_feedbacks: feedbacks.length,
            filter_applied: filter === 'all' ? 'None' : getTypeConfig(filter).label,
            feedbacks: dataToExport,
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `feedbacks-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        handleExportMenuClose();
    };

    const exportToCSV = () => {
        const headers = ['ID', 'Type', 'Message', 'Feature/Page', 'Source Page', 'Timestamp'];
        const rows = feedbacks.map(fb => [
            fb.id,
            getTypeConfig(fb.feedback_type).label,
            `"${fb.message.replace(/"/g, '""')}"`, // Escape quotes in message
            fb.feature_name || 'N/A',
            fb.page || 'N/A',
            formatFullDate(fb.timestamp),
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `feedbacks-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        handleExportMenuClose();
    };

    const exportToExcel = () => {
        // Create HTML table format that Excel can read
        const headers = ['ID', 'Type', 'Message', 'Feature/Page', 'Source Page', 'Timestamp'];
        const rows = feedbacks.map(fb => [
            fb.id,
            getTypeConfig(fb.feedback_type).label,
            fb.message,
            fb.feature_name || 'N/A',
            fb.page || 'N/A',
            formatFullDate(fb.timestamp),
        ]);

        let htmlContent = `
            <html xmlns:x="urn:schemas-microsoft-com:office:excel">
            <head>
                <meta charset="UTF-8">
                <style>
                    table { border-collapse: collapse; width: 100%; }
                    th { background-color: #667eea; color: white; padding: 8px; border: 1px solid #ddd; font-weight: bold; }
                    td { padding: 8px; border: 1px solid #ddd; }
                    tr:nth-child(even) { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                <table>
                    <thead>
                        <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
                    </thead>
                    <tbody>
        `;

        rows.forEach(row => {
            htmlContent += '<tr>';
            row.forEach(cell => {
                htmlContent += `<td>${String(cell).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`;
            });
            htmlContent += '</tr>';
        });

        htmlContent += `
                    </tbody>
                </table>
            </body>
            </html>
        `;

        const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `feedbacks-export-${new Date().toISOString().split('T')[0]}.xls`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        handleExportMenuClose();
    };

    return (
        <Box sx={{
            p: 3,
            maxWidth: 1200,
            mx: 'auto',
            minHeight: '100vh',
            bgcolor: 'rgba(15, 23, 42, 0.95)',
        }}>
            {/* Header */}
            <AnimatedCard delay={0}>
                <Box
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        p: 4,
                        borderRadius: 2,
                        mb: 3,
                        color: 'white',
                    }}
                >
                    <Typography variant="h4" fontWeight={700} mb={1}>
                        📊 Feedback Dashboard
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        Monitor user feedback and insights
                    </Typography>
                </Box>
            </AnimatedCard>

            {/* Stats Cards */}
            {stats && (
                <AnimatedCard delay={0.1}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3}>
                        <Card
                            sx={{
                                flex: 1,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                            }}
                        >
                            <CardContent>
                                <Typography variant="h3" fontWeight={700}>
                                    {stats.total}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    Total Feedbacks
                                </Typography>
                            </CardContent>
                        </Card>

                        {Object.entries(stats.by_type || {}).map(([type, count]: [string, any]) => {
                            const config = getTypeConfig(type);
                            return (
                                <Card
                                    key={type}
                                    sx={{
                                        flex: 1,
                                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                    }}
                                >
                                    <CardContent>
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <Box sx={{ color: config.color }}>{config.icon}</Box>
                                            <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
                                                {count}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                            {config.label}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Stack>
                </AnimatedCard>
            )}

            {/* Filter and Refresh */}
            <AnimatedCard delay={0.2}>
                <Paper
                    sx={{
                        p: 2,
                        mb: 3,
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="center">
                        <FormControl
                            size="small"
                            sx={{
                                minWidth: 200,
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    color: 'white',
                                    '& fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.15)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#667eea',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'rgba(255, 255, 255, 0.6)',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#667eea',
                                },
                                '& .MuiSelect-icon': {
                                    color: 'rgba(255, 255, 255, 0.6)',
                                },
                            }}
                        >
                            <InputLabel>Filter by Type</InputLabel>
                            <Select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                label="Filter by Type"
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            bgcolor: 'rgba(15, 23, 42, 0.98)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            '& .MuiMenuItem-root': {
                                                color: 'white',
                                                '&:hover': {
                                                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                                                },
                                                '&.Mui-selected': {
                                                    bgcolor: 'rgba(102, 126, 234, 0.3)',
                                                    '&:hover': {
                                                        bgcolor: 'rgba(102, 126, 234, 0.4)',
                                                    },
                                                },
                                            },
                                        },
                                    },
                                }}
                            >
                                <MenuItem value="all">All Feedbacks</MenuItem>
                                {Object.entries(feedbackTypeConfig).map(([type, config]) => (
                                    <MenuItem key={type} value={type}>
                                        {config.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box flex={1} />

                        {/* Export Button */}
                        <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={handleExportMenuOpen}
                            disabled={feedbacks.length === 0}
                            sx={{
                                bgcolor: '#667eea',
                                color: 'white',
                                fontWeight: 600,
                                px: 3,
                                '&:hover': {
                                    bgcolor: '#5568d3',
                                },
                                '&:disabled': {
                                    bgcolor: 'rgba(102, 126, 234, 0.3)',
                                    color: 'rgba(255, 255, 255, 0.3)',
                                },
                            }}
                        >
                            Export
                        </Button>

                        {/* Export Menu */}
                        <Menu
                            anchorEl={exportMenuAnchor}
                            open={Boolean(exportMenuAnchor)}
                            onClose={handleExportMenuClose}
                            PaperProps={{
                                sx: {
                                    bgcolor: 'rgba(15, 23, 42, 0.98)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    mt: 1,
                                },
                            }}
                        >
                            <MenuItem
                                onClick={exportToJSON}
                                sx={{
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                                    },
                                }}
                            >
                                <ListItemIcon>
                                    <JsonIcon sx={{ color: '#f59e0b' }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Export as JSON"
                                    secondary={`${feedbacks.length} feedback${feedbacks.length !== 1 ? 's' : ''}`}
                                    secondaryTypographyProps={{
                                        sx: { color: 'rgba(255, 255, 255, 0.5)' }
                                    }}
                                />
                            </MenuItem>
                            <MenuItem
                                onClick={exportToCSV}
                                sx={{
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                                    },
                                }}
                            >
                                <ListItemIcon>
                                    <CsvIcon sx={{ color: '#10b981' }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Export as CSV"
                                    secondary="Excel, Sheets compatible"
                                    secondaryTypographyProps={{
                                        sx: { color: 'rgba(255, 255, 255, 0.5)' }
                                    }}
                                />
                            </MenuItem>
                            <MenuItem
                                onClick={exportToExcel}
                                sx={{
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                                    },
                                }}
                            >
                                <ListItemIcon>
                                    <ExcelIcon sx={{ color: '#22c55e' }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Export as Excel"
                                    secondary="Formatted table view"
                                    secondaryTypographyProps={{
                                        sx: { color: 'rgba(255, 255, 255, 0.5)' }
                                    }}
                                />
                            </MenuItem>
                        </Menu>

                        <IconButton
                            onClick={loadFeedbacks}
                            sx={{
                                color: '#667eea',
                                '&:hover': {
                                    bgcolor: 'rgba(102, 126, 234, 0.1)',
                                },
                            }}
                        >
                            <RefreshIcon />
                        </IconButton>
                    </Stack>
                </Paper>
            </AnimatedCard>

            {/* Loading State */}
            {loading && (
                <Box display="flex" justifyContent="center" p={5}>
                    <CircularProgress sx={{ color: '#667eea' }} />
                </Box>
            )}

            {/* Error State */}
            {error && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 3,
                        bgcolor: 'rgba(239, 68, 68, 0.15)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        '& .MuiAlert-icon': {
                            color: '#ef4444',
                        },
                    }}
                >
                    {error}
                </Alert>
            )}

            {/* Feedbacks List */}
            {!loading && !error && (
                <Stack spacing={2}>
                    {feedbacks.length === 0 ? (
                        <Alert
                            severity="info"
                            sx={{
                                bgcolor: 'rgba(59, 130, 246, 0.15)',
                                color: '#3b82f6',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                '& .MuiAlert-icon': {
                                    color: '#3b82f6',
                                },
                            }}
                        >
                            No feedbacks found. Be the first to share your thoughts!
                        </Alert>
                    ) : (
                        feedbacks.map((feedback, index) => {
                            const config = getTypeConfig(feedback.feedback_type);
                            return (
                                <AnimatedCard key={feedback.id} delay={0.3 + index * 0.05}>
                                    <Card
                                        sx={{
                                            borderLeft: `4px solid ${config.color}`,
                                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderLeftColor: config.color,
                                            borderLeftWidth: '4px',
                                            '&:hover': {
                                                boxShadow: `0 0 20px ${config.color}40`,
                                                transform: 'translateY(-2px)',
                                                bgcolor: 'rgba(255, 255, 255, 0.08)',
                                            },
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        <CardContent>
                                            <Stack spacing={2}>
                                                {/* Header */}
                                                <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Chip
                                                            icon={config.icon}
                                                            label={config.label}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: `${config.color}20`,
                                                                color: config.color,
                                                                fontWeight: 600,
                                                                '& .MuiChip-icon': {
                                                                    color: config.color,
                                                                },
                                                            }}
                                                        />
                                                        {feedback.feature_name && (
                                                            <Chip
                                                                label={feedback.feature_name}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{
                                                                    color: 'rgba(255, 255, 255, 0.8)',
                                                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                                                }}
                                                            />
                                                        )}
                                                    </Box>
                                                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                                        {formatDate(feedback.timestamp)}
                                                    </Typography>
                                                </Box>

                                                {/* Message */}
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        whiteSpace: 'pre-wrap',
                                                        color: 'rgba(255, 255, 255, 0.9)',
                                                    }}
                                                >
                                                    {feedback.message}
                                                </Typography>

                                                {/* Footer */}
                                                {feedback.page && (
                                                    <>
                                                        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                                                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                                            📍 From: {feedback.page}
                                                        </Typography>
                                                    </>
                                                )}
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </AnimatedCard>
                            );
                        })
                    )}
                </Stack>
            )}
        </Box>
    );
};

export default FeedbackViewer;
