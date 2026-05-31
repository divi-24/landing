import { useTheme } from '../contexts/ThemeContext';

export const useLandingTheme = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return {
    isDark,
    bg: isDark ? '#0a0a0a' : '#ffffff',
    bgAlt: isDark ? '#141414' : '#f5f5f5',
    text: isDark ? '#ffffff' : '#0a0a0a',
    textSecondary: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.55)',
    textMuted: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)',
    textFaint: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
    textSubtle: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
    border: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    borderMedium: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    borderStrong: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
    btnPrimary: isDark ? '#ffffff' : '#0a0a0a',
    btnPrimaryText: isDark ? '#0a0a0a' : '#ffffff',
    btnSecondaryText: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
    glass: isDark ? 'rgba(10,10,10,0.92)' : 'rgba(255,255,255,0.92)',
    glassBorder: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    cardBg: isDark ? '#141414' : '#f5f5f5',
    imgOverlay: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
    heroBgOpacity: isDark ? 0.08 : 0.04,
    avatarBorder: isDark ? '#0a0a0a' : '#ffffff',
    accentGradient: 'linear-gradient(135deg, #0D36C7, #3887F8, #57A0FF)',
  };
};
