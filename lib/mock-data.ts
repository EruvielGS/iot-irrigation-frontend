import type { DeviceStatus, Notification, NotificationRule } from "./types"

export const initialDevices: DeviceStatus[] = [
  {
    id: "esp32-001",
    name: "Jardín Principal",
    isOnline: true,
    pumpActive: false,
    mode: "auto",
    lastSeen: new Date().toISOString(),
    humidity: 45,
    temperature: 24.5,
    battery: 88,
    signalStrength: 92,
  },
  {
    id: "esp32-002",
    name: "Huerto Trasero",
    isOnline: true,
    pumpActive: true,
    mode: "auto",
    lastSeen: new Date().toISOString(),
    humidity: 28,
    temperature: 26.2,
    battery: 65,
    signalStrength: 78,
  },
  {
    id: "esp32-003",
    name: "Invernadero",
    isOnline: false,
    pumpActive: false,
    mode: "manual",
    lastSeen: new Date(Date.now() - 3600000).toISOString(),
    humidity: 60,
    temperature: 28.0,
    battery: 15,
    signalStrength: 0,
  },
]

export const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "Batería Baja",
    message: "El sensor 'Invernadero' tiene menos del 20% de batería.",
    type: "warning",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    read: false,
  },
  {
    id: "2",
    title: "Riego Activado",
    message: "Riego automático iniciado en 'Huerto Trasero' debido a baja humedad.",
    type: "info",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: true,
  },
]

export const initialRules: NotificationRule[] = [
  {
    id: "r1",
    condition: "humidity_low",
    threshold: 30,
    message: "Humedad crítica detectada. Iniciando riego.",
    enabled: true,
  },
  {
    id: "r2",
    condition: "humidity_high",
    threshold: 80,
    message: "Humedad excesiva. Riego detenido.",
    enabled: true,
  },
  {
    id: "r3",
    condition: "battery_low",
    threshold: 20,
    message: "Batería del sensor baja.",
    enabled: true,
  },
]
