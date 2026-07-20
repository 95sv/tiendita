import { type LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string; href: string }
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-16 w-16 rounded-full bg-charcoal/5 flex items-center justify-center mb-4">
        <Icon size={28} className="text-charcoal/20" />
      </div>
      <h3 className="font-[family-name:var(--font-oswald)] text-lg uppercase tracking-[0.05em] text-charcoal/70">
        {title}
      </h3>
      <p className="mt-2 font-[family-name:var(--font-oswald)] text-sm text-charcoal/40 max-w-sm">
        {description}
      </p>
    </div>
  )
}
