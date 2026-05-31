import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
    AlertCircle,
    Bell,
    BriefcaseBusiness,
    Globe,
    HelpCircle,
    Lock,
    Monitor,
    Moon,
    Settings as SettingsIcon,
    Shield,
    Sun,
    User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BrandService from '../core/services/BrandService';
import Snackbar from '../components/Snackbar';
import BrandProfileEditModal from '../components/BrandProfileEditModal';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/Settings.css';
import '../styles/BrandPortal.css';

const BrandSettings = () => {
    const navigate = useNavigate();
    const { logout, updateUser } = useAuth();
    const { themePreference, setThemePreference, theme: resolvedTheme } = useTheme();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteValue, setDeleteValue] = useState('');
    const [snackbar, setSnackbar] = useState({ isVisible: false, message: '', type: 'success' });

    const showSnackbar = useCallback((message, type = 'success') => {
        setSnackbar({ isVisible: true, message, type });
    }, []);

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        try {
            const data = await BrandService.getProfile();
            setProfile(data);
            updateUser(data);
        } catch (error) {
            console.error('Error fetching brand profile:', error);
            showSnackbar('Failed to load brand settings', 'error');
        } finally {
            setLoading(false);
        }
    }, [showSnackbar, updateUser]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleDeleteAccount = async () => {
        if (deleteValue !== profile?.brandName) {
            showSnackbar('Brand name does not match', 'error');
            return;
        }

        try {
            await BrandService.deleteAccount();
            showSnackbar('Brand account deleted successfully', 'success');
            logout();
            window.location.href = '/landing';
        } catch (error) {
            console.error('Error deleting brand account:', error);
            showSnackbar(error.message || 'Failed to delete brand account', 'error');
        }
    };

    const handleProfileUpdate = (updatedProfile) => {
        setProfile(updatedProfile);
        updateUser(updatedProfile);
        showSnackbar('Brand profile updated', 'success');
    };

    return (
        <div
            className="settings-page brand-settings-page"
        >
            <div className="settings-container">
                <div className="brand-settings-header">
                    <div>
                        <span>Brand Workspace</span>
                        <h1 className="settings-title">Settings</h1>
                        <p>{loading ? 'Loading...' : profile?.brandName || profile?.email || 'Manage brand account preferences'}</p>
                    </div>
                    <button className="brand-primary-btn" onClick={() => setIsEditOpen(true)}>Edit Profile</button>
                </div>

                <section className="settings-section">
                    <h2 className="section-title"><User size={20} />Account</h2>
                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>Profile Information</h3>
                            <p>Update brand details, location, links, and collaboration preferences</p>
                        </div>
                        <button className="settings-btn" onClick={() => setIsEditOpen(true)}>Edit</button>
                    </div>
                    <div className="settings-item settings-item-email">
                        <div className="settings-item-content">
                            <h3>Email Address</h3>
                            <p className="settings-email-value">{loading ? 'Loading...' : profile?.email || 'brand@example.com'}</p>
                        </div>
                    </div>
                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>Brand Name</h3>
                            <p>{loading ? 'Loading...' : profile?.brandName || 'Not added yet'}</p>
                        </div>
                        <button className="settings-btn" onClick={() => navigate('/brand/profile')}>View</button>
                    </div>
                    <div className="settings-item settings-item-appearance">
                        <div className="settings-item-content settings-appearance-block">
                            <h3>Appearance</h3>
                            <p>
                                {themePreference === 'system'
                                    ? `Match device - using ${resolvedTheme === 'dark' ? 'dark' : 'light'} mode now`
                                    : 'Choose a fixed look for Dropp'}
                            </p>
                            <div className="settings-appearance-modes" role="group" aria-label="Color theme">
                                <button type="button" className={`settings-appearance-btn ${themePreference === 'light' ? 'active' : ''}`} onClick={() => setThemePreference('light')}>
                                    <Sun size={18} /><span>Light</span>
                                </button>
                                <button type="button" className={`settings-appearance-btn ${themePreference === 'dark' ? 'active' : ''}`} onClick={() => setThemePreference('dark')}>
                                    <Moon size={18} /><span>Dark</span>
                                </button>
                                <button type="button" className={`settings-appearance-btn ${themePreference === 'system' ? 'active' : ''}`} onClick={() => setThemePreference('system')}>
                                    <Monitor size={18} /><span>System</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="settings-section">
                    <h2 className="section-title"><Lock size={20} />Privacy & Security</h2>
                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>Password</h3>
                            <p>Password updates for brand accounts are not exposed by the brand API yet</p>
                        </div>
                        <button className="settings-btn" onClick={() => showSnackbar('Brand password update API is not available yet', 'info')}>Update</button>
                    </div>
                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>Session Token</h3>
                            <p>Your brand session is secured with the token returned by brand login</p>
                        </div>
                        <Shield size={20} />
                    </div>
                </section>

                <section className="settings-section">
                    <h2 className="section-title"><Bell size={20} />Notifications</h2>
                    {['Email Notifications', 'Push Notifications', 'Campaign Updates'].map((label, index) => (
                        <div className="settings-item" key={label}>
                            <div className="settings-item-content">
                                <h3>{label}</h3>
                                <p>{index === 2 ? 'Notifications when creators respond to campaign activity' : 'Receive brand workspace updates'}</p>
                            </div>
                            <label className="settings-toggle">
                                <input type="checkbox" defaultChecked={index !== 2} onChange={(e) => showSnackbar(`${label} ${e.target.checked ? 'enabled' : 'disabled'}`, 'success')} />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    ))}
                </section>

                <section className="settings-section">
                    <h2 className="section-title"><SettingsIcon size={20} />Preferences</h2>
                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>Dashboard</h3>
                            <p>View campaign performance and creator activity</p>
                        </div>
                        <button className="settings-btn" onClick={() => navigate('/brand/dashboard')}>Open</button>
                    </div>
                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>Campaigns</h3>
                            <p>Manage live, draft, and review campaigns</p>
                        </div>
                        <button className="settings-btn" onClick={() => navigate('/brand/campaigns')}>View</button>
                    </div>
                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>Creators</h3>
                            <p>Review creator matches and shortlists</p>
                        </div>
                        <button className="settings-btn" onClick={() => navigate('/brand/creators')}>View</button>
                    </div>
                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>Language</h3>
                            <p>English (US)</p>
                        </div>
                    </div>
                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>Time Zone</h3>
                            <p>Automatic</p>
                        </div>
                    </div>
                </section>

                <section className="settings-section">
                    <h2 className="section-title"><HelpCircle size={20} />Support</h2>
                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>Help Center</h3>
                            <p>Get answers to your brand workspace questions</p>
                        </div>
                        <button className="settings-btn" onClick={() => navigate('/help')}>Visit</button>
                    </div>
                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>Contact Support</h3>
                            <p>Reach out to the Dropp team</p>
                        </div>
                        <button className="settings-btn" onClick={() => window.open('mailto:ondropp.app@gmail.com')}>Contact</button>
                    </div>
                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>Terms of Service</h3>
                            <p>Read platform terms and policies</p>
                        </div>
                        <button className="settings-btn" onClick={() => navigate('/terms')}>View</button>
                    </div>
                </section>

                <section className="settings-section">
                    <h2 className="section-title"><Globe size={20} />About & Links</h2>
                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>About Dropp</h3>
                            <p>Learn more about the platform</p>
                        </div>
                        <button className="settings-btn" onClick={() => navigate('/about')}>View</button>
                    </div>
                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>Brand Portal</h3>
                            <p>Return to your brand home</p>
                        </div>
                        <button className="settings-btn" onClick={() => navigate('/brand/app')}>Open</button>
                    </div>
                    <div className="settings-links-row">
                        <a href="https://x.com/ondropp" target="_blank" rel="noopener noreferrer" className="settings-social-link">Twitter / X</a>
                        <a href="https://instagram.com/ondropp" target="_blank" rel="noopener noreferrer" className="settings-social-link">Instagram</a>
                        <a href="https://linkedin.com/company/ondropp" target="_blank" rel="noopener noreferrer" className="settings-social-link">LinkedIn</a>
                    </div>
                    <div className="settings-links-row">
                        <a href="/privacy" className="settings-legal-link" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }}>Privacy Policy</a>
                        <a href="/terms" className="settings-legal-link" onClick={(e) => { e.preventDefault(); navigate('/terms'); }}>Terms of Service</a>
                    </div>
                </section>

                <section className="settings-section danger-section">
                    <h2 className="section-title"><BriefcaseBusiness size={20} />Danger Zone</h2>
                    <div className="settings-item">
                        <div className="settings-item-content">
                            <h3>Delete Brand Account</h3>
                            <p>Permanently delete this brand account and remove brand data</p>
                        </div>
                        <button className="settings-btn btn-danger" onClick={() => setIsDeleteOpen(true)}>Delete</button>
                    </div>
                </section>
            </div>

            <AnimatePresence>
                {isEditOpen && (
                    <BrandProfileEditModal
                        profile={profile}
                        onClose={() => setIsEditOpen(false)}
                        onUpdate={handleProfileUpdate}
                    />
                )}
                {isDeleteOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content danger-modal">
                            <h2>Delete Brand Account</h2>
                            <p className="warning-text">
                                <AlertCircle size={20} />
                                This action cannot be undone. This will permanently delete this brand account.
                            </p>
                            <p>Please type <strong>{profile?.brandName}</strong> to confirm.</p>
                            <input
                                type="text"
                                value={deleteValue}
                                onChange={(e) => setDeleteValue(e.target.value)}
                                placeholder="Type your brand name"
                                className="settings-input"
                            />
                            <div className="modal-actions">
                                <button className="settings-btn" onClick={() => {
                                    setIsDeleteOpen(false);
                                    setDeleteValue('');
                                }}>Cancel</button>
                                <button className="settings-btn btn-danger" onClick={handleDeleteAccount} disabled={deleteValue !== profile?.brandName}>
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            <Snackbar
                isVisible={snackbar.isVisible}
                message={snackbar.message}
                type={snackbar.type}
                onClose={() => setSnackbar((prev) => ({ ...prev, isVisible: false }))}
            />
        </div>
    );
};

export default BrandSettings;
