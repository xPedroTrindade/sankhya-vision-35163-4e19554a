import { createContext, useContext, useState, ReactNode } from 'react';
import { Ticket } from '@/types/ticket';

interface TicketContextType {
  tickets: Ticket[];
  setTickets: (tickets: Ticket[]) => void;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const TicketProvider = ({ children }: { children: ReactNode }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  return (
    <TicketContext.Provider value={{ tickets, setTickets }}>
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
