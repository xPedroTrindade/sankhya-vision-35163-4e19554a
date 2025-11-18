import React, { createContext, useContext, useState } from "react";

interface CompanyContextType {
  selectedCompany: string | null;
  setSelectedCompany: (company: string | null) => void;
  companies: string[];
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

// Lista de empresas fictícias
export const COMPANIES = [
  "Empresa ABC Ltda",
  "Tech Solutions Corp",
  "Inovação Digital SA",
  "Startup XYZ"
];

export const CompanyProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  return (
    <CompanyContext.Provider
      value={{
        selectedCompany,
        setSelectedCompany,
        companies: COMPANIES,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within CompanyProvider");
  }
  return context;
};
