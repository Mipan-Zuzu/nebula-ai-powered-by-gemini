import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-black placeholder:text-gray-500 focus:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-gray-300",
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
