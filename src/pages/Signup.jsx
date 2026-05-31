import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Clock3, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Auth.css';

const Signup = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isAuthenticated, isBrand, clearError } = useAuth();
    const [accountType, setAccountType] = useState(searchParams.get('role') === 'brand' ? 'brand' : 'creator');

    useEffect(() => {
        if (isAuthenticated) {
            navigate(isBrand ? '/brand/app' : '/');
        }
    }, [isAuthenticated, isBrand, navigate]);

    useEffect(() => () => clearError(), [clearError]);

    const copy = accountType === 'brand'
        ? {
            title: 'Brand signup is coming soon.',
            body: 'Creator discovery, product seeding, campaign rooms, and brand analytics are being prepared for launch.',
        }
        : {
            title: 'Creator signup is coming soon.',
            body: 'Creator profiles, product drops, collections, and monetization tools are almost ready.',
        };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Join <span className="auth-accent">dropp.</span></h1>
                    <p>Creator and brand signups are almost ready.</p>
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
                            <h2>{copy.title}</h2>
                            <p>{copy.body}</p>
                        </div>
                    </div>

                    <Link to="/waitlist" className="auth-button auth-button-link">
                        Join the Waitlist
                    </Link>

                    <div className="auth-footer">
                        <p>
                            Already have early access?{' '}
                            <Link to="/login" className="auth-link">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
