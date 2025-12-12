"use client";

import React from "react";

interface SmartGaugeProps {
  value: number;
  min: number;
  max: number;
  limitMin: number;
  limitMax: number;
  units: string;
  icon: React.ReactNode;
  colors?: {
    low?: string;
    optimal?: string;
    high?: string;
  };
}

export function SmartGauge({
  value,
  min,
  max,
  limitMin,
  limitMax,
  units,
  icon,
  colors = { low: "#EF4444", optimal: "#10B981", high: "#EF4444" },
}: SmartGaugeProps) {
  // Calcular porcentaje basado en el rango completo
  const percentage = ((value - limitMin) / (limitMax - limitMin)) * 100;
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  // Determinar color basado en si está en rango óptimo
  let gaugeColor = colors.optimal;
  if (value < min) {
    gaugeColor = colors.low || "#EF4444";
  } else if (value > max) {
    gaugeColor = colors.high || "#EF4444";
  }

  // Estado del indicador
  let status = "Óptimo";
  let statusColor = "text-green-600";
  if (value < min) {
    status = "Bajo";
    statusColor = "text-red-600";
  } else if (value > max) {
    status = "Alto";
    statusColor = "text-orange-600";
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Icono */}
      <div className="text-muted-foreground opacity-70">{icon}</div>

      {/* Valor principal */}
      <div className="text-3xl font-black tracking-tight" style={{ color: gaugeColor }}>
        {value.toFixed(1)}
        <span className="text-sm font-normal ml-1">{units}</span>
      </div>

      {/* Barra de progreso */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${clampedPercentage}%`,
            backgroundColor: gaugeColor,
          }}
        />
      </div>

      {/* Estado */}
      <div className={`text-xs font-semibold ${statusColor}`}>{status}</div>
    </div>
  );
}
