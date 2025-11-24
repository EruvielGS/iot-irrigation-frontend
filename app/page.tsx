"use client"

import { useEffect, useState } from "react"
import { DeviceCard } from "@/components/dashboard/device-card"
import { HumidityChart } from "@/components/charts/humidity-chart"
import { NotificationsList } from "@/components/notifications/notifications-list"
import type { DeviceStatus, Notification } from "@/lib/types"
import { initialDevices, initialNotifications } from "@/lib/mock-data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, LayoutDashboard, History } from "lucide-react"

export default function Dashboard() {
  const [devices, setDevices] = useState<DeviceStatus[]>(initialDevices)
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(initialDevices[0].id)

  // Mock Real-time Data for Chart
  const [chartData, setChartData] = useState<{ time: string; humidity: number }[]>([])

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

          <TabsContent value="dashboard" className="space-y-6">
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

          <TabsContent value="history">
            <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/10 border-dashed">
              <p className="text-muted-foreground">Módulo de Histórico (En Desarrollo)</p>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/10 border-dashed">
              <p className="text-muted-foreground">Panel de Configuración Global (En Desarrollo)</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
