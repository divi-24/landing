import apiClient from '../config/apiClient';
import { API_CONFIG } from '../config/apiConfig';
import { UserProfile } from '../models/UserModels';

/**
 * UserRepository - Handles all user-related API calls
 */
class UserRepository {
    /**
     * Get user profile
     * @returns {Promise<UserProfile>}
     */
    async getUserProfile() {
        try {
            const response = await apiClient.get(API_CONFIG.ENDPOINTS.MY_PROFILE);
            return UserProfile.fromJSON(response.data);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update user profile
     * @param {FormData} formData - Profile update data
     * @returns {Promise<UserProfile>}
     */
    async updateProfile(formData) {
        try {
            const response = await apiClient.patch(API_CONFIG.ENDPOINTS.MY_PROFILE, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return UserProfile.fromJSON(response.data);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update user password
     * @param {Object} data - Password update data { oldPassword, newPassword }
     * @returns {Promise<any>}
     */
    async updatePassword(data) {
        try {
            const response = await apiClient.patch(API_CONFIG.ENDPOINTS.UPDATE_PASSWORD, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Verify email
     * @returns {Promise<any>}
     */
    async verifyEmail() {
        console.log("UserRepository.verifyEmail called. Endpoint:", API_CONFIG.ENDPOINTS.VERIFY_EMAIL);
        try {
            const response = await apiClient.get(API_CONFIG.ENDPOINTS.VERIFY_EMAIL);
            console.log("UserRepository.verifyEmail response:", response);
            return response.data;
        } catch (error) {
            console.error("UserRepository.verifyEmail error:", error);
            throw error;
        }
    }

    /**
     * Delete user account
     * @returns {Promise<any>}
     */
    async deleteAccount() {
        try {
            const response = await apiClient.delete(API_CONFIG.ENDPOINTS.DELETE_ACCOUNT);
            return response.data;
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
            const response = await apiClient.get(`/user/search/${encodeURIComponent(query)}`);
            return response.data?.results || [];
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
            const response = await apiClient.get(`/user/profile/username/${encodeURIComponent(username)}`);
            return response.data?.profile ? { result: response.data.profile } : response.data;
        } catch {
            // Fall back to search for older deployments that do not have the
            // direct username route yet.
        }

        try {
            const users = await this.searchUsers(username);
            const normalized = username.trim().toLowerCase();
            const exact = users.find((u) => (u.username || '').toLowerCase() === normalized);
            if (exact) {
                return { result: exact };
            }

            // Fallback in case backend later supports direct username lookup.
            const response = await apiClient.get(`/user/profile/${encodeURIComponent(username)}`);
            return response.data?.results ? { result: response.data.results } : response.data;
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
            const response = await apiClient.get(`/user/profile/${encodeURIComponent(userId)}`);
            return response.data?.profile || response.data?.results || response.data;
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
            const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.FOLLOW_USER}/${userId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get followers of a user
     * @param {string} userId - User ID
     * @returns {Promise<Array>}
     */
    async getFollowers(userId) {
        try {
            const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.FOLLOWERS}/${userId}`);
            return response.data?.results || [];
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get users that a user is following
     * @param {string} userId - User ID
     * @returns {Promise<Array>}
     */
    async getFollowing(userId) {
        try {
            const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.FOLLOWING}/${userId}`);
            return response.data?.results || [];
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
            const response = await apiClient.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS);
            return response.data?.results || [];
        } catch (error) {
            throw error;
        }
    }

    async markNotificationRead(id) {
        try {
            await apiClient.patch(`${API_CONFIG.ENDPOINTS.MARK_NOTIFICATION_READ}/${id}`);
        } catch (error) {
            throw error;
        }
    }

    async markAllNotificationsRead() {
        try {
            await apiClient.patch(`${API_CONFIG.ENDPOINTS.MARK_NOTIFICATION_READ}/all`);
        } catch (error) {
            throw error;
        }
    }

    async verifyEmailToken(token) {
        const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.VERIFY_EMAIL_TOKEN}/${encodeURIComponent(token)}`);
        return response.data;
    }

    async getAnalytics() {
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.ANALYTICS);
        return response.data;
    }

    async requestResetPassword(email) {
        const response = await apiClient.post(API_CONFIG.ENDPOINTS.RESET_PASSWORD_REQUEST, { email });
        return response.data;
    }

    async resetPassword(id, token, password) {
        const response = await apiClient.post(
            `${API_CONFIG.ENDPOINTS.RESET_PASSWORD}/${encodeURIComponent(id)}/${encodeURIComponent(token)}`,
            { password }
        );
        return response.data;
    }

    /**
     * Get all users (creators)
     * @returns {Promise<Array>}
     */
    async getAllUsers() {
        try {
            const response = await apiClient.get(API_CONFIG.ENDPOINTS.USERS);
            return response.data?.results || [];
        } catch (error) {
            throw error;
        }
    }
    /**
     * Get profile views
     * @returns {Promise<Object>}
     */
    async getProfileViews() {
        try {
            const response = await apiClient.get(API_CONFIG.ENDPOINTS.PROFILE_VIEWS);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get liked products
     * @returns {Promise<Array>}
     */
    async getLikedProducts() {
        try {
            const response = await apiClient.get(API_CONFIG.ENDPOINTS.LIKED_PRODUCTS);
            return response.data?.results || [];
        } catch (error) {
            throw error;
        }
    }

    /**
     * Create a subscription order
     * @param {string} planId - The ID of the plan (lite/pro)
     * @returns {Promise<Object>} - Razorpay subscription details { subscriptionId, key }
     */
    async createSubscription(planId) {
        try {
            const response = await apiClient.post(API_CONFIG.ENDPOINTS.SUBSCRIPTION_CREATE, { plan: planId });
            return response.data;
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
            const response = await apiClient.get(API_CONFIG.ENDPOINTS.SUBSCRIPTION_TRANSACTIONS);
            return response.data?.transactions || [];
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
            const response = await apiClient.post(API_CONFIG.ENDPOINTS.SUBSCRIPTION_CANCEL);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Verify subscription payment
     * @param {Object} paymentData - Razorpay response data
     * @returns {Promise<Object>} - Verification result
     */
    async verifySubscription(paymentData) {
        try {
            const response = await apiClient.post(API_CONFIG.ENDPOINTS.SUBSCRIPTION_VERIFY, {
                razorpay_payment_id: paymentData.razorpay_payment_id,
                razorpay_subscription_id: paymentData.razorpay_subscription_id,
                razorpay_signature: paymentData.razorpay_signature,
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async getAppliedCampaigns() {
        try {
            const response = await apiClient.get(API_CONFIG.ENDPOINTS.USER_APPLIED_CAMPAIGNS);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default new UserRepository();
