import axios from "axios";

const API_BASE_URL = "/api";

export interface Campaign {
  id: number;
  owner: string;
  title: string;
  description: string;
  goal: string;
  funds: string;
  deadline: number;
  daysLeft: number;
  withdrawn: boolean;
  metadataUri?: string;
  image?: string;
}

export interface Contribution {
  campaignId: string;
  campaignTitle: string;
  amount: number;
  date: string;
  owner: string;
}

/**
 * Obtiene todas las campañas
 */
export async function getCampaigns(): Promise<Campaign[]> {
  const response = await axios.get(`${API_BASE_URL}/campaigns`);
  return response.data;
}

/**
 * Obtiene una campaña por ID
 */
export async function getCampaignById(id: number): Promise<Campaign> {
  const response = await axios.get(`${API_BASE_URL}/campaigns/${id}`);
  return response.data;
}

/**
 * Obtiene las campañas de un owner específico
 */
export async function getCampaignsByOwner(owner: string): Promise<Campaign[]> {
  const response = await axios.get(`${API_BASE_URL}/campaigns?owner=${owner}`);
  return response.data;
}

/**
 * Obtiene las contribuciones de un usuario
 */
export async function getContributionsByOwner(owner: string): Promise<Contribution[]> {
  const response = await axios.get(`${API_BASE_URL}/contributions?owner=${owner}`);
  return response.data;
}
