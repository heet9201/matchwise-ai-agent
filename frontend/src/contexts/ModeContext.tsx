import React, { createContext, useContext, useState, ReactNode } from 'react';

export type AppMode = 'recruiter' | 'candidate';

interface ModeContextType {
    mode: AppMode;
    setMode: (mode: AppMode) => void;
    toggleMode: () => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const ModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<AppMode>('recruiter');

    const toggleMode = () => {
        setMode(prevMode => prevMode === 'recruiter' ? 'candidate' : 'recruiter');
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
