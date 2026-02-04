import * as React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Loader2 } from "lucide-react"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link"
export type ButtonSize = "sm" | "md" | "lg"

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: React.ReactNode
  isFullWidth?: boolean
  isFlex1?: boolean
  isShrink0?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = "primary",
    size = "md",
    loading = false,
    icon,
    isFullWidth = false,
    isFlex1 = false,
    isShrink0 = false,
    children,
    disabled,
    type = "button",
    ...props
  }, ref) => {

    // Mapping variants to Tailwind classes
    const variantClasses: Record<ButtonVariant, string> = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20 active:scale-[0.98]",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 active:scale-[0.98]",
      outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 active:scale-[0.98]",
      ghost: "bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 active:scale-[0.98]",
      destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-500/20 active:scale-[0.98]",
      link: "text-blue-600 underline-offset-4 hover:underline hover:bg-transparent h-auto p-0 dark:text-blue-400 font-normal shadow-none active:scale-100",
    }

    // Mapping sizes to Tailwind classes - more robust heights
    const sizeClasses: Record<ButtonSize, string> = {
      sm: "h-9 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
    }

    const isIconOnly = !children && !!icon
    const iconOnlySizes = {
      sm: "w-9 px-0",
      md: "w-10 px-0",
      lg: "w-12 px-0",
    }

    // Enforce icon sizing
    const iconSizeClass = size === "lg" ? "w-5 h-5" : "w-4 h-4"

    const renderedIcon = React.isValidElement(icon)
      ? React.cloneElement(icon as React.ReactElement<any>, {
        className: cn((icon as React.ReactElement<any>).props.className, iconSizeClass, "shrink-0")
      })
      : icon

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
          variantClasses[variant],
          sizeClasses[size],
          isIconOnly && iconOnlySizes[size],
          isFullWidth && "w-full",
          isFlex1 && "flex-1",
          isShrink0 && "shrink-0",
          loading && "opacity-80 cursor-wait"
        )}
        disabled={loading || disabled}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <Loader2 className={cn("animate-spin", iconSizeClass, children && (size === "sm" ? "mr-1.5" : "mr-2"))} />
        ) : (
          renderedIcon
        )}

        {!loading && children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
