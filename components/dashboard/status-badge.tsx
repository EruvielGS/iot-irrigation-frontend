import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  humidity: number
}

export function HumidityBadge({ humidity }: StatusBadgeProps) {
  let colorClass = ""
  let label = ""
  const icon = null

  if (humidity <= 30) {
    colorClass = "bg-red-500 hover:bg-red-600 text-white"
    label = "Crítico"
  } else if (humidity < 80) {
    colorClass = "bg-green-500 hover:bg-green-600 text-white"
    label = "Normal"
  } else {
    colorClass = "bg-blue-500 hover:bg-blue-600 text-white"
    label = "Alto"
  }

  return (
    <Badge className={cn("gap-1", colorClass)}>
      {label} ({humidity}%)
    </Badge>
  )
}
