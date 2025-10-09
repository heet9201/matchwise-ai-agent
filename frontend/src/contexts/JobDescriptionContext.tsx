import React, { createContext, useContext, useState } from 'react';

interface JobDescriptionContextType {
    jobDescription: string;
    setJobDescription: (jd: string) => void;
}

const JobDescriptionContext = createContext<JobDescriptionContextType | undefined>(undefined);

export const useJobDescription = () => {
    const context = useContext(JobDescriptionContext);
    if (!context) {
        throw new Error('useJobDescription must be used within a JobDescriptionProvider');
    }
    return context;
};

export const JobDescriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [jobDescription, setJobDescription] = useState('');

    return (
        <JobDescriptionContext.Provider value={{ jobDescription, setJobDescription }}>
            {children}
        </JobDescriptionContext.Provider>
    );
};
