"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlantDevice, KpiDto, CombinedHistoryData, WebSocketMessage, WebSocketMessageType, DeviceCommand } from "@/lib/types"
import { apiService } from "@/lib/apiService"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Droplets, Thermometer, Sun, Activity, TrendingUp } from "lucide-react"
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
  const [isSendingCommand, setIsSendingCommand] = useState(false)
  const [timeRange, setTimeRange] = useState<string>("72h")
  const [aggregationWindow, setAggregationWindow] = useState<string>("")

  useEffect(() => {
    if (!device || !isOpen) return

    const fetchData = async () => {
      try {
        setIsLoading(true)
        const windowParam = aggregationWindow === "" ? undefined : aggregationWindow;
        console.log(`🔧 Parámetros de consulta - Range: ${timeRange}, Window: ${windowParam || 'auto'}, AggregationWindow State: "${aggregationWindow}"`);
        const [realtimeData, history] = await Promise.all([
          apiService.getRealtimeData(device.plantId),
          apiService.getHistoryCombined(device.plantId, timeRange, windowParam),
        ])
        console.log("⚡ Datos en tiempo real obtenidos:", realtimeData)
        console.log(`📊 Historial obtenido (${timeRange}, window: ${windowParam || 'auto'}):`, history.length, "puntos")
        
        // Si hay muy pocos puntos (< 5), intentar obtener datos RAW
        if (history.length < 5) {
          console.log("⚠️  Pocos datos históricos, obteniendo datos RAW...")
          try {
            const rawData = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/analytics/${device.plantId}/history/raw?range=${timeRange}&limit=100`)
            if (rawData.ok) {
              const rawHistory = await rawData.json()
              console.log("📊 Datos RAW obtenidos:", rawHistory.length, "puntos")
              if (rawHistory.length > history.length) {
                setHistoryData(rawHistory)
                setKpis(realtimeData)
                setIsLoading(false)
                return
              }
            }
          } catch (err) {
            console.log("No se pudieron obtener datos RAW, usando datos con agregación")
          }
        }
        
        setKpis(realtimeData)
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
    console.log("🔌 Conectando WebSocket a:", wsUrl, "para dispositivo:", device.plantId)
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log("✅ WebSocket CONECTADO para", device.plantId)
    }

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)
        
        console.log("📩 WebSocket RAW mensaje:", event.data)
        console.log("📩 WebSocket mensaje parseado:", message)
        console.log("🔍 Comparando plantIds - Mensaje:", message.plantId, "Device:", device.plantId)
        
        if (message.plantId !== device.plantId) {
          console.log("⏭️  Mensaje ignorado - no es para este dispositivo")
          return
        }

        console.log("✅ Mensaje es para este dispositivo!")

        if (message.type === WebSocketMessageType.TELEMETRY) {
          console.log("📊 Procesando TELEMETRY, data:", message.data)
          
          // SOLO actualizar KPIs con datos en tiempo real (NO la gráfica)
          const realtimeKpis: KpiDto = {
            temp: message.data.temp ?? message.data.tempC ?? 0,
            soilHum: message.data.soilHum ?? message.data.soilHumidity ?? 0,
            ambientHum: message.data.ambientHum ?? message.data.ambientHumidity ?? 0,
            light: message.data.light ?? message.data.lightLux ?? 0,
            pumpOn: message.data.pumpOn ?? false,
            timestamp: new Date().toISOString(),
          }
          
          console.log("⚡ Actualizando SOLO KPIs con datos en vivo:", realtimeKpis)
          setKpis(realtimeKpis)
          // La gráfica NO se actualiza aquí - solo muestra datos históricos de InfluxDB
        }

        if (message.type === WebSocketMessageType.ALERT) {
          console.log("⚠️ Procesando ALERT:", message.data)
          toast.warning(`⚠️ ${message.data.message}`, {
            description: `Severidad: ${message.data.severity}`,
          })
        }
      } catch (error) {
        console.error("❌ Error procesando WebSocket:", error)
      }
    }

    ws.onerror = (error) => {
      console.error("❌ WebSocket ERROR:", error)
    }

    ws.onclose = () => {
      console.log("🔒 WebSocket CERRADO para", device.plantId)
    }

    return () => {
      console.log("🧹 Limpiando WebSocket...")
      ws.close()
    }
  }, [device, isOpen, timeRange, aggregationWindow])

  const handleCommand = async (command: DeviceCommand) => {
    if (!device) return
    
    try {
      setIsSendingCommand(true)
      await apiService.sendCommand(device.plantId, { command })
      toast.success(`✅ Comando ${command} enviado exitosamente`, {
        description: `El dispositivo ${device.name} recibirá la instrucción`
      })
    } catch (error: any) {
      toast.error(`❌ Error enviando comando ${command}`, {
        description: error.message || "No se pudo comunicar con el dispositivo"
      })
    } finally {
      setIsSendingCommand(false)
    }
  }

  if (!device) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] w-[98vw] h-[95vh] overflow-y-auto p-6">
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
          <div className="space-y-6 p-4">
            {/* KPIs - Datos en Tiempo Real */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                Lecturas en Tiempo Real
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-orange-500" />
                      Temperatura
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{kpis?.temp?.toFixed(1) ?? "--"}°C</div>
                    <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                      Actualizado: {kpis?.timestamp ? new Date(kpis.timestamp).toLocaleTimeString() : "--"}
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
                  <div className="text-2xl font-bold">{kpis?.soilHum ?? "--"}%</div>
                  <Badge variant={kpis && kpis.soilHum < 35 ? "destructive" : "default"}>
                    {kpis && kpis.soilHum < 35 ? "Crítico" : "Normal"}
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
                  <div className="text-2xl font-bold">{kpis?.light ?? "--"} lux</div>
                  <p className="text-xs text-muted-foreground">Intensidad lumínica</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-cyan-500" />
                    Humedad Ambiente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpis?.ambientHum ?? "--"}%</div>
                  <p className="text-xs text-muted-foreground">Humedad relativa</p>
                </CardContent>
              </Card>
              </div>
            </div>

            {/* Controles de Actuadores */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Control Manual de Riego</CardTitle>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full" disabled={isSendingCommand}>
                      <Droplets className="h-4 w-4 mr-2" />
                      Activar Riego
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Activar sistema de riego?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Se enviará el comando de riego al dispositivo{" "}
                        <span className="font-semibold">{device.name}</span>.
                        El agua comenzará a fluir según la configuración del sistema.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleCommand(DeviceCommand.RIEGO)}>
                        Activar Riego
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            {/* Gráficas Históricas */}
            <div className="space-y-4">
              {/* Filtro de Rango de Tiempo */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Configuración de Gráficas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Rango de Tiempo */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                      📅 Rango de Tiempo
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: "5m", label: "5 min" },
                        { value: "15m", label: "15 min" },
                        { value: "30m", label: "30 min" },
                        { value: "1h", label: "1 hora" },
                        { value: "3h", label: "3 horas" },
                        { value: "6h", label: "6 horas" },
                        { value: "12h", label: "12 horas" },
                        { value: "24h", label: "24 horas" },
                        { value: "72h", label: "3 días" },
                      ].map((option) => (
                        <Button
                          key={option.value}
                          variant={timeRange === option.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTimeRange(option.value)}
                          className="transition-all"
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Intervalo de Agregación */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                      ⏱️ Intervalo de Agregación (puntos cada...)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: "", label: "Auto" },
                        { value: "10s", label: "10 seg" },
                        { value: "30s", label: "30 seg" },
                        { value: "1m", label: "1 min" },
                        { value: "5m", label: "5 min" },
                        { value: "10m", label: "10 min" },
                        { value: "15m", label: "15 min" },
                        { value: "30m", label: "30 min" },
                        { value: "1h", label: "1 hora" },
                      ].map((option) => (
                        <Button
                          key={option.value}
                          variant={aggregationWindow === option.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setAggregationWindow(option.value)}
                          className="transition-all"
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {aggregationWindow 
                        ? `Mostrando promedio de datos cada ${aggregationWindow === "10s" ? "10 segundos" : aggregationWindow === "30s" ? "30 segundos" : aggregationWindow === "1m" ? "1 minuto" : aggregationWindow === "5m" ? "5 minutos" : aggregationWindow === "10m" ? "10 minutos" : aggregationWindow === "15m" ? "15 minutos" : aggregationWindow === "30m" ? "30 minutos" : "1 hora"}`
                        : "Intervalo automático según rango de tiempo"}
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground pt-2 border-t">
                    {historyData.length > 0 
                      ? `✅ ${historyData.length} puntos de datos cargados` 
                      : "⏳ Esperando datos..."}
                  </p>
                </CardContent>
              </Card>

              <Tabs defaultValue="combined" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="combined">Vista Combinada</TabsTrigger>
                <TabsTrigger value="individual">Métricas Individuales</TabsTrigger>
              </TabsList>
              
              <TabsContent value="combined" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Datos Históricos - {timeRange === "5m" ? "5 minutos" : timeRange === "15m" ? "15 minutos" : timeRange === "30m" ? "30 minutos" : timeRange === "1h" ? "1 hora" : timeRange === "3h" ? "3 horas" : timeRange === "6h" ? "6 horas" : timeRange === "12h" ? "12 horas" : timeRange === "24h" ? "24 horas" : "3 días"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {historyData.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[600px] text-muted-foreground">
                        <Activity className="h-16 w-16 mb-4 opacity-50" />
                        <p className="text-lg font-semibold">📊 No hay datos históricos disponibles</p>
                        <p className="text-sm mt-2">Los datos se están acumulando en InfluxDB.</p>
                        <p className="text-sm">Las lecturas en tiempo real se muestran en las tarjetas superiores.</p>
                        <p className="text-xs mt-4 text-muted-foreground/70">⏱️ Vuelve en 10-15 minutos para ver las gráficas históricas</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={600}>
                        <LineChart data={historyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="temp" stroke="#f97316" name="Temperatura (°C)" strokeWidth={2} />
                          <Line type="monotone" dataKey="soilHum" stroke="#3b82f6" name="Humedad Suelo (%)" strokeWidth={2} />
                          <Line type="monotone" dataKey="ambientHum" stroke="#10b981" name="Humedad Amb. (%)" strokeWidth={2} />
                          <Line type="monotone" dataKey="light" stroke="#eab308" name="Luz (lux)" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="individual" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Temperatura (Histórico)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
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
                      <CardTitle className="text-sm">Humedad de Suelo (Histórico)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
