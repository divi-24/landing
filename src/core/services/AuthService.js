import AuthRepository from '../repositories/AuthRepository';
import { STORAGE_KEYS } from '../config/apiConfig';

/**
 * AuthService - Business logic layer for authentication
 */
class AuthService {
    /**
     * Login user
     * @param {string} identifier - Email or username
     * @param {string} password - User password
     * @returns {Promise<{token: string, signature: string}>}
     */
    async login(identifier, password) {
        // Validate input
        if (!identifier || !password) {
            throw new Error('Identifier and password are required');
        }

        try {
            const response = await AuthRepository.login(identifier, password);

            // Store token
            this.storeToken(response.token);

            return {
                token: response.token,
                signature: response.signature,
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Signup new user
     * @param {Object} userData - User registration data
     * @returns {Promise<{msg: string}>}
     */
    async signup(userData) {
        // Validate input
        this.validateSignupData(userData);

        try {
            const response = await AuthRepository.signup(userData);
            return {
                msg: response.msg,
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Logout user
     */
    logout() {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        localStorage.removeItem(STORAGE_KEYS.ACCOUNT_TYPE);
    }

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        const token = this.getToken();
        return !!token;
    }

    /**
     * Get stored token
     * @returns {string|null}
     */
    getToken() {
        return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    }

    /**
     * Store token
     * @param {string} token
     */
    storeToken(token) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.ACCOUNT_TYPE, 'creator');
    }

    /**
     * Decode JWT token (basic decode, not validation)
     * @param {string} token
     * @returns {Object|null}
     */
    decodeToken(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }

    /**
     * Get user data from token
     * @returns {Object|null}
     */
    getUserFromToken() {
        const token = this.getToken();
        if (!token) return null;
        return this.decodeToken(token);
    }

    /**
     * Validate signup data
     * @param {Object} userData
     */
    validateSignupData(userData) {
        const { fullName, username, email, password, dob, phone } = userData;

        if (!fullName) throw new Error('Full name is required');
        if (!username) throw new Error('Username is required');
        if (!email) throw new Error('Email is required');
        if (!password) throw new Error('Password is required');
        if (!dob) throw new Error('Date of birth is required');
        if (!phone) throw new Error('Phone number is required');

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }

        // Phone validation (basic)
        const phoneRegex = /^\+?[\d\s-()]+$/;
        if (!phoneRegex.test(phone)) {
            throw new Error('Invalid phone number format');
        }
    }
}

export default new AuthService();
