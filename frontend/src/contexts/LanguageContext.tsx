import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getSessionItem, setSessionItem } from "@/utils/storage";

interface LanguageContextType {
  langGb: string;
  setLangGb: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  // 초기값: ko_KR (한국어)
  const [langGb, setLangGb] = useState(() => {
    const savedLang = getSessionItem("selectedLanguage");
    return savedLang || "ko_KR";
  });

  useEffect(() => {
    setSessionItem("selectedLanguage", langGb);
  }, [langGb]);

  const value = {
    langGb,
    setLangGb,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

