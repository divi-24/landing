import React, { useState } from 'react';
import { X, Loader2, Sparkles } from 'lucide-react';
import UserService from '../core/services/UserService';
import { categories } from '../data/categories';
import '../styles/EditProfileModal.css';

const GENDERS = ["Male", "Female", "Rather Not to Say"];
const INTEREST_OPTIONS = categories.filter(c => c !== 'All');

const OnboardingModal = ({ onClose, onComplete }) => {
    const [gender, setGender] = useState('');
    const [interests, setInterests] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleInterestToggle = (interest) => {
        setInterests(prev =>
            prev.includes(interest)
                ? prev.filter(i => i !== interest)
                : [...prev, interest]
        );
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const data = new FormData();
            if (gender) data.append('gender', gender);
            interests.forEach(i => data.append('interests', i));

            await UserService.updateProfile(data);
            if (onComplete) onComplete();
            onClose();
        } catch (error) {
            console.error('Onboarding update failed:', error);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        sessionStorage.setItem('dropp_onboarding_skipped', 'true');
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '520px' }}>
                <div className="modal-header">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sparkles size={20} /> Welcome to Dropp
                    </h2>
                    <button type="button" className="close-btn" onClick={handleSkip}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        Help us personalize your feed. You can always update these later in your profile.
                    </p>

                    <div className="form-group">
                        <label>Gender</label>
                        <select
                            className="form-select"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                        >
                            <option value="">Select gender</option>
                            {GENDERS.map(g => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>What are you interested in?</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                            {INTEREST_OPTIONS.map(interest => (
                                <button
                                    key={interest}
                                    type="button"
                                    onClick={() => handleInterestToggle(interest)}
                                    style={{
                                        padding: '0.4rem 0.85rem',
                                        borderRadius: '20px',
                                        border: interests.includes(interest) ? '1.5px solid var(--accent-blue, #3b82f6)' : '1px solid var(--border-color, #333)',
                                        background: interests.includes(interest) ? 'var(--accent-blue, #3b82f6)' : 'transparent',
                                        color: interests.includes(interest) ? '#fff' : 'var(--text-secondary, #aaa)',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        fontWeight: interests.includes(interest) ? '500' : '400'
                                    }}
                                >
                                    {interest}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={handleSkip}>
                        Skip for now
                    </button>
                    <button
                        type="button"
                        className="save-btn"
                        disabled={loading}
                        onClick={handleSubmit}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" style={{ marginRight: '8px', display: 'inline' }} />
                                Saving...
                            </>
                        ) : 'Continue'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingModal;
