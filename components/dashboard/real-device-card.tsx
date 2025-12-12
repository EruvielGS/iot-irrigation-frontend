"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { PlantDevice } from "@/lib/types"
import { Droplets, Thermometer, Sun, Zap, Activity } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

interface RealDeviceCardProps {
  device: PlantDevice
  onClick?: () => void
}

export function RealDeviceCard({ device, onClick }: RealDeviceCardProps) {
  const isOnline = device.lastDataReceived 
    ? new Date().getTime() - new Date(device.lastDataReceived).getTime() < 5 * 60 * 1000 // 5 min
    : false;

  return (
    <Card 
      className="w-full cursor-pointer hover:shadow-lg transition-shadow" 
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className={`h-4 w-4 ${isOnline ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
          {device.name}
        </CardTitle>
        <Badge variant={isOnline ? "default" : "secondary"}>
          {isOnline ? "En línea" : "Inactivo"}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">ID Planta:</span>
            <span className="font-mono text-xs">{device.plantId}</span>
          </div>
          
          {device.description && (
            <p className="text-xs text-muted-foreground">{device.description}</p>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-xs">
              <Droplets className="h-3 w-3 text-blue-500" />
              <span>Suelo: {device.minSoilHumidity}%+</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Thermometer className="h-3 w-3 text-orange-500" />
              <span>Temp: {device.maxTempC}°C</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Sun className="h-3 w-3 text-yellow-500" />
              <span>Luz: {device.minLightLux} lux</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Zap className="h-3 w-3 text-purple-500" />
              <span className={device.isActive ? "text-green-600" : "text-gray-400"}>
                {device.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>

          {device.lastDataReceived && (
            <p className="text-[10px] text-muted-foreground pt-2" suppressHydrationWarning>
              Última lectura: {formatDistanceToNow(new Date(device.lastDataReceived), { locale: es, addSuffix: true })}
            </p>
          )}

          {device.ownerEmail && (
            <div className="pt-2 border-t">
              <p className="text-[10px] text-muted-foreground">
                📧 Alertas: {device.ownerEmail}
              </p>
            </div>
          )}
        </div>

        <Button 
          className="w-full mt-4" 
          variant="outline" 
          size="sm"
          onClick={onClick}
        >
          Ver Detalles
        </Button>
      </CardContent>
    </Card>
  )
}
