"use client";

import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import {
  Database,
  ThermometerSun,
  Waves,
  CloudRain,
  Sun,
  Droplets,
  Thermometer,
  Signal,
  SignalHigh,
  SignalLow,
  AlertOctagon,
  Heart,
} from "lucide-react";
import { KpiDto, PlantDevice } from "@/lib/types";
import { SmartGauge } from "./smart-gauge";

interface KpiGridProps {
  kpi: KpiDto;
  device: PlantDevice;
}

// --- SUB-COMPONENTE: GRÁFICO DE ANILLO PARA CALIDAD DE DATOS ---
const QualityRing = ({ value }: { value: number }) => {
  const roundedValue = Math.round(value);

  // Configuración del SVG
  const radius = 45;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (roundedValue / 100) * circumference;

  // Lógica de Estado
  let status = {
    color: "text-red-500",
    bgColor: "bg-red-50",
    ringColor: "text-red-500",
    text: "Crítica",
    icon: <AlertOctagon className="h-4 w-4 mb-1" />,
  };

  if (roundedValue >= 95) {
    status = {
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      ringColor: "text-emerald-500",
      text: "Excelente",
      icon: <SignalHigh className="h-4 w-4 mb-1" />,
    };
  } else if (roundedValue >= 80) {
    status = {
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      ringColor: "text-blue-500",
      text: "Buena",
      icon: <Signal className="h-4 w-4 mb-1" />,
    };
  } else if (roundedValue >= 50) {
    status = {
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      ringColor: "text-amber-500",
      text: "Inestable",
      icon: <SignalLow className="h-4 w-4 mb-1" />,
    };
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90 drop-shadow-sm">
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={strokeWidth}
            className="text-slate-100"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-out ${status.ringColor}`}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center inset-0">
          <span className={`text-3xl font-black tracking-tight ${status.color}`}>
            {roundedValue}%
          </span>
        </div>
      </div>

      <div
        className={`mt-3 flex flex-col items-center justify-center py-1.5 px-4 rounded-full ${status.bgColor} ${status.color}`}
      >
        {status.icon}
        <span className="text-xs font-bold uppercase tracking-widest leading-none">
          {status.text}
        </span>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTE: GRÁFICO DE ANILLO PARA SALUD DE PLANTA ---
const HealthRing = ({ value }: { value: number }) => {
  const roundedValue = Math.round(value);

  const radius = 45;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (roundedValue / 100) * circumference;

  // Lógica de Estado para Salud
  let status = {
    color: "text-red-500",
    bgColor: "bg-red-50",
    ringColor: "text-red-500",
    text: "Crítica",
    icon: <AlertOctagon className="h-4 w-4 mb-1" />,
  };

  if (roundedValue >= 80) {
    status = {
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      ringColor: "text-emerald-500",
      text: "Saludable",
      icon: <Heart className="h-4 w-4 mb-1" />,
    };
  } else if (roundedValue >= 60) {
    status = {
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      ringColor: "text-blue-500",
      text: "Buena",
      icon: <Heart className="h-4 w-4 mb-1" />,
    };
  } else if (roundedValue >= 40) {
    status = {
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      ringColor: "text-amber-500",
      text: "Regular",
      icon: <Heart className="h-4 w-4 mb-1" />,
    };
  } else if (roundedValue >= 20) {
    status = {
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      ringColor: "text-orange-500",
      text: "Débil",
      icon: <AlertOctagon className="h-4 w-4 mb-1" />,
    };
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90 drop-shadow-sm">
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={strokeWidth}
            className="text-slate-100"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-out ${status.ringColor}`}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center inset-0">
          <span className={`text-3xl font-black tracking-tight ${status.color}`}>
            {roundedValue}%
          </span>
        </div>
      </div>

      <div
        className={`mt-3 flex flex-col items-center justify-center py-1.5 px-4 rounded-full ${status.bgColor} ${status.color}`}
      >
        {status.icon}
        <span className="text-xs font-bold uppercase tracking-widest leading-none">
          {status.text}
        </span>
      </div>
    </div>
  );
};

export function KpiGrid({ kpi, device }: KpiGridProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. TEMPERATURA */}
        <Card>
          <CardHeader className="p-4 pb-0">
            <CardDescription className="font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
              <ThermometerSun className="h-3 w-3" /> Temperatura
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <SmartGauge
              value={kpi.temp}
              min={device.minTempC ?? 15}
              max={device.maxTempC ?? 30}
              limitMin={0}
              limitMax={50}
              units="°C"
              icon={<Thermometer />}
              colors={{ low: "#3B82F6", optimal: "#10B981", high: "#EF4444" }}
            />
            <div className="text-[10px] text-center text-muted-foreground mt-2">
              Ideal: {device.minTempC}° - {device.maxTempC}°
            </div>
          </CardContent>
        </Card>

        {/* 2. HUMEDAD SUELO */}
        <Card
          className={
            kpi.soilHum < (device.minSoilHumidity ?? 0)
              ? "border-red-400 bg-red-50/30"
              : ""
          }
        >
          <CardHeader className="p-4 pb-0">
            <CardDescription className="font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
              <Waves className="h-3 w-3" /> Humedad Suelo
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <SmartGauge
              value={kpi.soilHum}
              min={device.minSoilHumidity ?? 30}
              max={device.maxSoilHumidity ?? 70}
              limitMin={0}
              limitMax={100}
              units="%"
              icon={<Droplets />}
              colors={{ low: "#EF4444", optimal: "#10B981", high: "#3B82F6" }}
            />
            <div className="text-[10px] text-center text-muted-foreground mt-2">
              Riego crítico: {device.minSoilHumidity}%
            </div>
          </CardContent>
        </Card>

        {/* 3. HUMEDAD AMBIENTAL */}
        <Card>
          <CardHeader className="p-4 pb-0">
            <CardDescription className="font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
              <CloudRain className="h-3 w-3" /> Humedad Aire
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <SmartGauge
              value={kpi.ambientHum}
              min={device.minHumidity ?? 40}
              max={device.maxHumidity ?? 80}
              limitMin={0}
              limitMax={100}
              units="%"
              icon={<CloudRain />}
            />
            <div className="text-[10px] text-center text-muted-foreground mt-2">
              Entorno Ambiente
            </div>
          </CardContent>
        </Card>

        {/* 4. LUZ */}
        <Card>
          <CardHeader className="p-4 pb-0">
            <CardDescription className="font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
              <Sun className="h-3 w-3" /> Luz
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <SmartGauge
              value={kpi.light}
              min={device.minLightLux ?? 500}
              max={device.maxLightLux ?? 2000}
              limitMin={0}
              limitMax={5000}
              units=" lx"
              icon={<Sun />}
              colors={{ low: "#94A3B8", optimal: "#FBBF24", high: "#F97316" }}
            />
            <div className="text-[10px] text-center text-muted-foreground mt-2">
              Intensidad Lumínica
            </div>
          </CardContent>
        </Card>

        {/* 5. ÍNDICE DE SALUD */}
        {kpi.healthIndex !== undefined && (
          <Card>
            <CardHeader className="p-4 pb-0">
              <CardDescription className="font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                <Heart className="h-3 w-3 text-rose-500" /> Salud de Planta
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 flex flex-col items-center">
              <HealthRing value={kpi.healthIndex} />
              <div className="text-[10px] text-center text-muted-foreground mt-2">
                Índice de Salud ESI
              </div>
            </CardContent>
          </Card>
        )}

        {/* 6. CALIDAD DE DATOS */}
        {kpi.dataQuality !== undefined && (
          <Card>
            <CardHeader className="p-4 pb-0">
              <CardDescription className="font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                <Database className="h-3 w-3 text-slate-500" /> Calidad de Datos
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 flex flex-col items-center">
              <QualityRing value={kpi.dataQuality} />
              <div className="text-[10px] text-center text-muted-foreground mt-2">
                Tasa de recepción DQR
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
