import { mockPipelineDeals } from './mockData';

// Types
export interface Deal {
  id: number;
  title: string;
  customer: string;
  customerId: number;
  value: number;
  stage: string;
  probability: number;
  expectedCloseDate: string;
  actualCloseDate?: string;
  owner: string;
  description: string;
  created_at: string;
  lastActivity: string;
}

export interface CreateDealInput {
  title: string;
  customerName: string;
  value: number;
  stage: string;
  probability: number;
  expectedCloseDate: string;
  owner: string;
  description?: string;
}

export interface UpdateDealInput {
  id: string;
  title: string;
  customer: string;
  value: number;
  stage: string;
  probability: number;
  expectedCloseDate: string;
  owner: string;
  description?: string;
}

// In-memory deals storage (starts with mock data)
let deals: Deal[] = [...mockPipelineDeals];

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get all deals with optional pagination
 */
export const getDeals = async (): Promise<Deal[]> => {
  await delay(300);
  return deals;
};

/**
 * Get a single deal by ID
 */
export const getDeal = async (id: string | number): Promise<Deal | undefined> => {
  await delay(200);
  return deals.find(deal => deal.id.toString() === id.toString());
};

/**
 * Create a new deal
 */
export const createDeal = async (input: CreateDealInput): Promise<Deal> => {
  await delay(500);
  
  const newDeal: Deal = {
    id: Math.max(...deals.map(d => d.id), 0) + 1,
    title: input.title,
    customer: input.customerName,
    customerId: Math.floor(Math.random() * 1000),
    value: input.value,
    stage: input.stage,
    probability: input.probability,
    expectedCloseDate: input.expectedCloseDate,
    owner: input.owner,
    description: input.description || '',
    created_at: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
  };
  
  deals.push(newDeal);
  return newDeal;
};

/**
 * Update an existing deal
 */
export const updateDeal = async (input: UpdateDealInput): Promise<Deal | null> => {
  await delay(500);
  
  const index = deals.findIndex(deal => deal.id.toString() === input.id.toString());
  
  if (index === -1) {
    return null;
  }
  
  deals[index] = {
    ...deals[index],
    title: input.title,
    customer: input.customer,
    value: input.value,
    stage: input.stage,
    probability: input.probability,
    expectedCloseDate: input.expectedCloseDate,
    owner: input.owner,
    description: input.description || deals[index].description,
    lastActivity: new Date().toISOString(),
  };
  
  return deals[index];
};

/**
 * Delete a deal
 */
export const deleteDeal = async (id: string | number): Promise<boolean> => {
  await delay(500);
  
  const index = deals.findIndex(deal => deal.id.toString() === id.toString());
  
  if (index === -1) {
    return false;
  }
  
  deals.splice(index, 1);
  return true;
};

/**
 * Get deals statistics
 */
export const getDealsStats = async () => {
  await delay(200);
  
  const total = deals.length;
  const active = deals.filter(d => !['closed-won', 'closed-lost'].includes(d.stage)).length;
  const won = deals.filter(d => d.stage === 'closed-won').length;
  const lost = deals.filter(d => d.stage === 'closed-lost').length;
  
  const totalValue = deals.reduce((sum, deal) => {
    if (deal.stage === 'closed-won') {
      return sum + deal.value;
    }
    return sum + (deal.value * deal.probability) / 100;
  }, 0);
  
  const wonValue = deals
    .filter(d => d.stage === 'closed-won')
    .reduce((sum, d) => sum + d.value, 0);
  
  return {
    total,
    active,
    won,
    lost,
    totalValue,
    wonValue,
    winRate: won + lost > 0 ? Math.round((won / (won + lost)) * 100) : 0,
  };
};

/**
 * Get deals by stage
 */
export const getDealsByStage = async (stage: string): Promise<Deal[]> => {
  await delay(200);
  return deals.filter(deal => deal.stage === stage);
};

/**
 * Move deal to different stage
 */
export const moveDealToStage = async (id: string | number, newStage: string): Promise<Deal | null> => {
  await delay(300);
  
  const index = deals.findIndex(deal => deal.id.toString() === id.toString());
  
  if (index === -1) {
    return null;
  }
  
  deals[index] = {
    ...deals[index],
    stage: newStage,
    lastActivity: new Date().toISOString(),
  };
  
  return deals[index];
};

export default {
  getDeals,
  getDeal,
  createDeal,
  updateDeal,
  deleteDeal,
  getDealsStats,
  getDealsByStage,
  moveDealToStage,
};
