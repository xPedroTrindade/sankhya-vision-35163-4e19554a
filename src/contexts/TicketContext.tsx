import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Ticket } from '@/types/ticket';
import { getTickets } from '@/services/api';

interface TicketContextType {
  tickets: Ticket[];
  setTickets: (tickets: Ticket[]) => void;
  loadTickets: () => Promise<void>;
  isLoading: boolean;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const TicketProvider = ({ children }: { children: ReactNode }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const data = await getTickets();
      setTickets(data);
    } catch (error) {
      console.error('Erro ao carregar tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carrega tickets automaticamente ao montar
  useEffect(() => {
    loadTickets();
  }, []);

  return (
    <TicketContext.Provider value={{ tickets, setTickets, loadTickets, isLoading }}>
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};
