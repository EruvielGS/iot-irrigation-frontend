export interface SensorData {
  deviceId: string
  humidity: number
  temperature: number
  batteryLevel: number
  timestamp: string
}

export interface DeviceStatus {
  id: string
  name: string
  isOnline: boolean
  pumpActive: boolean
  mode: "auto" | "manual"
  lastSeen: string
  humidity: number
  temperature: number
  battery: number
  signalStrength: number // 0-100
}

export interface NotificationRule {
  id: string
  condition: "humidity_low" | "humidity_high" | "device_offline" | "battery_low"
  threshold: number
  message: string
  enabled: boolean
}

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "error" | "success"
  timestamp: string
  read: boolean
}
