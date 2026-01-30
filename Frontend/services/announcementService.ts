/**
 * Announcement Service for Resiido
 */

import apiService from './api';
import { API_CONFIG } from '@/constants/config';
import { Announcement } from '@/types';

class AnnouncementService {
  /**
   * Get all announcements
   */
  async getAllAnnouncements(): Promise<Announcement[]> {
    try {
      return await apiService.get<Announcement[]>(API_CONFIG.ENDPOINTS.ANNOUNCEMENTS);
    } catch (error) {
      console.error('Get announcements error:', error);
      // Return mock data if API not available
      return this.getMockAnnouncements();
    }
  }

  /**
   * Get active announcements (not expired)
   */
  async getActiveAnnouncements(): Promise<Announcement[]> {
    const announcements = await this.getAllAnnouncements();
    const now = new Date();
    return announcements.filter((a) => {
      if (!a.expiresAt) return true;
      return new Date(a.expiresAt) > now;
    });
  }

  /**
   * Get announcement by ID
   */
  async getAnnouncementById(id: number): Promise<Announcement> {
    const endpoint = `${API_CONFIG.ENDPOINTS.ANNOUNCEMENTS}/${id}`;
    return apiService.get<Announcement>(endpoint);
  }

  /**
   * Create announcement (admin only)
   */
  async createAnnouncement(
    announcement: Omit<Announcement, 'id' | 'createdAt'>
  ): Promise<Announcement> {
    return apiService.post<Announcement>(API_CONFIG.ENDPOINTS.ANNOUNCEMENTS, {
      ...announcement,
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * Mark announcement as read
   */
  async markAsRead(announcementId: number, userId: number): Promise<void> {
    const endpoint = `${API_CONFIG.ENDPOINTS.ANNOUNCEMENTS}/${announcementId}/read`;
    await apiService.post(endpoint, { userId });
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: number): Promise<number> {
    const announcements = await this.getActiveAnnouncements();
    return announcements.filter((a) => !a.isRead).length;
  }

  /**
   * Get announcements by category
   */
  async getByCategory(category: string): Promise<Announcement[]> {
    const announcements = await this.getActiveAnnouncements();
    return announcements.filter((a) => a.category === category);
  }

  /**
   * Mock announcements for testing
   */
  private getMockAnnouncements(): Announcement[] {
    return [
      {
        id: 1,
        title: 'Welcome to Resiido!',
        content: 'Thank you for joining our apartment community. We\'re excited to have you here!',
        category: 'GENERAL',
        priority: 'NORMAL',
        createdAt: new Date().toISOString(),
        createdBy: { id: 1, name: 'Admin', email: 'admin@resiido.com', role: 'ADMIN' },
      },
      {
        id: 2,
        title: 'Scheduled Maintenance',
        content: 'Water supply will be interrupted on Saturday from 10 AM to 2 PM for maintenance work.',
        category: 'MAINTENANCE',
        priority: 'HIGH',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        createdBy: { id: 1, name: 'Admin', email: 'admin@resiido.com', role: 'ADMIN' },
      },
      {
        id: 3,
        title: 'Community Event',
        content: 'Join us for a community BBQ this Sunday at the rooftop garden. All residents welcome!',
        category: 'EVENT',
        priority: 'NORMAL',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        createdBy: { id: 1, name: 'Admin', email: 'admin@resiido.com', role: 'ADMIN' },
      },
    ];
  }
}

export const announcementService = new AnnouncementService();
export default announcementService;
