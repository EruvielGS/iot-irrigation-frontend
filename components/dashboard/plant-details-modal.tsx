"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlantDevice, KpiDto, CombinedHistoryData, WebSocketMessage, WebSocketMessageType, DeviceCommand } from "@/lib/types"
import { apiService } from "@/lib/apiService"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Droplets, Thermometer, Sun, Activity, Zap, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface PlantDetailsModalProps {
  device: PlantDevice | null
  isOpen: boolean
  onClose: () => void
}

export function PlantDetailsModal({ device, isOpen, onClose }: PlantDetailsModalProps) {
  const [kpis, setKpis] = useState<KpiDto | null>(null)
  const [historyData, setHistoryData] = useState<CombinedHistoryData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!device || !isOpen) return

    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [kpiData, history] = await Promise.all([
          apiService.getPlantKPIs(device.plantId),
          apiService.getHistoryCombined(device.plantId, "24h"),
        ])
        setKpis(kpiData)
        setHistoryData(history)
      } catch (error) {
        console.error("Error cargando datos:", error)
        toast.error("Error al cargar datos del dispositivo")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // WebSocket para actualizaciones en tiempo real
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000"
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log("🔌 WebSocket conectado para", device.plantId)
    }

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)
        
        if (message.plantId !== device.plantId) return

        if (message.type === WebSocketMessageType.TELEMETRY) {
          // Actualizar gráfica en tiempo real
          const newPoint: CombinedHistoryData = {
            time: new Date().toLocaleTimeString(),
            temp: message.data.temp,
            ambientHum: message.data.ambientHum,
            soilHum: message.data.soilHum,
            light: message.data.light,
          }
          
          setHistoryData((prev) => [...prev.slice(-49), newPoint])
          
          // Refrescar KPIs
          apiService.getPlantKPIs(device.plantId).then(setKpis)
        }

        if (message.type === WebSocketMessageType.ALERT) {
          toast.warning(`⚠️ ${message.data.message}`, {
            description: `Severidad: ${message.data.severity}`,
          })
        }
      } catch (error) {
        console.error("Error procesando WebSocket:", error)
      }
    }

    ws.onerror = (error) => {
      console.error("❌ WebSocket error:", error)
    }

    return () => {
      ws.close()
    }
  }, [device, isOpen])

  const handleCommand = async (command: DeviceCommand) => {
    if (!device) return
    
    try {
      await apiService.sendCommand(device.plantId, { command })
      toast.success(`Comando ${command} enviado exitosamente`)
    } catch (error) {
      toast.error("Error enviando comando")
    }
  }

  if (!device) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[98vw] max-w-[98vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {device.name} ({device.plantId})
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6 p-2">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    Temperatura
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpis?.currentTemp?.toFixed(1) ?? "--"}°C</div>
                  <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                    Actualizado: {kpis?.lastUpdate ? new Date(kpis.lastUpdate).toLocaleTimeString() : "--"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    Humedad Suelo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpis?.currentSoil ?? "--"}%</div>
                  <Badge variant={kpis && kpis.currentSoil < 35 ? "destructive" : "default"}>
                    {kpis && kpis.currentSoil < 35 ? "Crítico" : "Normal"}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Sun className="h-4 w-4 text-yellow-500" />
                    Luz
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpis?.currentLight ?? "--"} lux</div>
                  <p className="text-xs text-muted-foreground">Intensidad lumínica</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    Salud
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpis?.healthIndex ?? "--"}%</div>
                  <Badge variant={kpis && kpis.healthIndex > 80 ? "default" : "secondary"}>
                    {kpis && kpis.healthIndex > 80 ? "Excelente" : "Regular"}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Controles de Actuadores */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Controles Manuales</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button onClick={() => handleCommand(DeviceCommand.RIEGO)} className="flex-1">
                  <Droplets className="h-4 w-4 mr-2" />
                  Activar Riego
                </Button>
                <Button onClick={() => handleCommand(DeviceCommand.LUZ)} variant="secondary" className="flex-1">
                  <Sun className="h-4 w-4 mr-2" />
                  Activar Luz
                </Button>
                <Button onClick={() => handleCommand(DeviceCommand.STOP)} variant="destructive" className="flex-1">
                  <Zap className="h-4 w-4 mr-2" />
                  Detener Todo
                </Button>
              </CardContent>
            </Card>

            {/* Gráficas en Tiempo Real */}
            <Tabs defaultValue="combined" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="combined">Vista Combinada</TabsTrigger>
                <TabsTrigger value="individual">Métricas Individuales</TabsTrigger>
              </TabsList>
              
              <TabsContent value="combined" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Telemetría en Tiempo Real</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={500}>
                      <LineChart data={historyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="temp" stroke="#f97316" name="Temperatura (°C)" />
                        <Line type="monotone" dataKey="soilHum" stroke="#3b82f6" name="Humedad Suelo (%)" />
                        <Line type="monotone" dataKey="ambientHum" stroke="#10b981" name="Humedad Amb. (%)" />
                        <Line type="monotone" dataKey="light" stroke="#eab308" name="Luz (lux)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="individual" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Temperatura</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={historyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" hide />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Humedad de Suelo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={historyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" hide />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="soilHum" stroke="#3b82f6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
