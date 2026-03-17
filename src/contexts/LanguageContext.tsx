import React, { createContext, useContext, useState, ReactNode } from 'react';
import { translations, LanguageCode } from '@/lib/translations';

interface LanguageContextType {
    language: LanguageCode;
    setLanguage: (lang: LanguageCode) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<LanguageCode>(() => {
        const savedLang = localStorage.getItem('language') as LanguageCode;
        return savedLang && translations[savedLang] ? savedLang : 'EN';
    });

    const updateLanguage = (lang: LanguageCode) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: updateLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export { LanguageProvider, useLanguage };
