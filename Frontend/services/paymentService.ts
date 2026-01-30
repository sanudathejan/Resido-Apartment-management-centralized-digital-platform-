/**
 * Payment Service for Resiido
 */

import apiService from './api';
import { API_CONFIG } from '@/constants/config';
import { Payment, PaginatedResponse } from '@/types';

class PaymentService {
  /**
   * Get all payments for a user
   */
  async getPaymentsByUser(userId: number): Promise<Payment[]> {
    try {
      // Using general payments endpoint until user-specific one is ready
      const payments = await apiService.get<Payment[]>(API_CONFIG.ENDPOINTS.PAYMENTS);
      return payments.filter((p) => p.resident?.id === userId);
    } catch (error) {
      console.error('Get payments error:', error);
      throw error;
    }
  }

  /**
   * Get all payments
   */
  async getAllPayments(): Promise<Payment[]> {
    return apiService.get<Payment[]>(API_CONFIG.ENDPOINTS.PAYMENTS);
  }

  /**
   * Get pending payments for a user
   */
  async getPendingPayments(userId: number): Promise<Payment[]> {
    const payments = await this.getPaymentsByUser(userId);
    return payments.filter((p) => !p.isPaid);
  }

  /**
   * Get payment history (paid payments)
   */
  async getPaymentHistory(userId: number): Promise<Payment[]> {
    const payments = await this.getPaymentsByUser(userId);
    return payments.filter((p) => p.isPaid);
  }

  /**
   * Make a payment
   */
  async makePayment(paymentId: number): Promise<Payment> {
    const endpoint = `${API_CONFIG.ENDPOINTS.PAYMENTS}/${paymentId}/pay`;
    return apiService.post<Payment>(endpoint, {});
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: number): Promise<Payment> {
    const endpoint = `${API_CONFIG.ENDPOINTS.PAYMENTS}/${paymentId}`;
    return apiService.get<Payment>(endpoint);
  }

  /**
   * Get total pending amount
   */
  async getTotalPendingAmount(userId: number): Promise<number> {
    const pendingPayments = await this.getPendingPayments(userId);
    return pendingPayments.reduce((total, payment) => total + payment.amount, 0);
  }

  /**
   * Get payment summary
   */
  async getPaymentSummary(userId: number) {
    const payments = await this.getPaymentsByUser(userId);
    const pending = payments.filter((p) => !p.isPaid);
    const paid = payments.filter((p) => p.isPaid);

    return {
      totalPending: pending.reduce((sum, p) => sum + p.amount, 0),
      totalPaid: paid.reduce((sum, p) => sum + p.amount, 0),
      pendingCount: pending.length,
      paidCount: paid.length,
    };
  }
}

export const paymentService = new PaymentService();
export default paymentService;
