import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Home,
    Compass,
    Crown,
    Users,
    User,
    LogOut,
    ChevronRight,
    Settings as SettingsIcon,
    Bell,
    Moon,
    Sun,
    BarChart3,
    BriefcaseBusiness,
    LayoutDashboard,
    MessageCircle,
    Store,
    FileText,
    Globe,
    Lock,
    Plus,
    Heart,
    Eye,
    Wallet,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import CreateCollectionModal from './CreateCollectionModal';
import ProfileBadge from './ProfileBadge';
import '../styles/Sidebar.css';

const Sidebar = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, logout, user, isBrand } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { unreadCount } = useNotifications();

    const creatorPlan = user?.subscription?.plan || user?.plan || 'free';
    const isCreatorPro = creatorPlan && creatorPlan !== 'free';
    const isPro = isBrand ? (user?.subscription?.plan !== 'free' && user?.subscription?.status === 'active') : isCreatorPro;

    const mainNavItems = isBrand ? [
        { path: '/brand/app', label: 'Home', icon: Home },
        { path: '/brand/explore', label: 'Explore', icon: Compass },
        { path: '/brand/creators', label: 'Creators', icon: Users },
        { path: '/brand/dashboard', label: 'Dashboard', icon: LayoutDashboard, locked: true },
        { path: '/brand/campaigns', label: 'Campaigns', icon: BriefcaseBusiness, locked: true },
        // { path: '/brand/messages', label: 'Messages', icon: MessageCircle, locked: true }, // coming soon
        { path: '/brand/brand-page', label: 'Brand Page', icon: Globe, locked: true },
        { path: '/brand/wallet', label: 'Wallet', icon: Wallet },
        { path: '/brand/notifications', label: 'Notification', icon: Bell },
        { path: '/brand/profile', label: 'Profile', icon: User },
        { path: '/brand/settings', label: 'Settings', icon: SettingsIcon },
    ] : [
        { path: '/', label: 'Home', icon: Home },
        { path: '/explore', label: 'Explore', icon: Compass },
        { path: '/campaigns', label: 'Campaigns', icon: BriefcaseBusiness },
        { path: '/my-campaigns', label: 'My Campaigns', icon: FileText },
    ];

    const userNavItems = isAuthenticated && !isBrand ? [
        { path: '/profile/me', label: 'Profile', icon: User, badge: true },
        { path: '/notifications', label: 'Notifications', icon: Bell },
        { path: '/analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/profile-views', label: 'Profile Views', icon: Eye },
        { path: '/liked-products', label: 'Liked', icon: Heart },
        { path: '/wallet', label: 'Wallet', icon: Wallet },
        { path: '/subscription', label: isCreatorPro ? 'Plan' : 'Upgrade', icon: Crown },
        { path: '/settings', label: 'Settings', icon: SettingsIcon },
    ] : [];

    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        if (path === '/brand/app') {
            return location.pathname === '/brand/app';
        }
        return location.pathname.startsWith(path);
    };

    const handleLogout = () => {
        logout();
        navigate('/landing');
    };

    const toggleSidebar = () => {
        setIsExpanded(!isExpanded);
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <>
            {/* Desktop/Tablet Sidebar */}
            <aside className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'} desktop-sidebar${isBrand ? ' brand-sidebar' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="logo-icon">d</div>
                        {isExpanded && <span className="logo-text">dropp.</span>}
                    </div>

                    <button
                        className="sidebar-toggle"
                        onClick={toggleSidebar}
                        aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                    >
                        <ChevronRight className={`toggle-icon ${isExpanded ? 'rotated' : ''}`} size={20} />
                    </button>
                </div>

                {isBrand && isExpanded && (
                    <div className="brand-sidebar-card">
                        <div className="brand-sidebar-logo">
                            {user?.logoUrl
                                ? <img src={user.logoUrl} alt={user?.brandName || 'Brand'} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                                : (user?.brandName || user?.email || 'B')[0]?.toUpperCase()}
                        </div>
                        <div className="brand-sidebar-card-info">
                            <strong>{user?.brandName || 'Brand Studio'}</strong>
                            <span>{user?.industry?.[0] || 'Brand Portal'}</span>
                        </div>
                        {isPro && (
                            <div className="brand-sidebar-pro-badge">
                                <Crown size={9} strokeWidth={2.5} />
                                Pro
                            </div>
                        )}
                    </div>
                )}


                <nav className="sidebar-nav">
                    {/* Main navigation items */}
                    <div className="sidebar-section">
                        {mainNavItems.map(({ path, label, icon: Icon, locked }) => {
                            const isLocked = locked && !isPro;
                            return (
                                <Link
                                    key={path}
                                    to={path}
                                    className={`sidebar-item ${isActive(path) ? 'active' : ''}${isLocked ? ' sidebar-item--locked' : ''}`}
                                    title={!isExpanded ? (isLocked ? `${label} (Pro)` : label) : ''}
                                >
                                    <div className="sidebar-item-icon">
                                        {React.createElement(Icon, { size: 20 })}
                                        {path === '/brand/notifications' && unreadCount > 0 && (
                                            <div className="sidebar-badge">{unreadCount}</div>
                                        )}
                                    </div>
                                    {isExpanded && (
                                        <span className="sidebar-item-label" style={{ flex: 1 }}>{label}</span>
                                    )}
                                    {isExpanded && isLocked && (
                                        <Crown size={12} style={{ color: '#F0057A', flexShrink: 0 }} />
                                    )}
                                    {isActive(path) && <div className="sidebar-item-indicator" />}
                                </Link>
                            );
                        })}
                    </div>

                    {isAuthenticated && userNavItems.length > 0 && (
                        <>
                            <div className="sidebar-divider" />
                            <div className="sidebar-section">
                                {userNavItems.map(({ path, label, icon: Icon, badge }) => (
                                    <Link
                                        key={path}
                                        to={path}
                                        className={`sidebar-item ${isActive(path) ? 'active' : ''}`}
                                        title={!isExpanded ? label : ''}
                                    >
                                        <div className="sidebar-item-icon">
                                            {React.createElement(Icon, { size: 20 })}
                                            {path === '/notifications' && unreadCount > 0 && (
                                                <div className="sidebar-badge">{unreadCount}</div>
                                            )}
                                        </div>
                                        {isExpanded && (
                                            <div className="sidebar-item-label-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                                <span className="sidebar-item-label">{label}</span>
                                                {badge && user?.plan && user.plan !== 'free' && (
                                                    <ProfileBadge plan={user.plan} size={14} />
                                                )}
                                            </div>
                                        )}
                                        {isActive(path) && <div className="sidebar-item-indicator" />}
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                </nav>

                <div className="sidebar-footer">
                    {/* Theme Toggle */}
                    <button
                        className="sidebar-item theme-toggle"
                        onClick={toggleTheme}
                        title={!isExpanded ? (theme === 'light' ? 'Dark mode' : 'Light mode') : ''}
                    >
                        <div className="sidebar-item-icon">
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </div>
                        {isExpanded && (
                            <span className="sidebar-item-label">
                                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                            </span>
                        )}
                    </button>

                    {/* Logout */}
                    {isAuthenticated && (
                        <button
                            className="sidebar-item logout-btn"
                            onClick={handleLogout}
                            title={!isExpanded ? 'Logout' : ''}
                        >
                            <div className="sidebar-item-icon">
                                <LogOut size={20} />
                            </div>
                            {isExpanded && <span className="sidebar-item-label">Logout</span>}
                        </button>
                    )}

                    {isBrand && isExpanded && isPro && (
                        <div className="brand-sidebar-tip">
                            <strong>Pro tip</strong>
                            <span>Boost a deal to increase applications in the first 24h.</span>
                        </div>
                    )}
                    {isBrand && isExpanded && !isPro && (
                        <div className="brand-sidebar-tip" style={{ cursor: 'pointer' }} onClick={() => navigate('/brand/subscription')}>
                            <strong style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Crown size={12} style={{ color: '#F0057A' }} /> Upgrade to Pro
                            </strong>
                            <span>Unlock campaigns, analytics &amp; more.</span>
                        </div>
                    )}
                    {!isBrand && isExpanded && !isCreatorPro && (
                        <div className="brand-sidebar-tip" style={{ cursor: 'pointer' }} onClick={() => navigate('/subscription')}>
                            <strong style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Crown size={12} style={{ color: '#F0057A' }} /> Upgrade creator plan
                            </strong>
                            <span>Verified badge, richer analytics, and priority brand deals.</span>
                        </div>
                    )}
                </div>
            </aside>

            {/* Mobile: Home · Explore · Create · Creators · Profile (notifications on Home header) */}
            <nav className="bottom-nav">
                <Link
                    to={isBrand ? '/brand/app' : '/'}
                    className={`bottom-nav-item ${isActive(isBrand ? '/brand/app' : '/') ? 'active' : ''}`}
                >
                    <div className="bottom-nav-icon-wrapper">
                        <Home size={22} />
                    </div>
                    <span className="bottom-nav-label">Home</span>
                </Link>
                <Link
                    to={isBrand ? '/brand/explore' : '/explore'}
                    className={`bottom-nav-item ${isActive(isBrand ? '/brand/explore' : '/explore') ? 'active' : ''}`}
                >
                    <div className="bottom-nav-icon-wrapper">
                        <Compass size={22} />
                    </div>
                    <span className="bottom-nav-label">Explore</span>
                </Link>
                {isBrand ? (
                    <Link
                        to={isPro ? '/brand/dashboard' : '/brand/subscription'}
                        className={`bottom-nav-item ${isActive('/brand/dashboard') ? 'active' : ''}`}
                    >
                        <div className="bottom-nav-icon-wrapper" style={{ position: 'relative' }}>
                            <LayoutDashboard size={22} />
                            {!isPro && (
                                <div style={{ position: 'absolute', top: -4, right: -4 }}>
                                    <Crown size={10} style={{ color: '#F0057A' }} />
                                </div>
                            )}
                        </div>
                        <span className="bottom-nav-label">Dashboard</span>
                    </Link>
                ) : (
                    <button
                        type="button"
                        className="bottom-nav-item bottom-nav-create"
                        onClick={() => setCreateModalOpen(true)}
                        aria-label="Create collection"
                    >
                        <div className="bottom-nav-icon-wrapper bottom-nav-create-icon-wrap">
                            <span className="bottom-nav-create-pill">
                                <Plus size={22} strokeWidth={2.5} />
                            </span>
                        </div>
                        <span className="bottom-nav-label">Create</span>
                    </button>
                )}
                <Link
                    to={isBrand ? '/brand/campaigns' : '/campaigns'}
                    className={`bottom-nav-item ${isActive(isBrand ? '/brand/campaigns' : '/campaigns') ? 'active' : ''}`}
                >
                    <div className="bottom-nav-icon-wrapper">
                        <BriefcaseBusiness size={22} />
                    </div>
                    <span className="bottom-nav-label">Campaigns</span>
                </Link>
                <Link
                    to={isBrand ? '/brand/profile' : '/profile/me'}
                    className={`bottom-nav-item ${location.pathname.startsWith(isBrand ? '/brand/profile' : '/profile') ? 'active' : ''}`}
                >
                    <div className="bottom-nav-icon-wrapper" style={{ position: 'relative' }}>
                        <User size={22} />
                        {!isBrand && user?.plan && user.plan !== 'free' && (
                            <div style={{ position: 'absolute', top: -4, right: -4 }}>
                                <ProfileBadge plan={user.plan} size={10} />
                            </div>
                        )}
                    </div>
                    <span className="bottom-nav-label">Profile</span>
                </Link>
            </nav>

            <CreateCollectionModal
                isOpen={!isBrand && createModalOpen}
                onClose={() => setCreateModalOpen(false)}
            />
        </>
    );
};

export default Sidebar;
