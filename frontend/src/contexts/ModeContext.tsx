import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AppMode = 'recruiter' | 'candidate';

interface ModeContextType {
    mode: AppMode;
    setMode: (mode: AppMode) => void;
    toggleMode: () => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const ModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initialize from localStorage or default to 'recruiter'
    const [mode, setModeState] = useState<AppMode>(() => {
        const savedMode = localStorage.getItem('matchwise-mode');
        return (savedMode === 'recruiter' || savedMode === 'candidate') ? savedMode : 'recruiter';
    });

    // Persist mode to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('matchwise-mode', mode);
    }, [mode]);

    const setMode = (newMode: AppMode) => {
        setModeState(newMode);
    };

    const toggleMode = () => {
        setModeState(prevMode => prevMode === 'recruiter' ? 'candidate' : 'recruiter');
    };

    return (
        <ModeContext.Provider value={{ mode, setMode, toggleMode }}>
            {children}
        </ModeContext.Provider>
    );
};

export const useMode = (): ModeContextType => {
    const context = useContext(ModeContext);
    if (!context) {
        throw new Error('useMode must be used within a ModeProvider');
    }
    return context;
};
