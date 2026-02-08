/**
 * Общий стиль вылетающих окон приложения KindPlate:
 * тёмная карточка, акцент #001900, Montserrat Alternates.
 */

export const KP_MODAL = {
  backdrop: {
    backgroundColor: 'rgba(0, 25, 0, 0.88)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },
  card: {
    background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5)',
    fontFamily: "'Montserrat Alternates', sans-serif",
  },
  primary: '#001900',
  primaryRgba: 'rgba(0, 25, 0, 0.25)',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.7)',
  divider: 'rgba(255, 255, 255, 0.1)',
  btnSecondary: 'rgba(255, 255, 255, 0.08)',
  btnSecondaryBorder: 'rgba(255, 255, 255, 0.12)',
} as const;
