import { useEffect } from 'react';
import Lenis from 'lenis';

const SmoothScroll = ({ children }) => {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            prevent: (node) => Boolean(node.closest?.(
                '.modal-overlay, .brand-modal-overlay, .image-zoom-overlay, .modal-content, .brand-edit-modal, .sidebar-nav, .bottom-nav, .cdp-overlay, .cdp-scroll, .cdp-panel'
            )),
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        const modalSelector = '.modal-overlay, .brand-modal-overlay, .image-zoom-overlay, .cdp-overlay';
        const syncModalScrollLock = () => {
            const hasModal = Boolean(document.querySelector(modalSelector));
            document.documentElement.classList.toggle('modal-scroll-locked', hasModal);
            document.body.classList.toggle('modal-scroll-locked', hasModal);
            if (hasModal) {
                lenis.stop();
            } else {
                lenis.start();
            }
        };

        const observer = new MutationObserver(syncModalScrollLock);
        observer.observe(document.body, { childList: true, subtree: true });
        syncModalScrollLock();

        return () => {
            observer.disconnect();
            document.documentElement.classList.remove('modal-scroll-locked');
            document.body.classList.remove('modal-scroll-locked');
            lenis.destroy();
        };
    }, []);

    return children;
};

export default SmoothScroll;
