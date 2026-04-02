'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import Link from 'next/link'
import { snappy } from '@/lib/animations'

// ─── Variant & Size types ────────────────────────────────────────────
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'pixel'
export type ButtonSize = 'sm' | 'md' | 'lg'

type BaseProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
  pill?: boolean
  href?: string
}

// When href is provided, it renders as a Link; otherwise as a button
type ButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
    children?: ReactNode
  }

// ─── Style maps ──────────────────────────────────────────────────────

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    'bg-accent text-white',
    'hover:bg-accent-hover',
    'btn-primary-glow',
  ].join(' '),

  secondary: [
    'bg-surface border border-b text-t-primary',
    'gradient-border-btn',
    'hover:bg-surface-hover',
  ].join(' '),

  ghost: [
    'bg-transparent text-t-muted',
    'hover:bg-surface-hover hover:text-t-primary',
  ].join(' '),

  outline: [
    'bg-transparent border border-accent/30 text-accent',
    'hover:bg-accent/10 hover:border-accent/60',
  ].join(' '),

  danger: [
    'bg-danger/15 text-danger border border-danger/20',
    'hover:bg-danger/25 hover:border-danger/40',
    'btn-danger-glow',
  ].join(' '),

  pixel: [
    'bg-accent-secondary text-[#0a0a14] font-bold',
    'border-2 border-accent-secondary/60',
    'hover:bg-accent-secondary-hover',
    'shadow-[0_4px_0_0_rgba(0,0,0,0.3)]',
    'active:shadow-[0_1px_0_0_rgba(0,0,0,0.3)] active:translate-y-[3px]',
  ].join(' '),
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-7 py-3.5 text-base gap-2.5',
}

const iconSizeClasses: Record<ButtonSize, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}

// ─── Motion configs per variant ──────────────────────────────────────

const tapScale = { scale: 0.96 }

const hoverVariants: Record<ButtonVariant, { scale?: number; y?: number }> = {
  primary: { scale: 1.03, y: -1 },
  secondary: { scale: 1.02, y: -1 },
  ghost: { scale: 1.02 },
  outline: { scale: 1.02, y: -1 },
  danger: { scale: 1.02, y: -1 },
  pixel: { scale: 1.05 },
}

const springTransition = snappy

// ─── Component ───────────────────────────────────────────────────────

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconRight,
      fullWidth = false,
      pill = false,
      href,
      disabled,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    const classes = [
      // Base
      'relative inline-flex items-center justify-center font-medium',
      'transition-colors duration-200',
      'select-none cursor-pointer',
      'overflow-hidden',
      // Shape
      pill ? 'rounded-full' : 'rounded-lg',
      // Size
      sizeClasses[size],
      // Variant
      variantClasses[variant],
      // Width
      fullWidth ? 'w-full' : '',
      // Disabled
      isDisabled ? 'opacity-50 cursor-not-allowed saturate-50' : '',
      // Loading shimmer
      loading ? 'btn-loading' : '',
      // User classes
      className,
    ]
      .filter(Boolean)
      .join(' ')

    const motionProps: HTMLMotionProps<'button'> = {
      whileHover: isDisabled ? undefined : hoverVariants[variant],
      whileTap: isDisabled ? undefined : tapScale,
      transition: springTransition,
    }

    const content = (
      <>
        {/* Grain texture overlay for primary buttons */}
        {variant === 'primary' && (
          <span className="btn-grain" aria-hidden />
        )}

        {/* Loading spinner */}
        {loading && (
          <span className={`btn-spinner ${iconSizeClasses[size]}`}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="animate-spin"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className="opacity-25"
              />
              <path
                d="M12 2a10 10 0 0 1 10 10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className="opacity-75"
              />
            </svg>
          </span>
        )}

        {/* Icon left */}
        {icon && !loading && (
          <span className={`flex-shrink-0 ${iconSizeClasses[size]}`}>
            {icon}
          </span>
        )}

        {/* Label */}
        {children && (
          <span className={`relative z-[1] ${loading ? 'opacity-0' : ''}`}>
            {children}
          </span>
        )}

        {/* Icon right */}
        {iconRight && (
          <span className={`flex-shrink-0 ${iconSizeClasses[size]} ${loading ? 'opacity-0' : ''}`}>
            {iconRight}
          </span>
        )}
      </>
    )

    // If href, render as a Link with motion wrapper
    if (href) {
      return (
        <motion.div
          whileHover={isDisabled ? undefined : hoverVariants[variant]}
          whileTap={isDisabled ? undefined : tapScale}
          transition={springTransition}
          className={fullWidth ? 'w-full' : 'inline-flex'}
        >
          <Link href={href} className={classes}>
            {content}
          </Link>
        </motion.div>
      )
    }

    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={classes}
        {...motionProps}
        {...(props as HTMLMotionProps<'button'>)}
      >
        {content}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

export default Button

// ─── Icon Button (circle) ────────────────────────────────────────────

type IconButtonProps = Omit<ButtonProps, 'children' | 'icon' | 'iconRight' | 'pill' | 'fullWidth'> & {
  children: ReactNode
  label: string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'ghost', size = 'md', label, children, className = '', ...props }, ref) => {
    const sizeMap: Record<ButtonSize, string> = {
      sm: 'w-7 h-7 text-xs',
      md: 'w-9 h-9 text-sm',
      lg: 'w-11 h-11 text-base',
    }

    const isDisabled = props.disabled || props.loading

    const classes = [
      'relative inline-flex items-center justify-center font-medium',
      'transition-colors duration-200',
      'select-none cursor-pointer rounded-lg overflow-hidden',
      sizeMap[size],
      variantClasses[variant],
      isDisabled ? 'opacity-50 cursor-not-allowed saturate-50' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        className={classes}
        whileHover={isDisabled ? undefined : { scale: 1.1 }}
        whileTap={isDisabled ? undefined : { scale: 0.85 }}
        transition={springTransition}
        title={label}
        aria-label={label}
        {...(props as HTMLMotionProps<'button'>)}
      >
        {children}
      </motion.button>
    )
  }
)

IconButton.displayName = 'IconButton'

// ─── Toggle Button (for tabs/filters) ────────────────────────────────

type ToggleButtonProps = Omit<ButtonProps, 'variant'> & {
  active?: boolean
}

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  ({ active = false, size = 'sm', pill = true, children, className = '', ...props }, ref) => {
    const isDisabled = props.disabled || props.loading

    const classes = [
      'relative inline-flex items-center justify-center font-medium',
      'transition-all duration-200',
      'select-none cursor-pointer overflow-hidden',
      pill ? 'rounded-full' : 'rounded-xl',
      sizeClasses[size],
      active
        ? 'bg-accent text-white shadow-[0_0_12px_var(--glow-accent)]'
        : 'bg-surface text-t-muted hover:bg-surface-hover hover:text-t-primary',
      isDisabled ? 'opacity-50 cursor-not-allowed' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        className={classes}
        whileHover={isDisabled ? undefined : { scale: 1.05 }}
        whileTap={isDisabled ? undefined : { scale: 0.95 }}
        transition={springTransition}
        {...(props as HTMLMotionProps<'button'>)}
      >
        {active && <span className="btn-grain" aria-hidden />}
        <span className="relative z-[1]">{children}</span>
      </motion.button>
    )
  }
)

ToggleButton.displayName = 'ToggleButton'
