import React, { useState } from 'react';
import { X, Loader2, Eye, EyeOff, Check, Circle } from 'lucide-react';
import UserService from '../core/services/UserService';
import '../styles/EditProfileModal.css'; // Reusing existing modal styles

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UpdatePasswordModal = ({ onClose }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Password Strength State
    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        upper: false,
        number: false,
        special: false
    });

    React.useEffect(() => {
        const pass = formData.newPassword;
        setPasswordCriteria({
            length: pass.length >= 8,
            upper: /[A-Z]/.test(pass),
            number: /[0-9]/.test(pass),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(pass)
        });
    }, [formData.newPassword]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.newPassword !== formData.confirmNewPassword) {
            setError("New passwords do not match");
            return;
        }

        if (!passwordCriteria.length) return setError('Password must be at least 8 characters');
        if (!passwordCriteria.upper) return setError('Password must contain at least one uppercase letter');
        if (!passwordCriteria.number) return setError('Password must contain at least one number');
        if (!passwordCriteria.special) return setError('Password must contain at least one special character');

        setLoading(true);

        try {
            await UserService.updatePassword(formData.oldPassword, formData.newPassword);
            setSuccess("Password updated successfully! Redirecting to login...");
            setFormData({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
            setTimeout(() => {
                logout();
                onClose();
                navigate('/login');
            }, 2000);
        } catch (err) {
            console.error("Password update error:", err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("Failed to update password. Please check your credentials.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '450px' }}>
                <form onSubmit={handleSubmit}>
                    <div className="modal-header">
                        <h2>Update Password</h2>
                        <button type="button" className="close-btn" onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className="modal-body">
                        {error && (
                            <div className="form-error-message" style={{ color: 'red', marginBottom: '16px', padding: '10px', backgroundColor: 'rgba(255, 0, 0, 0.1)', borderRadius: '8px' }}>
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="form-success-message" style={{ color: 'green', marginBottom: '16px', padding: '10px', backgroundColor: 'rgba(0, 255, 0, 0.1)', borderRadius: '8px' }}>
                                {success}
                            </div>
                        )}

                        <div className="form-group">
                            <label>Current Password</label>
                            <div className="password-input-wrapper" style={{ position: 'relative' }}>
                                <input
                                    type={showOldPassword ? "text" : "password"}
                                    name="oldPassword"
                                    className="form-input"
                                    value={formData.oldPassword}
                                    onChange={handleChange}
                                    placeholder="Enter current password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#666'
                                    }}
                                >
                                    {showOldPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>New Password</label>
                            <div className="password-input-wrapper" style={{ position: 'relative' }}>
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    name="newPassword"
                                    className="form-input"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder="Enter new password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#666'
                                    }}
                                >
                                    {showNewPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                </button>
                            </div>
                        </div>


                        {/* Password Strength Indicators */}
                        {/* Modern Password Strength UI */}
                        <div className="password-strength-container">
                            <div className="strength-bar-container">
                                <div className={`strength-bar-segment ${passwordCriteria.length ? 'filled' : ''}`}></div>
                                <div className={`strength-bar-segment ${passwordCriteria.upper ? 'filled' : ''}`}></div>
                                <div className={`strength-bar-segment ${passwordCriteria.number ? 'filled' : ''}`}></div>
                                <div className={`strength-bar-segment ${passwordCriteria.special ? 'filled' : ''}`}></div>
                            </div>

                            <div className="strength-labels">
                                <span className={`strength-pill ${passwordCriteria.length ? 'met' : ''}`}>8+ Chars</span>
                                <span className={`strength-pill ${passwordCriteria.upper ? 'met' : ''}`}>Uppercase</span>
                                <span className={`strength-pill ${passwordCriteria.number ? 'met' : ''}`}>Number</span>
                                <span className={`strength-pill ${passwordCriteria.special ? 'met' : ''}`}>Special</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmNewPassword"
                                className="form-input"
                                value={formData.confirmNewPassword}
                                onChange={handleChange}
                                placeholder="Confirm new password"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="save-btn" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" style={{ marginRight: '8px', display: 'inline' }} />
                                    Updating...
                                </>
                            ) : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default UpdatePasswordModal;
