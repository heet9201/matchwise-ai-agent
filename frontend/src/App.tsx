import React from 'react'
import { ThemeProvider, createTheme, CssBaseline, Container } from '@mui/material'
import RecruitmentContent from './components/RecruitmentContent'
import { JobDescriptionProvider } from './contexts/JobDescriptionContext'
import { ResumeProvider } from './contexts/ResumeContext'
import { SettingsProvider } from './contexts/SettingsContext'

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
})

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <SettingsProvider>
                <JobDescriptionProvider>
                    <ResumeProvider>
                        <Container maxWidth="lg" sx={{ py: 4 }}>
                            <RecruitmentContent />
                        </Container>
                    </ResumeProvider>
                </JobDescriptionProvider>
            </SettingsProvider>
        </ThemeProvider>
    )
}

export default App
