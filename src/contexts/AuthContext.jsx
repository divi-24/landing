import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AuthService from '../core/services/AuthService';
import UserService from '../core/services/UserService';
import BrandService from '../core/services/BrandService';
import YouTubeService from '../core/services/YouTubeService';
import { STORAGE_KEYS } from '../core/config/apiConfig';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [accountType, setAccountType] = useState('creator');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize auth state from localStorage, then hydrate with fresh profile from API
    useEffect(() => {
        const initAuth = async () => {
            try {
                const storedToken = AuthService.getToken();
                if (storedToken) {
                    const storedAccountType = localStorage.getItem(STORAGE_KEYS.ACCOUNT_TYPE) || 'creator';
                    const tokenData = AuthService.getUserFromToken();
                    if (tokenData) {
                        setToken(storedToken);
                        setAccountType(storedAccountType);
                        setIsAuthenticated(true);
                        try {
                            const freshProfile = storedAccountType === 'brand'
                                ? await BrandService.getProfile()
                                : await UserService.getUserProfile();
                            setUser(freshProfile);
                        } catch {
                            setUser(tokenData);
                        }
                    }
                }
            } catch (err) {
                console.error('Error initializing auth:', err);
                AuthService.logout();
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    /**
     * Login user
     * @param {string} identifier - Email or username
     * @param {string} password - User password
     */
    const login = async (identifier, password, selectedAccountType = 'creator') => {
        setLoading(true);
        setError(null);

        try {
            const response = selectedAccountType === 'brand'
                ? await BrandService.login(identifier, password)
                : await AuthService.login(identifier, password);

            setToken(response.token);
            setAccountType(selectedAccountType);
            setIsAuthenticated(true);

            try {
                const freshProfile = selectedAccountType === 'brand'
                    ? await BrandService.getProfile()
                    : await UserService.getUserProfile();
                setUser(freshProfile);
            } catch {
                setUser(AuthService.getUserFromToken());
            }

            return { success: true, data: response };
        } catch (err) {
            const errorMessage = err.message || 'Login failed. Please try again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Signup new user
     * @param {Object} userData - User registration data
     */
    const signup = async (userData, selectedAccountType = 'creator') => {
        setLoading(true);
        setError(null);

        try {
            const response = selectedAccountType === 'brand'
                ? await BrandService.signup(userData.email, userData.password)
                : await AuthService.signup(userData);
            return { success: true, data: response };
        } catch (err) {
            const errorMessage = err.message || 'Signup failed. Please try again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Logout user
     */
    const logout = () => {
        // Clear all cached YouTube overview data so the next user
        // doesn't see stale data from the previous session.
        YouTubeService.clearCache();
        AuthService.logout();
        setToken(null);
        setUser(null);
        setAccountType('creator');
        setIsAuthenticated(false);
        setError(null);
    };

    /**
     * Update user data in state and localStorage
     * @param {Object} userData 
     */
    const updateUser = useCallback((userData) => {
        setUser(userData);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    }, []);

    /**
     * Clear error
     */
    const clearError = () => {
        setError(null);
    };

    const value = {
        user,
        token,
        accountType,
        isBrand: accountType === 'brand',
        isAuthenticated,
        loading,
        error,
        login,
        signup,
        logout,
        clearError,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
