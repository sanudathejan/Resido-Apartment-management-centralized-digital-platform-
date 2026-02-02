/**
 * Common Area Booking Service
 * API calls for common area booking management
 */

import { API_ENDPOINTS } from '@/constants/config';
import api from './api';
import { CommonArea, CommonAreaBooking } from '@/types';

class BookingService {
  /**
   * Get all available common areas
   */
  async getCommonAreas(): Promise<CommonArea[]> {
    try {
      return await api.get<CommonArea[]>(API_ENDPOINTS.COMMON_AREAS || '/api/common-areas');
    } catch (error) {
      console.error('Error fetching common areas:', error);
      // Return mock data for demo
      return this.getMockCommonAreas();
    }
  }

  /**
   * Get common area by ID
   */
  async getCommonAreaById(id: number): Promise<CommonArea> {
    try {
      return await api.get<CommonArea>(`/api/common-areas/${id}`);
    } catch (error) {
      console.error('Error fetching common area:', error);
      throw error;
    }
  }

  /**
   * Get user's bookings
   */
  async getUserBookings(userId: number): Promise<CommonAreaBooking[]> {
    try {
      return await api.get<CommonAreaBooking[]>(`/api/bookings/user/${userId}`);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return [];
    }
  }

  /**
   * Get all bookings (for managers)
   */
  async getAllBookings(): Promise<CommonAreaBooking[]> {
    try {
      return await api.get<CommonAreaBooking[]>('/api/bookings');
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      return [];
    }
  }

  /**
   * Create a new booking
   */
  async createBooking(bookingData: Partial<CommonAreaBooking>): Promise<CommonAreaBooking> {
    try {
      return await api.post<CommonAreaBooking>('/api/bookings', bookingData);
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  /**
   * Update booking status (for managers)
   */
  async updateBookingStatus(
    bookingId: number, 
    status: 'APPROVED' | 'REJECTED' | 'CANCELLED'
  ): Promise<CommonAreaBooking> {
    try {
      return await api.put<CommonAreaBooking>(`/api/bookings/${bookingId}/status`, { status });
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: number): Promise<void> {
    try {
      await api.delete(`/api/bookings/${bookingId}`);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  /**
   * Get bookings for a specific date
   */
  async getBookingsByDate(date: string): Promise<CommonAreaBooking[]> {
    try {
      return await api.get<CommonAreaBooking[]>(`/api/bookings/date/${date}`);
    } catch (error) {
      console.error('Error fetching bookings by date:', error);
      return [];
    }
  }

  /**
   * Check availability for a common area at specific time
   */
  async checkAvailability(
    commonAreaId: number,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    try {
      const response = await api.post<{ available: boolean }>('/api/bookings/check-availability', {
        commonAreaId,
        date,
        startTime,
        endTime,
      });
      return response.available;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  }

  // Mock data for demo purposes
  private getMockCommonAreas(): CommonArea[] {
    return [
      {
        id: 1,
        name: 'Swimming Pool',
        description: 'Olympic-sized pool with lifeguard on duty',
        capacity: 20,
        isAvailable: true,
        apartmentId: 1,
        openTime: '06:00',
        closeTime: '21:00',
      },
      {
        id: 2,
        name: 'Fitness Center',
        description: 'Fully equipped gym with modern equipment',
        capacity: 15,
        isAvailable: true,
        apartmentId: 1,
        openTime: '05:00',
        closeTime: '23:00',
      },
      {
        id: 3,
        name: 'Party Hall',
        description: 'Spacious hall for events and celebrations',
        capacity: 100,
        isAvailable: true,
        apartmentId: 1,
        openTime: '09:00',
        closeTime: '22:00',
      },
      {
        id: 4,
        name: 'Meeting Room',
        description: 'Conference room with projector',
        capacity: 12,
        isAvailable: true,
        apartmentId: 1,
        openTime: '08:00',
        closeTime: '20:00',
      },
    ];
  }
}

export const bookingService = new BookingService();
export default bookingService;
