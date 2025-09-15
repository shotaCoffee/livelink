/**
 * UI Components Package for LiveLink Application
 *
 * This package provides a comprehensive set of reusable UI components
 * built with SolidJS and styled with TailwindCSS for the LiveLink application.
 *
 * @package @band-setlist/ui
 */

// Styles
import './styles.css'

// Basic UI Components
export { Button, type ButtonProps } from './components/ui/Button'
export { Input, type InputProps } from './components/ui/Input'
export { Textarea, type TextareaProps } from './components/ui/Textarea'
export {
  LoadingSpinner,
  type LoadingSpinnerProps,
} from './components/ui/LoadingSpinner'
export { ErrorBanner, type ErrorBannerProps } from './components/ui/ErrorBanner'
export { Badge, type BadgeProps } from './components/ui/Badge'
export {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  type CardProps,
  type CardHeaderProps,
  type CardContentProps,
  type CardFooterProps,
} from './components/ui/Card'
export {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
  type ModalProps,
  type ModalHeaderProps,
  type ModalContentProps,
  type ModalFooterProps,
} from './components/ui/Modal'

// Form Components
export { FormGroup, type FormGroupProps } from './components/forms/FormGroup'
export { SongForm, type SongFormProps } from './components/forms/SongForm'
export { LiveForm, type LiveFormProps } from './components/forms/LiveForm'

// Layout Components
export {
  Header,
  HeaderBrand,
  HeaderActions,
  type HeaderProps,
  type HeaderBrandProps,
  type HeaderActionsProps,
} from './components/layout/Header'
export {
  Sidebar,
  SidebarNavigation,
  SidebarSection,
  type SidebarProps,
  type NavigationItem,
  type SidebarNavigationProps,
  type SidebarSectionProps,
} from './components/layout/Sidebar'
export {
  Layout,
  AppLayout,
  PageHeader,
  Container,
  type LayoutProps,
  type AppLayoutProps,
  type PageHeaderProps,
  type ContainerProps,
} from './components/layout/Layout'

// Re-export shared types for convenience
export type {
  Song,
  Live,
  Band,
  SetlistItem,
  LiveWithSetlist,
  SongFormData,
  LiveFormData,
  ApiResponse,
  PaginatedResponse,
  LoadingState,
  PaginationState,
} from '@band-setlist/shared'
