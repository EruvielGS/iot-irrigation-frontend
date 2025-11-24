"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import type { DeviceStatus } from "@/lib/types"
import { HumidityBadge } from "./status-badge"
import { Battery, Droplets, Signal, Thermometer, Wifi, WifiOff, Zap } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface DeviceCardProps {
  device: DeviceStatus
  onTogglePump: (id: string, state: boolean) => void
  onToggleMode: (id: string, mode: "auto" | "manual") => void
}

export function DeviceCard({ device, onTogglePump, onToggleMode }: DeviceCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {device.isOnline ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-gray-400" />
          )}
          {device.name}
        </CardTitle>
        <span className="text-xs text-muted-foreground">
          {device.isOnline
            ? "En línea"
            : `Visto hace ${formatDistanceToNow(new Date(device.lastSeen), { locale: es })}`}
        </span>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Droplets className="h-4 w-4 text-blue-500" />
              Humedad
            </div>
            <HumidityBadge humidity={device.humidity} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Thermometer className="h-4 w-4 text-orange-500" />
              Temperatura
            </div>
            <span className="font-bold">{device.temperature}°C</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Battery className="h-4 w-4 text-green-600" />
              Batería
            </div>
            <span className={`font-bold ${device.battery < 20 ? "text-red-500" : ""}`}>{device.battery}%</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Signal className="h-4 w-4 text-gray-500" />
              Señal
            </div>
            <span className="font-bold">{device.signalStrength}%</span>
          </div>
        </div>

        <div className="border-t pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Modo Automático</label>
            <Switch
              checked={device.mode === "auto"}
              onCheckedChange={(checked) => onToggleMode(device.id, checked ? "auto" : "manual")}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Bomba de Agua</label>
            <Button
              variant={device.pumpActive ? "default" : "outline"}
              size="sm"
              onClick={() => onTogglePump(device.id, !device.pumpActive)}
              disabled={device.mode === "auto" || !device.isOnline}
              className={device.pumpActive ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              {device.pumpActive ? (
                <>
                  <Zap className="mr-2 h-4 w-4 animate-pulse" /> Activa
                </>
              ) : (
                "Inactiva"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
