import React from 'react';
import { ShieldCheck, Crown, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const ProfileBadge = ({ plan, size = 16, showLabel = false }) => {
    if (!plan || plan === 'free') return null;

    const badgeConfig = {
        lite: {
            icon: Zap,
            color: '#F0057A',
            bgColor: 'rgba(240, 5, 122, 0.1)',
            label: 'Lite',
            className: 'badge--lite'
        },
        pro: {
            icon: Crown,
            color: '#FFD700',
            bgColor: 'rgba(255, 215, 0, 0.1)',
            label: 'Pro',
            className: 'badge--pro'
        }
    };

    const config = badgeConfig[plan.toLowerCase()];
    if (!config) return null;

    const Icon = config.icon;

    return (
        <motion.div 
            className={`profile-badge ${config.className}`}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: config.bgColor,
                color: config.color,
                padding: showLabel ? '2px 8px' : '2px',
                borderRadius: '50px',
                gap: '4px',
                border: `1px solid ${config.color}33`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            title={`${config.label} Member`}
        >
            <Icon size={size} strokeWidth={2.5} />
            {showLabel && (
                <span style={{ 
                    fontSize: '10px', 
                    fontWeight: 700, 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    {config.label}
                </span>
            )}
        </motion.div>
    );
};

export default ProfileBadge;
