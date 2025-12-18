import React, { createContext, useContext, useState, useEffect } from "react";
import { getCompanies } from "@/services/api";

interface CompanyContextType {
  selectedCompany: string | null;
  setSelectedCompany: (company: string | null) => void;
  companies: string[];
  loadCompanies: () => Promise<void>;
  isLoading: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [companies, setCompanies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      const data = await getCompanies();
      // Extrai nomes únicos das empresas
      const companyNames = data.map((c: any) => c.name || c.domain).filter(Boolean);
      setCompanies(companyNames);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carrega empresas automaticamente ao montar
  useEffect(() => {
    loadCompanies();
  }, []);

  return (
    <CompanyContext.Provider
      value={{
        selectedCompany,
        setSelectedCompany,
        companies,
        loadCompanies,
        isLoading,
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
