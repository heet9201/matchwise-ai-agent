import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { AnalysisResult } from '../types/analysis';

interface ResumeContextType {
    results: AnalysisResult[];
    setResults: (results: AnalysisResult[]) => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const useResume = () => {
    const context = useContext(ResumeContext);
    if (!context) {
        throw new Error('useResume must be used within a ResumeProvider');
    }
    return context;
};

interface ResumeProviderProps {
    children: ReactNode;
}

export const ResumeProvider: React.FC<ResumeProviderProps> = ({ children }) => {
    const [results, setResults] = useState<AnalysisResult[]>([]);

    return (
        <ResumeContext.Provider value={{ results, setResults }}>
            {children}
        </ResumeContext.Provider>
    );
};
