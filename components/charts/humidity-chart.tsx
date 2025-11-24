"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ChartData {
  time: string
  humidity: number
}

interface HumidityChartProps {
  data: ChartData[]
  deviceName: string
}

export function HumidityChart({ data, deviceName }: HumidityChartProps) {
  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle>Humedad en Tiempo Real - {deviceName}</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12 }}
              tickFormatter={(val) => val.split(":").slice(0, 2).join(":")}
            />
            <YAxis domain={[0, 100]} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))" }} />

            {/* Umbrales Visuales */}
            <ReferenceLine
              y={80}
              stroke="blue"
              strokeDasharray="3 3"
              label={{ value: "Máx (80%)", fill: "blue", fontSize: 12 }}
            />
            <ReferenceLine
              y={30}
              stroke="red"
              strokeDasharray="3 3"
              label={{ value: "Mín (30%)", fill: "red", fontSize: 12 }}
            />

            <Line
              type="monotone"
              dataKey="humidity"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 8 }}
              isAnimationActive={false} // Better for realtime updates
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
