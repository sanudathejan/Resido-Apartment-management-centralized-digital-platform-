/**
 * Visitor Service for Resiido
 * Manages visitor registration and tracking
 */

import apiService from './api';
import { API_CONFIG } from '@/constants/config';
import { VisitorEntry, User } from '@/types';

class VisitorService {
    /**
     * Register a new visitor
     */
    async registerVisitor(visitorData: Omit<VisitorEntry, 'id' | 'status' | 'entryTime'>): Promise<VisitorEntry> {
        try {
            return await apiService.post<VisitorEntry>(API_CONFIG.ENDPOINTS.VISITORS, {
                ...visitorData,
                status: 'PENDING',
                entryTime: new Date().toISOString(),
            });
        } catch (error) {
            console.error('Register visitor error:', error);
            throw error;
        }
    }

    /**
     * Get all visitors for a user
     */
    async getVisitorsByUser(userId: number): Promise<VisitorEntry[]> {
        try {
            return await apiService.get<VisitorEntry[]>(API_CONFIG.ENDPOINTS.VISITORS_BY_USER(userId));
        } catch (error) {
            console.error('Get visitors error:', error);
            return [];
        }
    }

    /**
     * Get all visitors (manager view)
     */
    async getAllVisitors(): Promise<VisitorEntry[]> {
        try {
            return await apiService.get<VisitorEntry[]>(API_CONFIG.ENDPOINTS.VISITORS);
        } catch (error) {
            console.error('Get all visitors error:', error);
            return [];
        }
    }

    /**
     * Check in a visitor
     */
    async checkInVisitor(visitorId: number): Promise<VisitorEntry> {
        const endpoint = `${API_CONFIG.ENDPOINTS.VISITORS}/${visitorId}/checkin`;
        return apiService.put<VisitorEntry>(endpoint, {
            entryTime: new Date().toISOString(),
            status: 'CHECKED_IN',
        });
    }

    /**
     * Check out a visitor
     */
    async checkOutVisitor(visitorId: number): Promise<VisitorEntry> {
        const endpoint = `${API_CONFIG.ENDPOINTS.VISITORS}/${visitorId}/checkout`;
        return apiService.put<VisitorEntry>(endpoint, {
            exitTime: new Date().toISOString(),
            status: 'CHECKED_OUT',
        });
    }

    /**
     * Get pending visitors count
     */
    async getPendingCount(userId: number): Promise<number> {
        const visitors = await this.getVisitorsByUser(userId);
        return visitors.filter((v) => v.status === 'PENDING' || v.status === 'CHECKED_IN').length;
    }

    /**
     * Get today's visitors
     */
    async getTodaysVisitors(userId: number): Promise<VisitorEntry[]> {
        const visitors = await this.getVisitorsByUser(userId);
        const today = new Date().toDateString();
        return visitors.filter((v) => new Date(v.entryTime).toDateString() === today);
    }
}

export const visitorService = new VisitorService();
export default visitorService;
