import {
  PlantDevice,
  KpiDto,
  ChartPointDto,
  CombinedHistoryData,
  ClusterResultDto,
  GenericCommandPayload,
  PlantDeviceUpdateDto,
  PlantAlert,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export const apiService = {
  // --- DISPOSITIVOS ---
  getDevices: async (): Promise<PlantDevice[]> => {
    const res = await fetch(`${API_URL}/devices`);
    if (!res.ok) throw new Error("Error fetching devices");
    return res.json();
  },

  createDevice: async (plantId: string, name: string, userId: string): Promise<PlantDevice> => {
    const res = await fetch(`${API_URL}/devices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plantId, name, userId }),
    });

    if (!res.ok) {
      const errorMsg = await res.text();
      throw new Error(errorMsg || "Error creando dispositivo");
    }
    return res.json();
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
    range: string = "24h"
  ): Promise<CombinedHistoryData[]> => {
    const res = await fetch(`${API_URL}/analytics/${plantId}/history/combined?range=${range}`);
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
};
