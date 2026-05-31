import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import '../styles/Snackbar.css';

const Snackbar = ({ message, type = 'success', isVisible, onClose, duration = 4000, action, position = 'bottom' }) => {
    useEffect(() => {
        // Don't auto-close if there's an action (user needs to confirm)
        if (isVisible && !action) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
        // If action is present, give more time
        if (isVisible && action) {
            const timer = setTimeout(() => {
                onClose();
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose, action]);

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle size={20} />;
            case 'error': return <XCircle size={20} />;
            case 'warning': return <AlertCircle size={20} />;
            default: return <Info size={20} />;
        }
    };

    const handleAction = () => {
        if (action?.onClick) {
            action.onClick();
        }
        onClose();
    };

    const initialY = position === 'top' ? -100 : 50;
    const animateY = position === 'top' ? 24 : 0;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className={`snackbar snackbar-${type} snackbar-${position} ${action?.onClick ? 'clickable' : ''}`}
                    initial={{ opacity: 0, y: initialY, x: '-50%' }}
                    animate={{ opacity: 1, y: animateY, x: '-50%' }}
                    exit={{ opacity: 0, y: initialY, x: '-50%' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    onClick={action?.onClick ? handleAction : undefined}
                >
                    <span className="snackbar-icon">{getIcon()}</span>
                    <span className="snackbar-message">{message}</span>
                    {action && (
                        <button
                            className="snackbar-action"
                            onClick={handleAction}
                        >
                            {action.label}
                        </button>
                    )}
                    <button 
                        className="snackbar-close" 
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                    >
                        &times;
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Snackbar;
