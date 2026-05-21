import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function StatCard({ title, value, icon: Icon, description, trend, trendValue, className }) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          {Icon && <Icon className="h-4 w-4 text-slate-400" />}
        </div>
        <div className="flex items-baseline space-x-2">
          <h2 className="text-2xl font-bold text-slate-900">{value}</h2>
          {trendValue && (
            <span className={cn(
              "text-xs font-medium",
              trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-600" : "text-slate-600"
            )}>
              {trend === "up" ? "↑" : trend === "down" ? "↓" : ""}{trendValue}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
