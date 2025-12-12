import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Notification } from "@/lib/types"
import { Bell, AlertTriangle, CheckCircle, Info } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface NotificationsListProps {
  notifications: Notification[]
}

export function NotificationsList({ notifications }: NotificationsListProps) {
  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificaciones Recientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No hay notificaciones</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex gap-3 items-start p-3 rounded-lg border ${
                    !notif.read ? "bg-muted/50 border-primary/20" : "bg-card"
                  }`}
                >
                  <div className="mt-0.5">{getIcon(notif.type)}</div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{notif.title}</p>
                    <p className="text-xs text-muted-foreground">{notif.message}</p>
                    <p className="text-[10px] text-muted-foreground/70" suppressHydrationWarning>
                      {formatDistanceToNow(new Date(notif.timestamp), { locale: es, addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
