# IoT Riego Frontend

Este proyecto es un panel de control para un sistema de riego IoT basado en Next.js, Tailwind CSS y shadcn/ui.

## Guía de Instalación Rápida

### 1. Requisitos Previos
Asegúrate de tener [Node.js](https://nodejs.org/) instalado (versión 18 o superior).

### 2. Instalación de Dependencias

Si descargaste este proyecto como un ZIP, simplemente ejecuta:

\`\`\`bash
npm install
\`\`\`

### 3. Ejecutar el Servidor de Desarrollo

\`\`\`bash
npm run dev
\`\`\`

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## Recrear desde cero (Manual)

Si quieres crear este proyecto manualmente paso a paso:

1.  **Crear proyecto Next.js:**
    \`\`\`bash
    npx create-next-app@latest mi-riego --typescript --tailwind --eslint
    cd mi-riego
    \`\`\`

2.  **Inicializar shadcn/ui:**
    \`\`\`bash
    npx shadcn@latest init
    # Selecciona las opciones por defecto
    \`\`\`

3.  **Instalar componentes UI necesarios:**
    \`\`\`bash
    npx shadcn@latest add card button badge switch tabs scroll-area separator
    \`\`\`

4.  **Instalar librerías adicionales:**
    \`\`\`bash
    npm install lucide-react recharts date-fns
    \`\`\`

5.  **Copiar el código:**
    Copia los archivos de la carpeta `components`, `lib` y `app` a tu nuevo proyecto manteniendo la estructura.
