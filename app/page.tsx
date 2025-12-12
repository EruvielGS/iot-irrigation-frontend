"use client"

import { useEffect, useState } from "react"
import { DeviceCard } from "@/components/dashboard/device-card"
import { RealDeviceCard } from "@/components/dashboard/real-device-card"
import { PlantDetailsModal } from "@/components/dashboard/plant-details-modal"
import { CreateDeviceForm } from "@/components/dashboard/create-device-form"
import { HumidityChart } from "@/components/charts/humidity-chart"
import { NotificationsList } from "@/components/notifications/notifications-list"
import type { DeviceStatus, Notification, PlantDevice } from "@/lib/types"
import { initialDevices, initialNotifications } from "@/lib/mock-data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, LayoutDashboard, History, Plus, Database, Bell, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { Badge } from "@/components/ui/badge"
import { apiService } from "@/lib/apiService"
import { toast } from "sonner"

export default function Dashboard() {
  const [devices, setDevices] = useState<DeviceStatus[]>(initialDevices)
  const [realDevices, setRealDevices] = useState<PlantDevice[]>([])
  const [selectedRealDevice, setSelectedRealDevice] = useState<PlantDevice | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isLoadingRealDevices, setIsLoadingRealDevices] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(initialDevices[0].id)
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false)

  // Mock Real-time Data for Chart
  const [chartData, setChartData] = useState<{ time: string; humidity: number }[]>([])

  // Función para cargar notificaciones reales
  const fetchNotifications = async () => {
    try {
      setIsLoadingNotifications(true)
      const alerts = await apiService.getAllAlerts()
      // Convertir alertas a formato Notification
      const notifs: Notification[] = alerts.map(alert => ({
        id: alert.id || Math.random().toString(),
        deviceId: alert.plantId,
        title: alert.message,
        message: alert.message,
        type: alert.severity === "CRITICA" ? "error" : alert.severity === "ALERTA" ? "warning" : "info",
        timestamp: alert.timestamp,
        read: alert.isRead || false,
      }))
      setNotifications(notifs)
    } catch (error) {
      console.error("Error cargando notificaciones:", error)
    } finally {
      setIsLoadingNotifications(false)
    }
  }

  // Función para cargar dispositivos reales
  const fetchRealDevices = async () => {
    try {
      setIsLoadingRealDevices(true)
      const data = await apiService.getDevices()
      setRealDevices(data)
      console.log("📡 Dispositivos reales cargados:", data)
    } catch (error) {
      console.error("Error cargando dispositivos:", error)
      toast.error("Error al cargar dispositivos de la base de datos")
    } finally {
      setIsLoadingRealDevices(false)
    }
  }

  // Cargar dispositivos reales de la DB
  useEffect(() => {
    fetchRealDevices()
    fetchNotifications()

    // Escuchar evento de dispositivo creado
    const handleDeviceCreated = () => {
      fetchRealDevices()
    }
    window.addEventListener('deviceCreated', handleDeviceCreated)

    // Recargar cada 30 segundos
    const interval = setInterval(() => {
      fetchRealDevices()
      fetchNotifications()
    }, 30000)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('deviceCreated', handleDeviceCreated)
    }
  }, [])

  // Simulate real-time updates via WebSocket (Mocked)
  useEffect(() => {
    const interval = setInterval(() => {
      setDevices((prevDevices) =>
        prevDevices.map((device) => {
          // Simulate slight variations
          const change = (Math.random() - 0.5) * 2
          const newHumidity = Math.max(0, Math.min(100, device.humidity + change))

          // Auto-water logic simulation for demo
          if (device.mode === "auto" && device.isOnline) {
            if (newHumidity < 30 && !device.pumpActive) {
              // Trigger auto pump
              // In real app this comes from backend status
            }
          }

          return {
            ...device,
            humidity: Number(newHumidity.toFixed(1)),
            lastSeen: new Date().toISOString(),
          }
        }),
      )

      // Update Chart Data for selected device
      const currentDevice = devices.find((d) => d.id === selectedDeviceId)
      if (currentDevice) {
        setChartData((prev) => {
          const newData = [
            ...prev,
            {
              time: new Date().toLocaleTimeString(),
              humidity: currentDevice.humidity,
            },
          ]
          return newData.slice(-20) // Keep last 20 points
        })
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [selectedDeviceId, devices])

  const handleTogglePump = (id: string, active: boolean) => {
    setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, pumpActive: active } : d)))

    // Add notification simulation
    if (active) {
      const newNotif: Notification = {
        id: Date.now().toString(),
        title: "Riego Manual Activado",
        message: `Se ha activado el riego manual para el dispositivo ${id}`,
        type: "info",
        timestamp: new Date().toISOString(),
        read: false,
      }
      setNotifications((prev) => [newNotif, ...prev])
    }
  }

  const handleToggleMode = (id: string, mode: "auto" | "manual") => {
    setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, mode } : d)))
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sistema de Riego IoT</h1>
            <p className="text-muted-foreground">Panel de Control y Monitoreo</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Sistema en línea
          </div>
        </header>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" /> Histórico
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" /> Configuración
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            {/* SECCIÓN 1: Dispositivos Reales (MongoDB) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Mis Dispositivos IoT</h2>
                  <span className="text-xs text-muted-foreground">
                    ({realDevices.length} {realDevices.length === 1 ? 'dispositivo' : 'dispositivos'})
                  </span>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Nuevo Dispositivo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Crear Nuevo Dispositivo IoT</DialogTitle>
                    </DialogHeader>
                    <CreateDeviceForm />
                  </DialogContent>
                </Dialog>
              </div>

              {isLoadingRealDevices ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : realDevices.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg bg-muted/10">
                  <Database className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground text-center">
                    No tienes dispositivos registrados aún
                  </p>
                  <p className="text-sm text-muted-foreground/70 text-center mt-2">
                    Haz clic en "Nuevo Dispositivo" para comenzar
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {realDevices.map((device) => (
                    <RealDeviceCard
                      key={device.plantId}
                      device={device}
                      onClick={() => {
                        setSelectedRealDevice(device)
                        setIsDetailsModalOpen(true)
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* SECCIÓN 2: Dispositivos de Prueba (Mock) */}
            <div className="space-y-4 border-t pt-8">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-muted-foreground">
                  Dispositivos de Prueba (Demo)
                </h3>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  Simulación
                </span>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {devices.map((device) => (
                  <DeviceCard
                    key={device.id}
                    device={device}
                    onTogglePump={handleTogglePump}
                    onToggleMode={handleToggleMode}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                {/* Selector for chart */}
                <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
                  {devices.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => {
                        setSelectedDeviceId(d.id)
                        setChartData([]) // Reset chart on switch for demo
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedDeviceId === d.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
                <HumidityChart
                  data={chartData}
                  deviceName={devices.find((d) => d.id === selectedDeviceId)?.name || "Desconocido"}
                />
              </div>
              <div className="md:col-span-1">
                <NotificationsList notifications={notifications} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {realDevices.length === 0 ? (
              <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/10 border-dashed">
                <p className="text-muted-foreground">No hay dispositivos para mostrar histórico</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Histórico de Lecturas</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Selecciona un dispositivo para ver su historial completo
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {realDevices.map((device) => (
                    <Card 
                      key={device.plantId}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => {
                        setSelectedRealDevice(device)
                        setIsDetailsModalOpen(true)
                      }}
                    >
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center justify-between">
                          <span>{device.name}</span>
                          <Badge variant="outline">{device.plantId}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">
                          Ver Histórico Completo
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <CreateDeviceForm />
              
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Dispositivos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Lista de dispositivos registrados. Puedes eliminar dispositivos que ya no uses.
                  </p>
                  
                  {isLoadingRealDevices ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : realDevices.length === 0 ? (
                    <div className="text-center p-8 border-2 border-dashed rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        No hay dispositivos registrados
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {realDevices.map((device) => (
                        <div 
                          key={device.plantId}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">{device.name}</p>
                            <p className="text-xs text-muted-foreground">{device.plantId}</p>
                          </div>
                          <div className="flex gap-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                >
                                  <Bell className="h-3 w-3 mr-1" />
                                  Prueba
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Enviar notificación de prueba?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Se enviará un email de prueba a la dirección configurada para el dispositivo{" "}
                                    <span className="font-semibold">{device.name}</span> ({device.plantId}).
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={async () => {
                                      try {
                                        await apiService.sendTestNotification(device.plantId)
                                        toast.success("✅ Notificación de prueba enviada exitosamente", {
                                          description: `Email enviado a ${device.ownerEmail || 'dirección configurada'}`
                                        })
                                        fetchNotifications()
                                      } catch (error: any) {
                                        toast.error("❌ Error al enviar notificación", {
                                          description: error.message || "No se pudo enviar el email"
                                        })
                                      }
                                    }}
                                  >
                                    Enviar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Eliminar
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se eliminará permanentemente el dispositivo{" "}
                                    <span className="font-semibold">{device.name}</span> ({device.plantId}) de la base de datos.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={async () => {
                                      try {
                                        await apiService.deleteDevice(device.plantId)
                                        toast.success("Dispositivo eliminado exitosamente")
                                        fetchRealDevices()
                                      } catch (error) {
                                        toast.error("Error al eliminar dispositivo")
                                      }
                                    }}
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal de Detalles de Planta */}
        <PlantDetailsModal
          device={selectedRealDevice}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false)
            setSelectedRealDevice(null)
          }}
        />
      </div>
    </div>
  )
}
