import { ThemeProvider, createTheme, CssBaseline, Container, Box, AppBar, Toolbar, Typography, Paper } from '@mui/material'
import '@fontsource/inter'
import '@fontsource/manrope'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'
import PersonSearchIcon from '@mui/icons-material/PersonSearch'
import { HelmetProvider, Helmet } from 'react-helmet-async'
import RecruitmentContent from './components/RecruitmentContent'
import AnimatedBackground from './components/AnimatedBackground'
import PageTransition from './components/PageTransition'
import ModeToggle from './components/ModeToggle'
import { JobDescriptionProvider } from './contexts/JobDescriptionContext'
import { ResumeProvider } from './contexts/ResumeContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { ModeProvider, useMode } from './contexts/ModeContext'
import { motion } from 'framer-motion'

const theme = createTheme({
    palette: {
        mode: 'dark', // Dark-first approach for 2025
        primary: {
            main: '#6366f1', // Indigo - modern 2025 color
            light: '#818cf8',
            dark: '#4f46e5',
        },
        secondary: {
            main: '#a855f7', // Purple
            light: '#c084fc',
            dark: '#9333ea',
        },
        success: {
            main: '#10b981',
            light: '#34d399',
            dark: '#059669',
        },
        background: {
            default: 'transparent',
            paper: 'rgba(15, 23, 42, 0.6)',
        },
        text: {
            primary: 'rgba(255, 255, 255, 0.95)',
            secondary: 'rgba(255, 255, 255, 0.65)',
        },
    },
    typography: {
        fontFamily: '"Inter", "Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        h1: {
            fontFamily: '"Manrope", sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.02em',
        },
        h2: {
            fontFamily: '"Manrope", sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.02em',
        },
        h3: {
            fontFamily: '"Manrope", sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.01em',
        },
        h4: {
            fontFamily: '"Manrope", sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.01em',
        },
        h5: {
            fontFamily: '"Manrope", sans-serif',
            fontWeight: 600,
            letterSpacing: '-0.01em',
        },
        h6: {
            fontFamily: '"Manrope", sans-serif',
            fontWeight: 600,
            letterSpacing: '0',
        },
        body1: {
            fontFamily: '"Inter", sans-serif',
            fontWeight: 400,
            letterSpacing: '0.01em',
            lineHeight: 1.7,
        },
        body2: {
            fontFamily: '"Inter", sans-serif',
            fontWeight: 400,
            letterSpacing: '0.01em',
            lineHeight: 1.6,
        },
        button: {
            fontFamily: '"Inter", sans-serif',
            fontWeight: 600,
            letterSpacing: '0.02em',
            textTransform: 'none',
        },
        caption: {
            fontFamily: '"Inter", sans-serif',
            fontWeight: 500,
            letterSpacing: '0.03em',
        },
    },
    shape: {
        borderRadius: 16,
    },
    shadows: [
        'none',
        '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 8px 32px 0 rgba(99, 102, 241, 0.1)',
        '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 8px 32px 0 rgba(99, 102, 241, 0.1)',
        '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 8px 32px 0 rgba(99, 102, 241, 0.1)',
        '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    ],
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(99, 102, 241, 0.3) rgba(15, 23, 42, 0.3)',
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'rgba(15, 23, 42, 0.3)',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(99, 102, 241, 0.3)',
                        borderRadius: '4px',
                        '&:hover': {
                            background: 'rgba(99, 102, 241, 0.5)',
                        },
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    fontWeight: 600,
                    padding: '10px 24px',
                    fontSize: '0.9375rem',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    textTransform: 'none',
                },
                contained: {
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(139, 92, 246, 0.9))',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 4px 16px 0 rgba(99, 102, 241, 0.25)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 1), rgba(139, 92, 246, 1))',
                        boxShadow: '0 8px 24px 0 rgba(99, 102, 241, 0.35)',
                        transform: 'translateY(-2px)',
                    },
                },
                outlined: {
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': {
                        borderColor: 'rgba(99, 102, 241, 0.5)',
                        background: 'rgba(99, 102, 241, 0.1)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    borderRadius: 16,
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                },
            },
        },
    },
})

const AppContent = () => {
    const { mode } = useMode();

    return (
        <>
            <Helmet>
                <title>
                    {mode === 'recruiter'
                        ? 'MatchWise - AI-Powered Recruitment Platform'
                        : 'MatchWise - Find Your Perfect Job Match'
                    }
                </title>
                <meta
                    name="description"
                    content={mode === 'recruiter'
                        ? 'Modern AI-powered platform for recruiters to find and match the perfect candidates'
                        : 'Smart AI platform helping candidates discover their ideal job opportunities'
                    }
                />
            </Helmet>

            {/* Skip to main content link for keyboard navigation */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded-lg focus:shadow-lg transition-all duration-200"
            >
                Skip to main content
            </a>

            <AnimatedBackground />

            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
                {/* Modern Glassmorphism Header */}
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                    <AppBar
                        position="sticky"
                        elevation={0}
                        component="header"
                        sx={{
                            background: mode === 'recruiter'
                                ? 'rgba(15, 23, 42, 0.5)'
                                : 'rgba(24, 10, 40, 0.5)',
                            backdropFilter: 'blur(24px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                            borderBottom: '1px solid',
                            borderColor: mode === 'recruiter'
                                ? 'rgba(99, 102, 241, 0.15)'
                                : 'rgba(168, 85, 247, 0.15)',
                            boxShadow: mode === 'recruiter'
                                ? '0 8px 32px 0 rgba(99, 102, 241, 0.08)'
                                : '0 8px 32px 0 rgba(168, 85, 247, 0.08)',
                            transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        }}
                    >
                        <Toolbar sx={{ py: 2, px: { xs: 2, sm: 3, md: 4 } }} component="nav" aria-label="Main navigation">
                            <motion.div
                                initial={false}
                                animate={{
                                    rotate: mode === 'recruiter' ? 0 : 180,
                                    scale: 1
                                }}
                                transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
                                style={{ display: 'flex', marginRight: 20 }}
                            >
                                {mode === 'recruiter' ? (
                                    <BusinessCenterIcon sx={{
                                        fontSize: 32,
                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        filter: 'drop-shadow(0 2px 8px rgba(99, 102, 241, 0.3))',
                                    }} />
                                ) : (
                                    <PersonSearchIcon sx={{
                                        fontSize: 32,
                                        background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        filter: 'drop-shadow(0 2px 8px rgba(168, 85, 247, 0.3))',
                                    }} />
                                )}
                            </motion.div>

                            <Box sx={{ flexGrow: 1 }}>
                                <motion.div
                                    key={mode}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <Typography
                                        variant="h5"
                                        component="h1"
                                        sx={{
                                            fontWeight: 700,
                                            background: mode === 'recruiter'
                                                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                                : 'linear-gradient(135deg, #a855f7, #ec4899)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            letterSpacing: '-0.02em',
                                        }}
                                    >
                                        MatchWise
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.65)',
                                            fontWeight: 500,
                                            letterSpacing: '0.5px',
                                            display: { xs: 'none', sm: 'block' }
                                        }}
                                    >
                                        {mode === 'recruiter'
                                            ? 'AI-Powered Talent Matching'
                                            : 'Find Your Perfect Career Match'
                                        }
                                    </Typography>
                                </motion.div>
                            </Box>

                            <ModeToggle />
                        </Toolbar>
                    </AppBar>
                </motion.div>

                {/* Main Content with generous spacing */}
                <Container
                    maxWidth="lg"
                    component="main"
                    id="main-content"
                    sx={{
                        py: { xs: 4, md: 6 },
                        px: { xs: 2, sm: 3, md: 4 },
                        flexGrow: 1,
                        position: 'relative',
                        zIndex: 1
                    }}
                >
                    <SettingsProvider>
                        <JobDescriptionProvider>
                            <ResumeProvider>
                                <PageTransition mode={mode}>
                                    <RecruitmentContent />
                                </PageTransition>
                            </ResumeProvider>
                        </JobDescriptionProvider>
                    </SettingsProvider>
                </Container>

                {/* Modern Glassmorphism Footer */}
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            mt: 'auto',
                            py: 3,
                            px: 2,
                            textAlign: 'center',
                            borderRadius: 0,
                            background: mode === 'recruiter'
                                ? 'rgba(15, 23, 42, 0.5)'
                                : 'rgba(24, 10, 40, 0.5)',
                            backdropFilter: 'blur(24px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                            borderTop: '1px solid',
                            borderColor: mode === 'recruiter'
                                ? 'rgba(99, 102, 241, 0.15)'
                                : 'rgba(168, 85, 247, 0.15)',
                            transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontWeight: 500,
                                fontSize: '0.875rem',
                            }}
                        >
                            © 2025 MatchWise • AI-Powered Recruitment Platform • Made with ❤️
                        </Typography>
                    </Paper>
                </motion.div>
            </Box>
        </>
    );
};

function App() {
    return (
        <HelmetProvider>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <ModeProvider>
                    <AppContent />
                </ModeProvider>
            </ThemeProvider>
        </HelmetProvider>
    )
}

export default App
