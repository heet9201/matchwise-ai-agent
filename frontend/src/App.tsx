import { ThemeProvider, createTheme, CssBaseline, Container, Box, AppBar, Toolbar, Typography, Paper } from '@mui/material'
import WorkIcon from '@mui/icons-material/Work'
import RecruitmentContent from './components/RecruitmentContent'
import { JobDescriptionProvider } from './contexts/JobDescriptionContext'
import { ResumeProvider } from './contexts/ResumeContext'
import { SettingsProvider } from './contexts/SettingsContext'

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

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
                {/* Header */}
                <AppBar
                    position="sticky"
                    elevation={2}
                    sx={{
                        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.15)'
                    }}
                >
                    <Toolbar>
                        <WorkIcon sx={{ mr: 2, fontSize: 32 }} />
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h5" component="h1" fontWeight={600}>
                                AI Recruitment Assistant
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                Streamline your hiring process with AI-powered resume analysis
                            </Typography>
                        </Box>
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
                        © 2025 AI Recruitment Assistant. Made with ❤️ for better hiring.
                    </Typography>
                </Paper>
            </Box>
        </ThemeProvider>
    )
}

export default App
