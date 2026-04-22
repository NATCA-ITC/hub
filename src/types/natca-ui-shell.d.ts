declare module '@natca-itc/ui-shell' {
  import type { Component } from 'vue'

  // Theme
  export const natcaVuetifyTheme: Record<string, any>
  export const natcaDefaults: Record<string, any>
  export const natcaColors: Record<string, string>
  export function useNatcaTheme(): {
    setTheme: (theme: string) => void
    theme: import('vue').Ref<string>
    preference: import('vue').Ref<string>
  }

  // Shell
  export const NatcaShell: Component
  export const NatcaThemeToggle: Component

  // Page-level components
  export const NatcaPageHeader: Component
  export const NatcaHeaderCard: Component
  export const NatcaCard: Component
  export const NatcaStatGrid: Component
  export const NatcaStatCard: Component
  export const NatcaEmptyState: Component
  export const NatcaAlert: Component
  export const NatcaButton: Component
  export const NatcaPillNav: Component
  export const NatcaDialog: Component
  export const NatcaAnnotation: Component

  // Types
  export interface NatcaTab {
    id?: string
    label: string
    to: string
    icon?: string
    children?: NatcaTab[]
  }

  export interface NatcaNavSection {
    title?: string
    items: NatcaNavItem[]
  }

  export interface NatcaNavItem {
    id?: string
    label: string
    to: string
    icon?: string
  }

  export interface NatcaBreadcrumb {
    label: string
    to?: string
  }

  export interface NatcaUser {
    name: string
    email?: string
    avatar?: string
  }

  export interface NatcaApp {
    id: string
    name: string
    icon: string
    url: string
    description?: string
  }
}

declare module '@natca-itc/ui-shell/tokens'
declare module '@natca-itc/ui-shell/shell-styles'
