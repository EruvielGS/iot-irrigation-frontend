import {
  PlantDevice,
  KpiDto,
  ChartPointDto,
  CombinedHistoryData,
  ClusterResultDto,
  GenericCommandPayload,
  PlantDeviceUpdateDto,
  PlantAlert,
  CreateDeviceRequest,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export const apiService = {
  // --- DISPOSITIVOS ---
  getDevices: async (): Promise<PlantDevice[]> => {
    const res = await fetch(`${API_URL}/devices`);
    if (!res.ok) throw new Error("Error fetching devices");
    return res.json();
  },

  createDevice: async (request: CreateDeviceRequest): Promise<PlantDevice> => {
    const res = await fetch(`${API_URL}/devices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const errorMsg = await res.text();
      throw new Error(errorMsg || "Error creando dispositivo");
    }
    return res.json();
  },

  deleteDevice: async (plantId: string): Promise<void> => {
    const res = await fetch(`${API_URL}/devices/${plantId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const errorMsg = await res.text();
      throw new Error(errorMsg || "Error eliminando dispositivo");
    }
  },

  getDeviceDetails: async (plantId: string): Promise<PlantDevice> => {
    const res = await fetch(`${API_URL}/devices/${plantId}`);
    if (!res.ok) throw new Error("Error fetching device details");
    return res.json();
  },

  updateDeviceThresholds: async (
    plantId: string,
    thresholds: PlantDeviceUpdateDto
  ): Promise<PlantDevice> => {
    const res = await fetch(`${API_URL}/devices/${plantId}/thresholds`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(thresholds),
    });

    if (!res.ok) throw new Error("Error updating thresholds");
    return res.json();
  },

  sendCommand: async (plantId: string, command: GenericCommandPayload): Promise<void> => {
    const res = await fetch(`${API_URL}/devices/${plantId}/command`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(command),
    });

    if (!res.ok) {
      const errorMsg = await res.text();
      throw new Error(errorMsg || "Error sending command");
    }
  },

  // --- ANALÍTICA ---
  getPlantKPIs: async (plantId: string): Promise<KpiDto> => {
    const res = await fetch(`${API_URL}/analytics/${plantId}/kpi`);
    if (!res.ok) throw new Error("Error fetching KPIs");
    return res.json();
  },

  // Obtener datos en tiempo real
  getRealtimeData: async (plantId: string): Promise<KpiDto> => {
    const res = await fetch(`${API_URL}/analytics/${plantId}/realtime`);
    if (!res.ok) throw new Error("Error fetching realtime data");
    return res.json();
  },

  getTemperatureHistory: async (
    plantId: string,
    range: string = "24h"
  ): Promise<ChartPointDto[]> => {
    const res = await fetch(`${API_URL}/analytics/${plantId}/history/temperature?range=${range}`);
    if (!res.ok) throw new Error("Error fetching temperature history");
    return res.json();
  },

  getSoilHumidityHistory: async (
    plantId: string,
    range: string = "24h"
  ): Promise<ChartPointDto[]> => {
    const res = await fetch(`${API_URL}/analytics/${plantId}/history/soil?range=${range}`);
    if (!res.ok) throw new Error("Error fetching soil humidity history");
    return res.json();
  },

  getLightHistory: async (plantId: string, range: string = "24h"): Promise<ChartPointDto[]> => {
    const res = await fetch(`${API_URL}/analytics/${plantId}/history/light?range=${range}`);
    if (!res.ok) throw new Error("Error fetching light history");
    return res.json();
  },

  getHumidityHistory: async (
    plantId: string,
    range: string = "24h"
  ): Promise<ChartPointDto[]> => {
    const res = await fetch(`${API_URL}/analytics/${plantId}/history/humidity?range=${range}`);
    if (!res.ok) throw new Error("Error fetching humidity history");
    return res.json();
  },

  getHistoryCombined: async (
    plantId: string,
    range: string = "72h",
    window?: string
  ): Promise<CombinedHistoryData[]> => {
    const params = new URLSearchParams({ range });
    if (window) params.append('window', window);
    const url = `${API_URL}/analytics/${plantId}/history/combined?${params.toString()}`;
    console.log(`📡 Llamando API con URL: ${url}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error fetching combined history");
    return res.json();
  },

  getClustering: async (plantId: string): Promise<ClusterResultDto> => {
    const res = await fetch(`${API_URL}/analytics/${plantId}/clustering`);
    if (!res.ok) throw new Error("Error fetching clustering data");
    return res.json();
  },

  // --- ALERTAS ---
  getAlertsByPlant: async (plantId: string, limit: number = 50): Promise<PlantAlert[]> => {
    const res = await fetch(`${API_URL}/alerts/${plantId}?limit=${limit}`);
    if (!res.ok) throw new Error("Error fetching alerts");
    return res.json();
  },

  getUnreadAlerts: async (plantId: string): Promise<PlantAlert[]> => {
    const res = await fetch(`${API_URL}/alerts/${plantId}/unread`);
    if (!res.ok) throw new Error("Error fetching unread alerts");
    return res.json();
  },

  markAlertAsRead: async (alertId: string): Promise<void> => {
    const res = await fetch(`${API_URL}/alerts/${alertId}/read`, {
      method: "PUT",
    });

    if (!res.ok) throw new Error("Error marking alert as read");
  },

  getAllAlerts: async (): Promise<PlantAlert[]> => {
    const devices = await apiService.getDevices();
    const alertsPromises = devices.map(device => 
      apiService.getAlertsByPlant(device.plantId, 20)
    );
    const alertsArrays = await Promise.all(alertsPromises);
    return alertsArrays.flat().sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },

  sendTestNotification: async (plantId: string): Promise<void> => {
    const res = await fetch(`${API_URL}/devices/${plantId}/test-notification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Error sending test notification");
  },
};
