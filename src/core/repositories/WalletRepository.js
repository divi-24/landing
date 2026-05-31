import apiClient from '../config/apiClient';
import { API_CONFIG } from '../config/apiConfig';

class WalletRepository {
    async getWallet() {
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.WALLET);
        return response.data;
    }

    async getTransactions() {
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.WALLET_TRANSACTIONS);
        return response.data;
    }

    async createDepositOrder(amountInRupees) {
        const response = await apiClient.post(API_CONFIG.ENDPOINTS.WALLET_DEPOSIT, { amount: amountInRupees });
        console.log('Create deposit order response:', response.data);
        return response.data;
    }

    async verifyDepositOrder({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
        console.log('verifyDepositOrder called with:', { razorpay_order_id, razorpay_payment_id, razorpay_signature });
        const response = await apiClient.post(API_CONFIG.ENDPOINTS.WALLET_VERIFY_DEPOSIT, {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        });
        console.log('Verification response:', response.data);
        return response.data;
    }
}

export default new WalletRepository();
