/**
 * Maintenance Service for Resiido
 */

import apiService from './api';
import { API_CONFIG } from '@/constants/config';
import { MaintenanceRequest, MaintenanceStatus } from '@/types';

class MaintenanceService {
  /**
   * Get all maintenance requests for a user
   */
  async getRequestsByUser(userId: number): Promise<MaintenanceRequest[]> {
    try {
      const requests = await apiService.get<MaintenanceRequest[]>(
        API_CONFIG.ENDPOINTS.MAINTENANCE
      );
      return requests.filter((r) => r.resident?.id === userId);
    } catch (error) {
      console.error('Get maintenance requests error:', error);
      throw error;
    }
  }

  /**
   * Get all maintenance requests (admin)
   */
  async getAllRequests(): Promise<MaintenanceRequest[]> {
    return apiService.get<MaintenanceRequest[]>(API_CONFIG.ENDPOINTS.MAINTENANCE);
  }

  /**
   * Create a new maintenance request
   */
  async createRequest(
    request: Omit<MaintenanceRequest, 'id' | 'status'>
  ): Promise<MaintenanceRequest> {
    const newRequest = {
      ...request,
      status: 'PENDING' as MaintenanceStatus,
    };
    return apiService.post<MaintenanceRequest>(
      API_CONFIG.ENDPOINTS.MAINTENANCE,
      newRequest
    );
  }

  /**
   * Update maintenance request status
   */
  async updateStatus(
    requestId: number,
    status: MaintenanceStatus
  ): Promise<MaintenanceRequest> {
    const endpoint = `${API_CONFIG.ENDPOINTS.MAINTENANCE}/${requestId}`;
    return apiService.put<MaintenanceRequest>(endpoint, { status });
  }

  /**
   * Get request by ID
   */
  async getRequestById(requestId: number): Promise<MaintenanceRequest> {
    const endpoint = `${API_CONFIG.ENDPOINTS.MAINTENANCE}/${requestId}`;
    return apiService.get<MaintenanceRequest>(endpoint);
  }

  /**
   * Get pending requests count
   */
  async getPendingCount(userId: number): Promise<number> {
    const requests = await this.getRequestsByUser(userId);
    return requests.filter((r) => r.status === 'PENDING' || r.status === 'IN_PROGRESS')
      .length;
  }

  /**
   * Cancel a maintenance request
   */
  async cancelRequest(requestId: number): Promise<MaintenanceRequest> {
    return this.updateStatus(requestId, 'CANCELLED');
  }

  /**
   * Get maintenance request categories
   */
  getCategories(): string[] {
    return [
      'Plumbing',
      'Electrical',
      'HVAC',
      'Appliance',
      'Structural',
      'Pest Control',
      'Cleaning',
      'General',
      'Other',
    ];
  }
}

export const maintenanceService = new MaintenanceService();
export default maintenanceService;
