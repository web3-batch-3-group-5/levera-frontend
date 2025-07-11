import { ReactNode } from 'react';
import { Notification, Theme } from './common';

/**
 * UI Component related type definitions
 */

// Base component props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  testId?: string;
}

// Button component types
export interface ButtonProps extends BaseComponentProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  asChild?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// Input component types
export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'number' | 'email' | 'password' | 'search' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string;
  success?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

// Select component types
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
  description?: string;
}

export interface SelectProps extends BaseComponentProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  loading?: boolean;
  error?: string;
  success?: boolean;
  onChange?: (value: string | string[]) => void;
  onSearch?: (query: string) => void;
}

// Modal component types
export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  backdrop?: boolean;
  keyboard?: boolean;
  centered?: boolean;
  scrollable?: boolean;
  footer?: ReactNode;
  onOpenChange?: (open: boolean) => void;
}

// Card component types
export interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  clickable?: boolean;
  hover?: boolean;
  loading?: boolean;
  error?: boolean;
  success?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  actions?: ReactNode;
  onClick?: () => void;
}

// Table component types
export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
}

export interface TableProps<T = any> extends BaseComponentProps {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  error?: string;
  empty?: ReactNode;
  rowKey?: string | ((record: T) => string);
  selectable?: boolean;
  selectedRows?: string[];
  onRowSelect?: (selectedRows: string[]) => void;
  onRowClick?: (record: T, index: number) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  sorting?: {
    field: string;
    direction: 'asc' | 'desc';
    onChange: (field: string, direction: 'asc' | 'desc') => void;
  };
  filtering?: {
    filters: Record<string, any>;
    onChange: (filters: Record<string, any>) => void;
  };
}

// Form component types
export interface FormFieldProps extends BaseComponentProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  error?: string;
  success?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  tooltip?: string;
  helperText?: string;
}

export interface FormProps extends BaseComponentProps {
  onSubmit: (data: Record<string, any>) => void;
  onReset?: () => void;
  initialValues?: Record<string, any>;
  validationSchema?: any;
  disabled?: boolean;
  loading?: boolean;
  autoComplete?: string;
  layout?: 'vertical' | 'horizontal' | 'inline';
  labelAlign?: 'left' | 'right' | 'top';
  labelWidth?: number | string;
  size?: 'sm' | 'md' | 'lg';
}

// Toast/Notification component types
export interface ToastProps {
  notification: Notification;
  onClose: () => void;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
}

// Loading component types
export interface LoadingProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'bars' | 'pulse';
  text?: string;
  overlay?: boolean;
  color?: string;
}

// Skeleton component types
export interface SkeletonProps extends BaseComponentProps {
  variant?: 'card' | 'list' | 'table' | 'text' | 'circle' | 'rectangle';
  count?: number;
  height?: number | string;
  width?: number | string;
  animate?: boolean;
  lines?: number;
}

// Layout component types
export interface LayoutProps extends BaseComponentProps {
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
  breadcrumbs?: BreadcrumbItem[];
  maxWidth?: number | string;
  centered?: boolean;
  fluid?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
  active?: boolean;
}

// Navigation component types
export interface NavigationItem {
  key: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  children?: NavigationItem[];
  disabled?: boolean;
  hidden?: boolean;
  badge?: string | number;
  external?: boolean;
  onClick?: () => void;
}

export interface NavigationProps extends BaseComponentProps {
  items: NavigationItem[];
  activeKey?: string;
  collapsed?: boolean;
  mode?: 'horizontal' | 'vertical' | 'inline';
  theme?: 'light' | 'dark';
  onItemClick?: (item: NavigationItem) => void;
  onCollapse?: (collapsed: boolean) => void;
}

// Theme provider types
export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  systemTheme: 'light' | 'dark';
  resolvedTheme: 'light' | 'dark';
}

// Responsive breakpoints
export interface Breakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

// Color palette
export interface ColorPalette {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  foreground: string;
  muted: string;
  accent: string;
  destructive: string;
  border: string;
  input: string;
  ring: string;
}

// Component state types
export interface ComponentState {
  loading: boolean;
  error: string | null;
  success: boolean;
  disabled: boolean;
  visible: boolean;
  active: boolean;
  selected: boolean;
  expanded: boolean;
  focused: boolean;
  hovered: boolean;
}

// Animation types
export interface AnimationProps {
  duration?: number;
  delay?: number;
  easing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  iterationCount?: number | 'infinite';
  playState?: 'running' | 'paused';
}

// Accessibility types
export interface AccessibilityProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean;
  'aria-disabled'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'off' | 'polite' | 'assertive';
  'aria-atomic'?: boolean;
  'aria-relevant'?: 'additions' | 'removals' | 'text' | 'all';
  role?: string;
  tabIndex?: number;
}
