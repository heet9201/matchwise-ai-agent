import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RecruitmentSettings, defaultSettings } from '../components/Settings';

interface SettingsContextType {
    settings: RecruitmentSettings;
    setSettings: (settings: RecruitmentSettings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

interface SettingsProviderProps {
    children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
    const [settings, setSettings] = useState<RecruitmentSettings>(defaultSettings);

    return (
        <SettingsContext.Provider value={{ settings, setSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};
