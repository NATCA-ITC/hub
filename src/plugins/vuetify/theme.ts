import type { ThemeDefinition } from 'vuetify'

// NATCA brand colors
export const staticPrimaryColor = '#003366'

export const themes: Record<string, ThemeDefinition> = {
  light: {
    dark: false,
    colors: {
      'primary': '#003366',
      'on-primary': '#fff',
      'primary-darken-1': '#002952',
      'secondary': '#6C757D',
      'on-secondary': '#fff',
      'success': '#2E7D32',
      'on-success': '#fff',
      'info': '#0277BD',
      'on-info': '#fff',
      'warning': '#A65D00',
      'on-warning': '#fff',
      'error': '#CE0E2D',
      'on-error': '#fff',
      'background': '#F5F5F5',
      'on-background': '#1A1A1A',
      'surface': '#FFFFFF',
      'on-surface': '#1A1A1A',
    },
  },
  dark: {
    dark: true,
    colors: {
      'primary': '#5BA3D9',
      'on-primary': '#fff',
      'primary-darken-1': '#003366',
      'secondary': '#AAB3DE',
      'on-secondary': '#fff',
      'success': '#4CAF50',
      'on-success': '#fff',
      'info': '#29B6F6',
      'on-info': '#fff',
      'warning': '#FFA726',
      'on-warning': '#fff',
      'error': '#EF5350',
      'on-error': '#fff',
      'background': '#1A1D2E',
      'on-background': '#E1E1E6',
      'surface': '#252836',
      'on-surface': '#E1E1E6',
    },
  },
}

export default themes
