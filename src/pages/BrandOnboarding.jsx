import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import BrandService from '../core/services/BrandService';
import { useAuth } from '../contexts/AuthContext';
import '../styles/BrandPortal.css';

const INDUSTRIES = [
    'Fashion & Apparel',
    'Beauty & Personal Care',
    'Health & Wellness',
    'Food & Beverage',
    'Travel & Hospitality',
    'Technology & Electronics',
    'Home & Lifestyle',
    'Sports & Fitness',
    'Education & E-Learning',
    'Finance & Fintech',
    'Entertainment & Media',
    'Automotive',
    'Real Estate',
    'Retail & E-Commerce',
    'Non-Profit & Social Causes',
];

const COLLABORATION_TYPES = ['PAID_PARTNERSHIP', 'AFFILIATE'];

const initialForm = {
    brandName: '',
    legalName: '',
    description: '',
    industry: [],
    location: {
        state: '',
        city: '',
        pincode: '',
    },
    contact: {
        website: '',
        socialLinks: {
            instagram: '',
            youtube: '',
            linkedin: '',
        },
        whatsappBusinessNumber: '',
        supportEmail: '',
    },
    collaborationInfo: {
        collaborationOpen: true,
        collaborationTypes: [],
    },
};

const BrandOnboarding = () => {
    const navigate = useNavigate();
    const { updateUser } = useAuth();
    const [step, setStep] = useState(0);
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const steps = useMemo(() => [
        { title: 'Brand Identity', subtitle: 'Start with the name shoppers and creators will recognize.' },
        { title: 'Category Fit', subtitle: 'Choose the industries that best describe your brand.' },
        { title: 'Location', subtitle: 'Add your operating location for creator discovery.' },
        { title: 'Contact Channels', subtitle: 'Add the links and inboxes creators should use.' },
        { title: 'Collaborations', subtitle: 'Set how your team wants to work with creators.' },
    ], []);

    const updateField = (path, value) => {
        setForm((prev) => {
            const next = structuredClone(prev);
            const keys = path.split('.');
            const lastKey = keys.pop();
            const target = keys.reduce((acc, key) => acc[key], next);
            target[lastKey] = value;
            return next;
        });
        setError('');
    };

    const toggleArrayValue = (path, value) => {
        const keys = path.split('.');
        const current = keys.reduce((acc, key) => acc[key], form);
        const nextValue = current.includes(value)
            ? current.filter((item) => item !== value)
            : [...current, value];
        updateField(path, nextValue);
    };

    const validateStep = () => {
        if (step === 0) {
            if (!form.brandName.trim()) return 'Brand name is required';
            if (!form.legalName.trim()) return 'Legal name is required';
            if (!form.description.trim()) return 'Description is required';
        }
        if (step === 1 && form.industry.length === 0) return 'Select at least one industry';
        if (step === 2) {
            if (!form.location.state.trim()) return 'State is required';
            if (!form.location.city.trim()) return 'City is required';
            if (!form.location.pincode.trim()) return 'Pincode is required';
        }
        if (step === 3) {
            if (!form.contact.website.trim()) return 'Website is required';
            if (!form.contact.supportEmail.trim()) return 'Support email is required';
        }
        if (step === 4 && form.collaborationInfo.collaborationTypes.length === 0) {
            return 'Select at least one collaboration type';
        }
        return '';
    };

    const handleNext = async () => {
        const validationError = validateStep();
        if (validationError) {
            setError(validationError);
            return;
        }

        if (step < steps.length - 1) {
            setStep((current) => current + 1);
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            await BrandService.updateProfile(form);
            const profile = await BrandService.getProfile();
            updateUser(profile);
            navigate('/brand/profile');
        } catch (err) {
            setError(err.message || 'Could not update brand profile');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStep = () => {
        if (step === 0) {
            return (
                <div className="brand-onboarding-fields">
                    <label>
                        Brand name
                        <input value={form.brandName} onChange={(e) => updateField('brandName', e.target.value)} placeholder="EcoGlow Naturals" />
                    </label>
                    <label>
                        Legal name
                        <input value={form.legalName} onChange={(e) => updateField('legalName', e.target.value)} placeholder="EcoGlow Naturals Private Limited" />
                    </label>
                    <label>
                        Description
                        <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} placeholder="Sustainable skincare brand focused on organic products." rows={5} />
                    </label>
                </div>
            );
        }

        if (step === 1) {
            return (
                <div className="brand-chip-grid">
                    {INDUSTRIES.map((industry) => (
                        <button
                            key={industry}
                            type="button"
                            className={`brand-chip ${form.industry.includes(industry) ? 'selected' : ''}`}
                            onClick={() => toggleArrayValue('industry', industry)}
                        >
                            {industry}
                        </button>
                    ))}
                </div>
            );
        }

        if (step === 2) {
            return (
                <div className="brand-onboarding-fields three">
                    <label>
                        State
                        <input value={form.location.state} onChange={(e) => updateField('location.state', e.target.value)} placeholder="California" />
                    </label>
                    <label>
                        City
                        <input value={form.location.city} onChange={(e) => updateField('location.city', e.target.value)} placeholder="Los Angeles" />
                    </label>
                    <label>
                        Pincode
                        <input value={form.location.pincode} onChange={(e) => updateField('location.pincode', e.target.value)} placeholder="90028" />
                    </label>
                </div>
            );
        }

        if (step === 3) {
            return (
                <div className="brand-onboarding-fields two">
                    <label>
                        Website
                        <input value={form.contact.website} onChange={(e) => updateField('contact.website', e.target.value)} placeholder="https://www.ecoglownaturals.com" />
                    </label>
                    <label>
                        Support email
                        <input value={form.contact.supportEmail} onChange={(e) => updateField('contact.supportEmail', e.target.value)} placeholder="support@ecoglownaturals.com" />
                    </label>
                    <label>
                        WhatsApp Business
                        <input value={form.contact.whatsappBusinessNumber} onChange={(e) => updateField('contact.whatsappBusinessNumber', e.target.value)} placeholder="+14155550198" />
                    </label>
                    <label>
                        Instagram
                        <input value={form.contact.socialLinks.instagram} onChange={(e) => updateField('contact.socialLinks.instagram', e.target.value)} placeholder="https://instagram.com/ecoglownaturals" />
                    </label>
                    <label>
                        YouTube
                        <input value={form.contact.socialLinks.youtube} onChange={(e) => updateField('contact.socialLinks.youtube', e.target.value)} placeholder="https://youtube.com/@ecoglownaturals" />
                    </label>
                    <label>
                        LinkedIn
                        <input value={form.contact.socialLinks.linkedin} onChange={(e) => updateField('contact.socialLinks.linkedin', e.target.value)} placeholder="https://linkedin.com/company/ecoglownaturals" />
                    </label>
                </div>
            );
        }

        return (
            <div className="brand-collaboration-step">
                <label className="brand-toggle-row">
                    <span>Open to creator collaborations</span>
                    <input
                        type="checkbox"
                        checked={form.collaborationInfo.collaborationOpen}
                        onChange={(e) => updateField('collaborationInfo.collaborationOpen', e.target.checked)}
                    />
                </label>
                <div className="brand-chip-grid compact">
                    {COLLABORATION_TYPES.map((type) => (
                        <button
                            key={type}
                            type="button"
                            className={`brand-chip ${form.collaborationInfo.collaborationTypes.includes(type) ? 'selected' : ''}`}
                            onClick={() => toggleArrayValue('collaborationInfo.collaborationTypes', type)}
                        >
                            {type.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="brand-onboarding-page">
            <div className="brand-onboarding-progress">
                {steps.map((item, index) => (
                    <span key={item.title} className={index <= step ? 'active' : ''} />
                ))}
            </div>
            <section className="brand-onboarding-story">
                <div className="brand-onboarding-copy">
                    <p>{String(step + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}</p>
                    <h1>{steps[step].title}</h1>
                    <span>{steps[step].subtitle}</span>
                </div>
                <div className="brand-onboarding-panel">
                    {renderStep()}
                    {error && <div className="brand-form-error">{error}</div>}
                    <div className="brand-onboarding-actions">
                        <button type="button" className="brand-secondary-btn" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0 || submitting}>
                            <ArrowLeft size={18} /> Back
                        </button>
                        <button type="button" className="brand-primary-btn" onClick={handleNext} disabled={submitting}>
                            {submitting ? <Loader2 className="spin" size={18} /> : step === steps.length - 1 ? <Check size={18} /> : <ArrowRight size={18} />}
                            {step === steps.length - 1 ? 'Finish' : 'Continue'}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BrandOnboarding;
