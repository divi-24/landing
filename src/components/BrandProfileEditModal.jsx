import React, { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import BrandService from '../core/services/BrandService';
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

const emptyProfile = {
    brandName: '',
    legalName: '',
    description: '',
    industry: [],
    location: { state: '', city: '', pincode: '' },
    contact: {
        website: '',
        supportEmail: '',
        whatsappBusinessNumber: '',
        socialLinks: { instagram: '', youtube: '', linkedin: '' },
    },
    collaborationInfo: {
        collaborationOpen: true,
        collaborationTypes: [],
    },
};

const normalizeProfile = (profile = {}) => ({
    ...emptyProfile,
    ...profile,
    industry: profile.industry || [],
    location: { ...emptyProfile.location, ...(profile.location || {}) },
    contact: {
        ...emptyProfile.contact,
        ...(profile.contact || {}),
        socialLinks: {
            ...emptyProfile.contact.socialLinks,
            ...(profile.contact?.socialLinks || {}),
        },
    },
    collaborationInfo: {
        ...emptyProfile.collaborationInfo,
        ...(profile.collaborationInfo || {}),
        collaborationTypes: profile.collaborationInfo?.collaborationTypes || [],
    },
});

const BrandProfileEditModal = ({ profile, onClose, onUpdate }) => {
    const [form, setForm] = useState(() => normalizeProfile(profile));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setForm(normalizeProfile(profile));
    }, [profile]);

    const updateField = (path, value) => {
        setForm((prev) => {
            const next = JSON.parse(JSON.stringify(prev));
            const keys = path.split('.');
            const lastKey = keys.pop();
            const target = keys.reduce((acc, key) => acc[key], next);
            target[lastKey] = value;
            return next;
        });
        setError('');
    };

    const toggleValue = (path, value) => {
        const keys = path.split('.');
        const current = keys.reduce((acc, key) => acc[key], form);
        updateField(path, current.includes(value)
            ? current.filter((item) => item !== value)
            : [...current, value]);
    };

    const strip = (obj) => Object.fromEntries(
        Object.entries(obj).filter(([, v]) => typeof v !== 'string' || v.trim().length > 0)
    );

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!form.brandName.trim() || !form.legalName.trim()) {
            setError('Brand name and legal name are required');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                brandName: form.brandName.trim(),
                legalName: form.legalName.trim(),
                industry: form.industry,
                collaborationInfo: form.collaborationInfo,
            };
            if (form.description.trim()) payload.description = form.description.trim();
            const loc = strip(form.location);
            if (Object.keys(loc).length) payload.location = loc;
            const socialLinks = strip(form.contact.socialLinks || {});
            const contact = strip({ ...form.contact, socialLinks: undefined });
            if (Object.keys(socialLinks).length) contact.socialLinks = socialLinks;
            if (Object.keys(contact).length) payload.contact = contact;
            await BrandService.updateProfile(payload);
            const updatedProfile = await BrandService.getProfile();
            onUpdate(updatedProfile);
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to update brand profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="brand-modal-overlay">
            <form className="brand-edit-modal" onSubmit={handleSubmit}>
                <div className="brand-edit-modal-header">
                    <div>
                        <span>Brand Profile</span>
                        <h2>Edit profile details</h2>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                {error && <div className="brand-form-error">{error}</div>}

                <div className="brand-edit-grid">
                    <label>
                        Brand name
                        <input value={form.brandName} onChange={(e) => updateField('brandName', e.target.value)} />
                    </label>
                    <label>
                        Legal name
                        <input value={form.legalName} onChange={(e) => updateField('legalName', e.target.value)} />
                    </label>
                    <label className="wide">
                        Description
                        <textarea rows={4} value={form.description} onChange={(e) => updateField('description', e.target.value)} />
                    </label>
                    <label>
                        State
                        <input value={form.location.state} onChange={(e) => updateField('location.state', e.target.value)} />
                    </label>
                    <label>
                        City
                        <input value={form.location.city} onChange={(e) => updateField('location.city', e.target.value)} />
                    </label>
                    <label>
                        Pincode
                        <input value={form.location.pincode} onChange={(e) => updateField('location.pincode', e.target.value)} />
                    </label>
                    <label>
                        Website
                        <input value={form.contact.website} onChange={(e) => updateField('contact.website', e.target.value)} />
                    </label>
                    <label>
                        Support email
                        <input value={form.contact.supportEmail} onChange={(e) => updateField('contact.supportEmail', e.target.value)} />
                    </label>
                    <label>
                        WhatsApp Business
                        <input value={form.contact.whatsappBusinessNumber} onChange={(e) => updateField('contact.whatsappBusinessNumber', e.target.value)} />
                    </label>
                    <label>
                        Instagram
                        <input value={form.contact.socialLinks.instagram} onChange={(e) => updateField('contact.socialLinks.instagram', e.target.value)} />
                    </label>
                    <label>
                        YouTube
                        <input value={form.contact.socialLinks.youtube} onChange={(e) => updateField('contact.socialLinks.youtube', e.target.value)} />
                    </label>
                    <label>
                        LinkedIn
                        <input value={form.contact.socialLinks.linkedin} onChange={(e) => updateField('contact.socialLinks.linkedin', e.target.value)} />
                    </label>
                </div>

                <div className="brand-edit-section">
                    <h3>Industries</h3>
                    <div className="brand-chip-grid">
                        {INDUSTRIES.map((industry) => (
                            <button
                                key={industry}
                                type="button"
                                className={`brand-chip ${form.industry.includes(industry) ? 'selected' : ''}`}
                                onClick={() => toggleValue('industry', industry)}
                            >
                                {industry}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="brand-edit-section">
                    <h3>Collaboration</h3>
                    <label className="brand-toggle-row edit">
                        <span>Open to creator collaborations</span>
                        <input
                            type="checkbox"
                            checked={form.collaborationInfo.collaborationOpen}
                            onChange={(e) => updateField('collaborationInfo.collaborationOpen', e.target.checked)}
                        />
                    </label>
                    <div className="brand-chip-grid">
                        {COLLABORATION_TYPES.map((type) => (
                            <button
                                key={type}
                                type="button"
                                className={`brand-chip ${form.collaborationInfo.collaborationTypes.includes(type) ? 'selected' : ''}`}
                                onClick={() => toggleValue('collaborationInfo.collaborationTypes', type)}
                            >
                                {type.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="brand-edit-actions">
                    <button type="button" className="brand-secondary-btn" onClick={onClose}>Cancel</button>
                    <button type="submit" className="brand-primary-btn" disabled={saving}>
                        {saving && <Loader2 className="spin" size={18} />}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BrandProfileEditModal;
