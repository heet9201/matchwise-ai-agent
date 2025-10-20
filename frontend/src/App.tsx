import { ThemeProvider, createTheme, CssBaseline, Container, Box, AppBar, Toolbar, Typography, Paper, Switch, FormControlLabel, Tooltip } from '@mui/material'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'
import PersonSearchIcon from '@mui/icons-material/PersonSearch'
import RecruitmentContent from './components/RecruitmentContent'
import { JobDescriptionProvider } from './contexts/JobDescriptionContext'
import { ResumeProvider } from './contexts/ResumeContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { ModeProvider, useMode } from './contexts/ModeContext'

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
        },
        secondary: {
            main: '#dc004e',
            light: '#f50057',
            dark: '#c51162',
        },
        success: {
            main: '#4caf50',
            light: '#81c784',
            dark: '#388e3c',
        },
        background: {
            default: '#f5f7fa',
            paper: '#ffffff',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 500,
        },
    },
    shape: {
        borderRadius: 12,
    },
    shadows: [
        'none',
        '0px 2px 4px rgba(0,0,0,0.05)',
        '0px 4px 8px rgba(0,0,0,0.08)',
        '0px 8px 16px rgba(0,0,0,0.1)',
        '0px 12px 24px rgba(0,0,0,0.12)',
        '0px 16px 32px rgba(0,0,0,0.14)',
        '0px 20px 40px rgba(0,0,0,0.16)',
        '0px 24px 48px rgba(0,0,0,0.18)',
        '0px 2px 4px rgba(0,0,0,0.05)',
        '0px 4px 8px rgba(0,0,0,0.08)',
        '0px 8px 16px rgba(0,0,0,0.1)',
        '0px 12px 24px rgba(0,0,0,0.12)',
        '0px 16px 32px rgba(0,0,0,0.14)',
        '0px 20px 40px rgba(0,0,0,0.16)',
        '0px 24px 48px rgba(0,0,0,0.18)',
        '0px 2px 4px rgba(0,0,0,0.05)',
        '0px 4px 8px rgba(0,0,0,0.08)',
        '0px 8px 16px rgba(0,0,0,0.1)',
        '0px 12px 24px rgba(0,0,0,0.12)',
        '0px 16px 32px rgba(0,0,0,0.14)',
        '0px 20px 40px rgba(0,0,0,0.16)',
        '0px 24px 48px rgba(0,0,0,0.18)',
        '0px 2px 4px rgba(0,0,0,0.05)',
        '0px 4px 8px rgba(0,0,0,0.08)',
        '0px 8px 16px rgba(0,0,0,0.1)',
    ],
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                    fontWeight: 500,
                    padding: '10px 24px',
                },
                contained: {
                    boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
                    '&:hover': {
                        boxShadow: '0px 4px 12px rgba(0,0,0,0.2)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
                },
            },
        },
    },
})

const AppContent = () => {
    const { mode, toggleMode } = useMode();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Header */}
            <AppBar
                position="sticky"
                elevation={2}
                sx={{
                    background: mode === 'recruiter'
                        ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
                        : 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                    transition: 'background 0.3s ease'
                }}
            >
                <Toolbar>
                    {mode === 'recruiter' ? (
                        <BusinessCenterIcon sx={{ mr: 2, fontSize: 32 }} />
                    ) : (
                        <PersonSearchIcon sx={{ mr: 2, fontSize: 32 }} />
                    )}
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h5" component="h1" fontWeight={600}>
                            MatchWise
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                            {mode === 'recruiter'
                                ? 'Smart matching for recruiters - Find the perfect candidates'
                                : 'Smart matching for candidates - Find your dream job'
                            }
                        </Typography>
                    </Box>
                    <Tooltip
                        title={`Switch to ${mode === 'recruiter' ? 'Candidate' : 'Recruiter'} Mode`}
                        arrow
                    >
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={mode === 'candidate'}
                                    onChange={toggleMode}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: '#ce93d8',
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                            backgroundColor: '#ba68c8',
                                        },
                                    }}
                                />
                            }
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {mode === 'recruiter' ? 'Recruiter' : 'Candidate'}
                                    </Typography>
                                </Box>
                            }
                            labelPlacement="start"
                            sx={{
                                m: 0,
                                '& .MuiFormControlLabel-label': {
                                    color: 'white'
                                }
                            }}
                        />
                    </Tooltip>
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
                <SettingsProvider>
                    <JobDescriptionProvider>
                        <ResumeProvider>
                            <RecruitmentContent />
                        </ResumeProvider>
                    </JobDescriptionProvider>
                </SettingsProvider>
            </Container>

            {/* Footer */}
            <Paper
                elevation={3}
                sx={{
                    mt: 'auto',
                    py: 3,
                    textAlign: 'center',
                    borderRadius: 0,
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #e3e8ef 100%)'
                }}
            >
                <Typography variant="body2" color="text.secondary">
                    © 2025 MatchWise. Smart matching for both recruiters and candidates. Made with ❤️
                </Typography>
            </Paper>
        </Box>
    );
};

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <ModeProvider>
                <AppContent />
            </ModeProvider>
        </ThemeProvider>
    )
}

export default App
