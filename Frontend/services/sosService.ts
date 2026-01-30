/**
 * SOS Emergency Service for Resiido
 */

import apiService from './api';
import { API_CONFIG } from '@/constants/config';
import { SosAlert, User } from '@/types';

class SosService {
  /**
   * Trigger SOS alert
   */
  async triggerAlert(userId: number, message?: string): Promise<SosAlert> {
    try {
      const alertData = {
        resident: { id: userId } as User,
        timestamp: new Date().toISOString(),
        isActive: true,
        message: message || 'Emergency! Need immediate assistance.',
      };

      return await apiService.post<SosAlert>(API_CONFIG.ENDPOINTS.SOS, alertData);
    } catch (error) {
      console.error('SOS trigger error:', error);
      throw error;
    }
  }

  /**
   * Cancel SOS alert
   */
  async cancelAlert(alertId: number): Promise<SosAlert> {
    const endpoint = `${API_CONFIG.ENDPOINTS.SOS}/${alertId}`;
    return apiService.put<SosAlert>(endpoint, { isActive: false });
  }

  /**
   * Get active alerts (for admin/security)
   */
  async getActiveAlerts(): Promise<SosAlert[]> {
    try {
      const alerts = await apiService.get<SosAlert[]>(API_CONFIG.ENDPOINTS.SOS);
      return alerts.filter((a) => a.isActive);
    } catch (error) {
      console.error('Get active alerts error:', error);
      return [];
    }
  }

  /**
   * Get user's SOS history
   */
  async getUserAlerts(userId: number): Promise<SosAlert[]> {
    try {
      const alerts = await apiService.get<SosAlert[]>(API_CONFIG.ENDPOINTS.SOS);
      return alerts.filter((a) => a.resident?.id === userId);
    } catch (error) {
      console.error('Get user alerts error:', error);
      return [];
    }
  }

  /**
   * Respond to SOS alert (for security/admin)
   */
  async respondToAlert(alertId: number, responderId: number): Promise<SosAlert> {
    const endpoint = `${API_CONFIG.ENDPOINTS.SOS}/${alertId}/respond`;
    return apiService.put<SosAlert>(endpoint, {
      respondedBy: { id: responderId } as User,
      respondedAt: new Date().toISOString(),
    });
  }

  /**
   * Check if user has active alert
   */
  async hasActiveAlert(userId: number): Promise<boolean> {
    const alerts = await this.getUserAlerts(userId);
    return alerts.some((a) => a.isActive);
  }
}

export const sosService = new SosService();
export default sosService;
