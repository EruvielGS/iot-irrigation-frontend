# 📋 Documentación del Sistema: Sistema de Riego Inteligente IoT

## 🏗️ Arquitectura del Sistema

### Diagrama de Flujo Completo
```
[Dispositivos ESP32] → [MQTT Broker] → [Backend Node.js] → [Frontend Next.js]
       ↓                    ↓               ↓                   ↓
[Sensores Humedad]  ← [Control Riego] ← [Base de Datos] ← [Dashboard Web]
```

### Componentes Principales

#### 1. **Capa de Dispositivos (Edge Computing)**
- **ESP32**: Microcontrolador principal
- **Sensores de humedad**: Medición en tiempo real
- **Actuadores**: Bomba de agua controlada por relé
- **Comunicación**: WiFi integrado

#### 2. **Capa de Backend (Fog Computing)**
- **Node.js + TypeScript**: Servidor API REST
- **MQTT Broker**: Comunicación bidireccional con dispositivos
- **InfluxDB**: Base de datos de series temporales
- **WebSocket**: Comunicación en tiempo real con frontend

#### 3. **Capa de Frontend (Application)**
- **Next.js 14**: Framework React con App Router
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilización
- **Recharts**: Visualización de datos
- **Componentes UI**: Shadcn/ui

## 🔧 Especificación de Técnicas de Calidad de Datos

### 1. **Validación de Rangos**
```typescript
// Rangos aceptables definidos
VALID_HUMIDITY_RANGE = { min: 0, max: 100 }
VALID_TEMPERATURE_RANGE = { min: -10, max: 60 }
VALID_BATTERY_RANGE = { min: 0, max: 100 }
```

### 2. **Puntaje de Calidad (0-100 puntos)**
- **40 puntos**: Humedad dentro de rango
- **20 puntos**: Temperatura válida (si existe)
- **20 puntos**: Batería válida (si existe)
- **20 puntos**: Timestamp coherente

### 3. **Detección de Anomalías**
- **Cambios bruscos**: Variación >30% en humedad entre lecturas consecutivas
- **Timestamp inválido**: Datos futuros o muy antiguos (>24 horas)
- **Patrones imposibles**: Valores constantes por periodos prolongados

### 4. **Clasificación de Calidad**
- **✅ Excelente (80-100 puntos)**: Datos completamente válidos
- **⚠️ Aceptable (60-79 puntos)**: Datos con pequeñas irregularidades
- **❌ Pobre (0-59 puntos)**: Datos con problemas significativos

## 💾 Estructuras de Almacenamiento de Datos

### 1. **InfluxDB - Datos de Series Temporales**

#### Measurement: `sensor_data`
| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|----------|
| `_measurement` | string | `sensor_data` | `sensor_data` |
| `_field` | string | Tipo de dato | `humidity`, `temperature` |
| `_value` | float | Valor numérico | `45.5` |
| `deviceId` | tag | ID dispositivo | `esp32-001` |
| `isValid` | tag | Validez dato | `true` |
| `quality_score` | field | Puntaje calidad | `85` |
| `_time` | timestamp | Marca temporal | `2024-01-15T10:30:00Z` |

#### Ejemplo de Data Point:
```json
{
  "_measurement": "sensor_data",
  "_field": "humidity",
  "_value": 45.5,
  "deviceId": "esp32-001",
  "isValid": "true",
  "quality_score": 85,
  "_time": "2024-01-15T10:30:00Z"
}
```

### 2. **Estructuras en Frontend**

#### DeviceStatus (Estado de Dispositivo)
```typescript
interface DeviceStatus {
  id: string                    // "esp32-001"
  name: string                  // "Jardín Principal"
  isOnline: boolean            // Estado conexión
  pumpActive: boolean          // Bomba activa/inactiva
  mode: "auto" | "manual"      // Modo operación
  lastSeen: string             // ISO timestamp
  humidity: number             // 0-100%
  temperature: number          // °C
  battery: number              // 0-100%
  signalStrength: number       // 0-100%
}
```

#### SensorData (Datos de Sensor)
```typescript
interface SensorData {
  deviceId: string
  humidity: number
  temperature: number
  batteryLevel: number
  timestamp: string
}
```

## 🔔 Criterios para Emisión de Notificaciones

### 1. **Reglas de Notificación Configurables**

#### Humedad Baja
- **Condición**: `humidity_low`
- **Umbral por defecto**: `30%`
- **Mensaje**: "Humedad crítica detectada. Iniciando riego."
- **Acción**: Activar riego automático (modo auto)

#### Humedad Alta
- **Condición**: `humidity_high` 
- **Umbral por defecto**: `80%`
- **Mensaje**: "Humedad excesiva. Riego detenido."
- **Acción**: Desactivar riego automático

#### Batería Baja
- **Condición**: `battery_low`
- **Umbral por defecto**: `20%`
- **Mensaje**: "Batería del sensor baja."
- **Acción**: Notificación preventiva

#### Dispositivo Offline
- **Condición**: `device_offline`
- **Umbral**: >5 minutos sin comunicación
- **Mensaje**: "Dispositivo fuera de línea."
- **Acción**: Alertar sobre posible falla

### 2. **Sistema de Prioridades**

#### 🔴 Crítico (Requiere acción inmediata)
- Humedad < 20% por más de 10 minutos
- Dispositivo offline > 30 minutos
- Batería < 10%

#### 🟡 Advertencia (Atención requerida)
- Humedad < 30% 
- Batería < 20%
- Calidad de datos < 60%

#### 🔵 Informativo (Solo notificación)
- Riego activado/desactivado
- Cambio de modo automático/manual
- Dispositivo reconectado

### 3. **Mecanismos de Entrega**

#### WebSocket (Tiempo Real)
- Notificaciones push inmediatas
- Actualización automática del frontend
- Estados de dispositivos en vivo

#### API REST (Histórico)
- Consulta de notificaciones pasadas
- Filtrado por tipo y fecha
- Marcado como leído/no leído

## 🔄 Flujos de Operación del Sistema

### 1. **Flujo Normal de Datos**
```
ESP32 → Mide humedad → Publica MQTT → Backend procesa → Almacena en DB → Frontend muestra
```

### 2. **Flujo de Control de Riego**
```
Frontend → API REST → Backend → MQTT → ESP32 → Activa/Desactiva bomba
```

### 3. **Flujo de Notificaciones**
```
Backend detecta condición → Ejecuta reglas → WebSocket → Frontend muestra alerta
```

## 📊 Métricas del Sistema

### 1. **Métricas de Calidad de Datos**
- **Tasa de datos válidos**: % de lecturas que pasan validación
- **Score promedio de calidad**: Puntaje medio de todas las lecturas
- **Tiempo de actividad**: % de tiempo con dispositivos online

### 2. **Métricas de Rendimiento**
- **Latencia de datos**: Tiempo sensor → frontend
- **Tasa de entrega de notificaciones**: % de alertas entregadas
- **Uptime del sistema**: Disponibilidad general

### 3. **Métricas de Eficiencia**
- **Uso de agua**: Tiempo total de riego por período
- **Ahorro de agua**: Comparativa con riego manual
- **Duración de batería**: Tiempo entre cargas

---

