import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Clock3, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Auth.css';

const Login = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isBrand, clearError } = useAuth();

    const [accountType, setAccountType] = useState('creator');

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate(isBrand ? '/brand/app' : '/');
        }
    }, [isAuthenticated, isBrand, navigate]);

    // Clear errors when component unmounts
    useEffect(() => {
        return () => {
            clearError();
        };
    }, [clearError]);

    const comingSoonCopy = accountType === 'brand'
        ? {
            title: 'Brand access is coming soon.',
            body: 'Campaigns, creator discovery, analytics, and product management are being polished before public launch.',
        }
        : {
            title: 'Creator login is coming soon.',
            body: 'Profiles, collections, product drops, and monetization tools are being prepared for the next release.',
        };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Dropp <span className="auth-accent">access.</span></h1>
                    <p>Creator and brand accounts are almost ready.</p>
                </div>

                <div className="auth-form">
                    <div className="account-switch" role="tablist" aria-label="Choose account type">
                        <button
                            type="button"
                            className={`account-switch-option ${accountType === 'creator' ? 'active' : ''}`}
                            onClick={() => setAccountType('creator')}
                            role="tab"
                            aria-selected={accountType === 'creator'}
                        >
                            Creator
                        </button>
                        <button
                            type="button"
                            className={`account-switch-option ${accountType === 'brand' ? 'active' : ''}`}
                            onClick={() => setAccountType('brand')}
                            role="tab"
                            aria-selected={accountType === 'brand'}
                        >
                            Brand
                        </button>
                    </div>

                    <div className="auth-coming-soon">
                        <div className="auth-coming-icon">
                            <Clock3 size={24} strokeWidth={1.8} />
                        </div>
                        <div>
                            <span className="auth-coming-kicker">
                                <Sparkles size={13} />
                                Coming soon
                            </span>
                            <h2>{comingSoonCopy.title}</h2>
                            <p>{comingSoonCopy.body}</p>
                        </div>
                    </div>

                    <Link to="/landing" className="auth-button auth-button-link">
                        Back to Dropp
                    </Link>

                    <div className="auth-footer">
                        <p>
                            Want to explore meanwhile?{' '}
                            <Link to="/waitlist" className="auth-link">
                                Join the waitlist
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
