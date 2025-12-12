// Entidades
export interface PlantDevice {
  id?: string;
  ownerId: string;
  plantId: string;
  name: string;
  description?: string;
  macAddress?: string;
  ownerEmail?: string;  // Email para notificaciones

  // Umbrales
  minHumidity?: number;
  maxHumidity?: number;
  minSoilHumidity?: number;
  maxSoilHumidity?: number;
  minTempC?: number;
  maxTempC?: number;
  minLightLux?: number;
  maxLightLux?: number;

  // Estado
  topic?: string;
  isActive: boolean;
  lastDataReceived?: string;
  qosLevel?: number;
}

export interface Reading {
  id?: string;
  plantId: string;
  userId?: string;
  timestamp?: string;

  // Datos de sensores
  tempC?: number;
  ambientHumidity?: number;
  lightLux?: number;
  soilHumidity?: number;

  // Estado de bomba
  pumpOn?: boolean;

  // Enums
  msgType?: MessageType;
  qcStatus?: QcStatus;
  advisorResult?: AdvisorResult;
}

export interface PlantAlert {
  id?: string;
  plantId: string;
  severity: "CRITICA" | "ALERTA" | "RECOMENDACION" | "INFO";
  message: string;
  metric: string;
  value: number;
  timestamp: string;
  isRead: boolean;
}

// Enums
export enum QcStatus {
  VALID = "VALID",
  OUT_OF_RANGE = "OUT_OF_RANGE",
  RATE_ERROR = "RATE_ERROR",
  QC_ERROR = "QC_ERROR",
  EVENT = "EVENT",
}

export enum AdvisorResult {
  CRITICA = "CRITICA",
  ALERTA = "ALERTA",
  RECOMENDACION = "RECOMENDACION",
  INFO = "INFO",
}

export enum MessageType {
  READING = "READING",
  EVENT = "EVENT",
}

export enum DeviceCommand {
  RIEGO = "RIEGO",
  LUZ = "LUZ",
  STOP = "STOP",
}

// DTOs
export interface KpiDto {
  currentTemp: number;
  currentSoil: number;
  currentLight: number;
  currentHumidity: number;
  healthIndex: number;
  dataQuality: number;
  lastUpdate: string;
  pumpOn: boolean;
}

export interface ChartPointDto {
  time: string;
  value: number;
}

export interface CombinedHistoryData {
  time: string;
  temp?: number;
  ambientHum?: number;
  soilHum?: number;
  light?: number;
}

export interface ClusteringPiePoint {
  name: string;
  value: number;
  fill: string;
}

export interface ClusterResultDto {
  period: string;
  clusters: Record<string, number>;
}

// WebSocket
export enum WebSocketMessageType {
  TELEMETRY = "TELEMETRY",
  PUMP_EVENT = "PUMP_EVENT",
  ALERT = "ALERT",
}

export interface WebSocketMessage<T = any> {
  type: WebSocketMessageType;
  plantId: string;
  data: T;
  timestamp: string;
}

export interface TelemetryData {
  temp?: number;
  ambientHum?: number;
  soilHum?: number;
  light?: number;
  pumpOn?: boolean;
}

export interface PumpEventData {
  pumpOn: boolean;
}

export interface AlertData {
  severity: string;
  message: string;
  metric: string;
  value: number;
}

// Requests
export interface CreateDeviceRequest {
  plantId: string;
  name: string;
  userId: string;
  ownerEmail?: string;  // Email para recibir notificaciones
}

export interface GenericCommandPayload {
  command: DeviceCommand;
}

export interface PlantDeviceUpdateDto {
  minHumidity?: number;
  maxHumidity?: number;
  minSoilHumidity?: number;
  maxSoilHumidity?: number;
  minTempC?: number;
  maxTempC?: number;
  minLightLux?: number;
  maxLightLux?: number;
}

export interface DeviceConfig {
  minSoilHumidity: number;
  maxSoilHumidity: number;
  minTempC: number;
  maxTempC: number;
  minHumidity: number;
  maxHumidity: number;
  minLightLux: number;
  maxLightLux: number;
}

export const DEFAULT_CONFIG: DeviceConfig = {
  minSoilHumidity: 35,
  maxSoilHumidity: 100,
  minTempC: -10,
  maxTempC: 38,
  minHumidity: 30,
  maxHumidity: 100,
  minLightLux: 200,
  maxLightLux: 50000,
};

// Legacy types (mantenidos para compatibilidad)
export interface SensorData {
  deviceId: string;
  humidity: number;
  temperature: number;
  batteryLevel: number;
  timestamp: string;
}

export interface DeviceStatus {
  id: string;
  name: string;
  isOnline: boolean;
  pumpActive: boolean;
  mode: "auto" | "manual";
  lastSeen: string;
  humidity: number;
  temperature: number;
  battery: number;
  signalStrength: number;
}

export interface NotificationRule {
  id: string;
  condition: "humidity_low" | "humidity_high" | "device_offline" | "battery_low";
  threshold: number;
  message: string;
  enabled: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  timestamp: string;
  read: boolean;
}
