/**
 * API Service - Integração com Backend
 * Base URL: http://localhost:4000
 * Modo: MOCK (backend serve dados mockados)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

/**
 * Busca todos os tickets simplificados
 */
export async function getTickets(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tickets`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erro ao buscar tickets:', error);
    return [];
  }
}

/**
 * Busca todas as empresas
 */
export async function getCompanies(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/companies`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    return [];
  }
}

/**
 * Busca groups (company_and_requesters)
 */
export async function getGroups(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/groups`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erro ao buscar grupos:', error);
    return [];
  }
}

/**
 * Busca lista de tenants disponíveis
 */
export async function getTenants(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tenants`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erro ao buscar tenants:', error);
    return [];
  }
}

/**
 * Busca dados de um tenant específico
 */
export async function getTenant(nome: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tenant/${nome}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Erro ao buscar tenant ${nome}:`, error);
    return [];
  }
}

/**
 * Atualiza tickets de uma empresa específica
 */
export async function updateEmpresa(empresa: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/update/${empresa}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error(`Erro ao atualizar empresa ${empresa}:`, error);
    return { error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

/**
 * Reprocessa todo o pipeline de dados
 */
export async function rebuildPipeline(): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/rebuild`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('Erro ao reprocessar pipeline:', error);
    return { error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}
