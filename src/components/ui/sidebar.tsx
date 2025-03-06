import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"

const sidebarVariants = cva(
  "flex flex-col space-y-2 p-4 rounded-md",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        outline: "border border-input bg-background",
      },
      size: {
        default: "w-64",
        sm: "w-48",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  asChild?: boolean
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? "div" : "aside"
    return (
      <Comp
        className={cn(sidebarVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Sidebar.displayName = "Sidebar"

interface SidebarItemProps extends React.HTMLAttributes<HTMLAnchorElement> {
  icon?: LucideIcon
  label: string
  href: string
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, href, className, ...props }) => {
  return (
    <a href={href} className={cn("flex items-center space-x-2 rounded-md p-2 hover:bg-accent hover:text-accent-foreground", className)} {...props}>
      {Icon && <Icon className="w-4 h-4" />}
      <span>{label}</span>
    </a>
  )
}

export { Sidebar, sidebarVariants, SidebarItem }
