"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiService } from "@/lib/apiService";
import { CreateDeviceRequest } from "@/lib/types";
import { toast } from "sonner";

export function CreateDeviceForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateDeviceRequest>({
    plantId: "",
    name: "",
    userId: "default-user", // Por ahora hardcodeado, luego puedes usar auth
    ownerEmail: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.plantId || !formData.name) {
      toast.error("Por favor completa los campos requeridos");
      return;
    }

    setIsLoading(true);

    try {
      const device = await apiService.createDevice(formData);
      toast.success(`Dispositivo "${device.name}" creado exitosamente`);
      
      // Limpiar formulario
      setFormData({
        plantId: "",
        name: "",
        userId: "default-user",
        ownerEmail: "",
      });
      
      // Emitir evento para recargar dispositivos
      window.dispatchEvent(new CustomEvent('deviceCreated'));
      
    } catch (error: any) {
      toast.error(error.message || "Error al crear dispositivo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Registrar Dispositivo</CardTitle>
        <CardDescription>
          Conecta un nuevo ESP32 al sistema de monitoreo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plantId">
              ID de Planta <span className="text-red-500">*</span>
            </Label>
            <Input
              id="plantId"
              placeholder="Ej: PLANT001"
              value={formData.plantId}
              onChange={(e) => setFormData({ ...formData, plantId: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground">
              Identificador único del ESP32 (debe coincidir con el código)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre de la Planta <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ej: Tomate Cherry"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownerEmail">
              Email para Notificaciones <span className="text-blue-500">(Opcional)</span>
            </Label>
            <Input
              id="ownerEmail"
              type="email"
              placeholder="tu-email@gmail.com"
              value={formData.ownerEmail}
              onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              📧 Recibirás alertas críticas en este email. Si no lo especificas, se usará el email configurado en el backend.
            </p>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creando..." : "Crear Dispositivo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
