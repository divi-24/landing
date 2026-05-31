import UserRepository from '../repositories/UserRepository';

/**
 * UserService - Business logic layer for user operations
 */
class UserService {
    /**
     * Get user profile
     * @returns {Promise<UserProfile>}
     */
    async getUserProfile() {
        try {
            return await UserRepository.getUserProfile();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update user profile
     * @param {FormData} formData
     * @returns {Promise<UserProfile>}
     */
    async updateProfile(formData) {
        try {
            return await UserRepository.updateProfile(formData);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update user password
     * @param {string} oldPassword
     * @param {string} newPassword
     * @returns {Promise<any>}
     */
    async updatePassword(oldPassword, newPassword) {
        try {
            return await UserRepository.updatePassword({ oldPassword, newPassword });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Verify email
     * @returns {Promise<any>}
     */
    async verifyEmail() {
        console.log("UserService.verifyEmail called");
        try {
            return await UserRepository.verifyEmail();
        } catch (error) {
            console.error("UserService.verifyEmail error:", error);
            throw error;
        }
    }

    /**
     * Delete user account
     * @returns {Promise<any>}
     */
    async deleteAccount() {
        try {
            return await UserRepository.deleteAccount();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Search users by query
     * @param {string} query - Search query
     * @returns {Promise<Array>}
     */
    async searchUsers(query) {
        try {
            return await UserRepository.searchUsers(query);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get user profile by username
     * @param {string} username - Username to fetch
     * @returns {Promise<Object>}
     */
    async getUserByUsername(username) {
        try {
            return await UserRepository.getUserByUsername(username);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get user profile by userId
     * @param {string} userId - User ID to fetch
     * @returns {Promise<Object>}
     */
    async getUserById(userId) {
        try {
            return await UserRepository.getUserById(userId);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Follow/Unfollow a user
     * @param {string} userId - Target user ID
     * @returns {Promise<Object>}
     */
    async followUser(userId) {
        try {
            return await UserRepository.followUser(userId);
        } catch (error) {
            console.error('UserService.followUser error:', error);
            throw error;
        }
    }

    /**
     * Get followers of a user
     * @param {string} userId
     * @returns {Promise<Array>}
     */
    async getFollowers(userId) {
        try {
            return await UserRepository.getFollowers(userId);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get users that a user is following
     * @param {string} userId
     * @returns {Promise<Array>}
     */
    async getFollowing(userId) {
        try {
            return await UserRepository.getFollowing(userId);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get user notifications
     * @returns {Promise<Array>}
     */
    async getNotifications() {
        try {
            return await UserRepository.getNotifications();
        } catch (error) {
            throw error;
        }
    }

    async markNotificationRead(id) {
        try {
            return await UserRepository.markNotificationRead(id);
        } catch (error) {
            throw error;
        }
    }

    async markAllNotificationsRead() {
        try {
            return await UserRepository.markAllNotificationsRead();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get all users (creators)
     * @returns {Promise<Array>}
     */
    async getAllUsers() {
        try {
            return await UserRepository.getAllUsers();
        } catch (error) {
            throw error;
        }
    }

    async verifyEmailToken(token) {
        return UserRepository.verifyEmailToken(token);
    }

    async getAnalytics() {
        return UserRepository.getAnalytics();
    }

    async requestResetPassword(email) {
        return UserRepository.requestResetPassword(email);
    }

    async resetPassword(id, token, password) {
        return UserRepository.resetPassword(id, token, password);
    }

    async getProfileViews() {
        return UserRepository.getProfileViews();
    }

    async getLikedProducts() {
        try {
            return await UserRepository.getLikedProducts();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Create a subscription order
     * @param {string} planId - The ID of the plan (lite/pro)
     * @returns {Promise<Object>} - Razorpay order details
     */
    async createSubscription(planId) {
        try {
            return await UserRepository.createSubscription(planId);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Cancel active subscription
     * @returns {Promise<Object>}
     */
    async cancelSubscription() {
        try {
            return await UserRepository.cancelSubscription();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get subscription transaction history
     * @returns {Promise<Array>} - List of transactions
     */
    async getSubscriptionTransactions() {
        try {
            return await UserRepository.getSubscriptionTransactions();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Verify subscription payment
     * @param {Object} paymentData - Razorpay payment response data
     * @returns {Promise<Object>} - Verification result
     */
    async verifySubscription(paymentData) {
        try {
            return await UserRepository.verifySubscription(paymentData);
        } catch (error) {
            throw error;
        }
    }

    async getAppliedCampaigns() {
        try {
            return await UserRepository.getAppliedCampaigns();
        } catch (error) {
            throw error;
        }
    }
}

export default new UserService();
