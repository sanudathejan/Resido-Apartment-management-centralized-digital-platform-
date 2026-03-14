/**
 * Parking Service for Resiido
 */

import apiService from './api';
import { API_CONFIG } from '@/constants/config';
import { ParkingSlot, ParkingRequest } from '@/types';

class ParkingService {
  /**
   * Get parking slot for a user
   */
  async getUserParkingSlot(userId: number): Promise<ParkingSlot | null> {
    try {
      const slots = await apiService.get<ParkingSlot[]>(
        API_CONFIG.ENDPOINTS.PARKING_SLOTS
      );
      return slots.find((s) => s.owner?.id === userId) || null;
    } catch (error) {
      console.error('Get parking slot error:', error);
      throw error;
    }
  }

  /**
   * Get all parking slots
   */
  async getAllSlots(): Promise<ParkingSlot[]> {
    return apiService.get<ParkingSlot[]>(API_CONFIG.ENDPOINTS.PARKING_SLOTS);
  }

  /**
   * Get available parking slots
   */
  async getAvailableSlots(): Promise<ParkingSlot[]> {
    const slots = await this.getAllSlots();
    return slots.filter((s) => s.isAvailableForLending);
  }

  /**
   * Toggle slot availability for lending
   */
  async toggleSlotAvailability(slotId: number, available: boolean): Promise<ParkingSlot> {
    const endpoint = `${API_CONFIG.ENDPOINTS.PARKING_SLOTS}/${slotId}`;
    return apiService.put<ParkingSlot>(endpoint, { isAvailableForLending: available });
  }

  /**
   * Request a parking slot
   */
  async requestSlot(request: Omit<ParkingRequest, 'id' | 'status'>): Promise<ParkingRequest> {
    return apiService.post<ParkingRequest>(API_CONFIG.ENDPOINTS.PARKING_REQUESTS, {
      ...request,
      status: 'PENDING',
    });
  }

  /**
   * Get parking requests for a user
   */
  async getUserRequests(userId: number): Promise<ParkingRequest[]> {
    const requests = await apiService.get<ParkingRequest[]>(
      API_CONFIG.ENDPOINTS.PARKING_REQUESTS
    );
    return requests.filter((r) => r.requestedBy?.id === userId);
  }

}

export const parkingService = new ParkingService();
export default parkingService;
