import WalletRepository from '../repositories/WalletRepository';

class WalletService {
    async getWallet() {
        return WalletRepository.getWallet();
    }

    async getTransactions() {
        return WalletRepository.getTransactions();
    }

    async createDepositOrder(amountInRupees) {
        return WalletRepository.createDepositOrder(amountInRupees);
    }

    async verifyDepositOrder(payload) {
        return WalletRepository.verifyDepositOrder(payload);
    }
}

export default new WalletService();
