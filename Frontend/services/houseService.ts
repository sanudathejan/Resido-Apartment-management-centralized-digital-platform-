/**
 * House Service for Resiido
 * Manages house number data and availability
 */

import apiService from './api';
import { API_CONFIG } from '@/constants/config';

export interface House {
  id: number;
  houseNumber: string;
  occupied: boolean;
}

class HouseService {
  /**
   * Get all houses with their occupancy status
   */
  async getAllHouses(): Promise<House[]> {
    try {
      return await apiService.get<House[]>(API_CONFIG.ENDPOINTS.HOUSES);
    } catch (error) {
      console.error('Get houses error:', error);
      throw error;
    }
  }
}

export const houseService = new HouseService();
export default houseService;
