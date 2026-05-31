import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Youtube, Unlink, Loader, CheckCircle } from 'lucide-react';
import YouTubeService from '../core/services/YouTubeService';
import { API_CONFIG, STORAGE_KEYS } from '../core/config/apiConfig';
import YouTubeOverview from './YouTubeOverview';
import '../styles/YouTube.css';

const YouTubeSection = () => {
    const [status, setStatus] = useState(null); // null = loading
    const [disconnecting, setDisconnecting] = useState(false);
    const [error, setError] = useState(null);
    const [justConnected, setJustConnected] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        let cancelled = false;

        // Backend redirects with ?youtube=connected. Keep ?yt=connected as a
        // legacy alias so older callback URLs still behave correctly.
        const params = new URLSearchParams(location.search);
        if (params.get('youtube') === 'connected' || params.get('yt') === 'connected') {
            setJustConnected(true);
            params.delete('youtube');
            params.delete('yt');
            const newSearch = params.toString();
            navigate(location.pathname + (newSearch ? `?${newSearch}` : ''), { replace: true });
        }

        YouTubeService.getStatus()
            .then((s) => { if (!cancelled) setStatus(s); })
            .catch(() => { if (!cancelled) setStatus({ connected: false }); });

        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // The backend responds to GET /youtube/connect with a 302 redirect
    // straight to Google OAuth — no JSON body is returned.
    // We must use window.location.href (a real browser navigation) so the
    // browser follows the redirect chain normally. XHR/fetch would hit CORS.
    // The JWT is passed as a query param because browser navigation cannot
    // carry custom headers like Authorization.
    const handleConnect = () => {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || '';
        const base = API_CONFIG.BASE_URL || '';
        window.location.href = `${base}/youtube/connect?token=${encodeURIComponent(token)}`;
    };

    const handleDisconnect = async () => {
        setDisconnecting(true);
        setError(null);
        try {
            await YouTubeService.disconnectYouTube();
            setStatus({ connected: false });
        } catch (err) {
            setError(err.message || 'Failed to disconnect YouTube');
        } finally {
            setDisconnecting(false);
        }
    };

    // Still fetching status
    if (status === null) {
        return (
            <div className="yt-section">
                <div className="yt-section-header">
                    <Youtube size={20} className="yt-section-icon" />
                    <span className="yt-section-title">YouTube</span>
                </div>
                <div className="yt-status-loading">
                    <Loader size={16} className="yt-spin" />
                    <span>Checking connection…</span>
                </div>
            </div>
        );
    }

    return (
        <div className="yt-section">
            <div className="yt-section-header">
                <Youtube size={20} className="yt-section-icon" />
                <span className="yt-section-title">YouTube</span>
            </div>

            {error && <p className="yt-section-error">{error}</p>}

            {justConnected && (
                <motion.div
                    className="yt-just-connected"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                >
                    <CheckCircle size={15} />
                    YouTube connected successfully!
                </motion.div>
            )}

            <AnimatePresence mode="wait">
                {!status.connected ? (
                    <motion.div
                        key="disconnected"
                        className="yt-connect-block"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <p className="yt-connect-hint">
                            Connect your YouTube channel to see analytics and insights directly on your profile.
                        </p>
                        <button
                            className="yt-connect-btn"
                            onClick={handleConnect}
                        >
                            <Youtube size={16} /> Connect YouTube
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="connected"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Connected badge */}
                        <div className="yt-connected-row">
                            {status.channelInfo?.channelThumbnail && (
                                <img
                                    src={status.channelInfo.channelThumbnail}
                                    alt={status.channelInfo?.channelTitle}
                                    className="yt-connected-avatar"
                                />
                            )}
                            <div className="yt-connected-info">
                                <span className="yt-connected-name">{status.channelInfo?.channelTitle || 'Connected Channel'}</span>
                                <span className="yt-connected-badge">Connected</span>
                            </div>
                            <button
                                className="yt-disconnect-btn"
                                onClick={handleDisconnect}
                                disabled={disconnecting}
                                title="Disconnect YouTube"
                            >
                                {disconnecting ? (
                                    <Loader size={15} className="yt-spin" />
                                ) : (
                                    <><Unlink size={15} /> Disconnect</>
                                )}
                            </button>
                        </div>

                        {/* Overview */}
                        <YouTubeOverview />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default YouTubeSection;
