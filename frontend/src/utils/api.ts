const API_BASE_URL = 'http://localhost:3002/api';

export interface DAO {
  id: string;
  name: string;
  description: string;
  // Add other DAO properties as needed
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  // Add other proposal properties as needed
}

export const api = {
  // Create a new DAO
  createDao: async ({name, description}: {name: string, description: string}): Promise<DAO> => {
    console.log('Creating DAO', name, description);
    const response = await fetch(`${API_BASE_URL}/daos/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({name, description}),
    });
    if (!response.ok) throw new Error('Failed to create DAO');
    const data = await response.json();
    return data.data;
  },

  // Get all DAOs
  getAllDaos: async (): Promise<DAO[]> => {
    const response = await fetch(`${API_BASE_URL}/daos`);
    if (!response.ok) {
      console.log('Failed to fetch DAOs', response);
      throw new Error('Failed to fetch DAOs');
    }
    const data = await response.json();
    return data.data;
  },

  // Get a single DAO
  getDaoById: async (id: string): Promise<DAO> => {
    const response = await fetch(`${API_BASE_URL}/daos/${id}`);
    if (!response.ok) throw new Error('Failed to fetch DAO');
    return response.json();
  },

  // Get all proposals for a DAO
  getDaoProposals: async (daoId: string): Promise<Proposal[]> => {
    const response = await fetch(`${API_BASE_URL}/daos/${daoId}/proposals`);
    if (!response.ok) throw new Error('Failed to fetch proposals');
    return response.json();
  },

  // Get a specific proposal
  getProposalByIndex: async (daoId: string, index: string): Promise<Proposal> => {
    const response = await fetch(`${API_BASE_URL}/daos/${daoId}/proposals/${index}`);
    if (!response.ok) throw new Error('Failed to fetch proposal');
    return response.json();
  },
}; 