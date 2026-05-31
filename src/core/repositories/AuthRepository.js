import apiClient from '../config/apiClient';
import { API_CONFIG } from '../config/apiConfig';
import { LoginRequest, LoginResponse, SignupRequest, SignupResponse } from '../models/AuthModels';

/**
 * AuthRepository - Handles all authentication-related API calls
 */
class AuthRepository {
    /**
     * Login user
     * @param {string} identifier - Email or username
     * @param {string} password - User password
     * @returns {Promise<LoginResponse>}
     */
    async login(identifier, password) {
        try {
            const request = new LoginRequest(identifier, password);
            const response = await apiClient.post(API_CONFIG.ENDPOINTS.LOGIN, request.toJSON());
            return LoginResponse.fromJSON(response.data);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Signup new user
     * @param {Object} userData - User registration data
     * @returns {Promise<SignupResponse>}
     */
    async signup(userData) {
        try {
            const request = new SignupRequest(
                userData.fullName,
                userData.username,
                userData.email,
                userData.password,
                userData.dob,
                userData.phone
            );
            const response = await apiClient.post(API_CONFIG.ENDPOINTS.SIGNUP, request.toJSON());
            return SignupResponse.fromJSON(response.data);
        } catch (error) {
            throw error;
        }
    }
}

export default new AuthRepository();
