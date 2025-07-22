# 🚀 Guía de Codespaces para Angular

Este repositorio está optimizado para trabajar con GitHub Codespaces. Todo está preconfigurado para que puedas empezar a desarrollar inmediatamente.

## Inicio Rápido

### Opción 1: Script Interactivo
```bash
./codespaces-setup.sh
```

### Opción 2: Comandos Directos
```bash
# Iniciar servidor de desarrollo (optimizado para Codespaces)
npm run start:codespaces

# Ver comandos disponibles
npm run codespaces:info
```

## 📋 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run start:codespaces` | Inicia el servidor de desarrollo optimizado para Codespaces |
| `npm run test:headless` | Ejecuta tests en modo headless (sin interfaz gráfica) |
| `npm run build` | Crea build de producción |
| `npm run codespaces:info` | Muestra información de comandos disponibles |
| `./codespaces-setup.sh` | Script interactivo de configuración |

## 🔧 Configuración Automática

Al crear el Codespace, automáticamente se:
- ✅ Instala Node.js 18
- ✅ Instala Angular CLI
- ✅ Instala todas las dependencias (`npm install`)
- ✅ Configura extensiones de VS Code para Angular
- ✅ Prepara el puerto 4200 para el servidor de desarrollo
- ✅ Instala GitHub CLI

## 🌐 Acceso a la Aplicación

Una vez que ejecutes `npm run start:codespaces`, la aplicación estará disponible en el puerto 4200. Codespaces automáticamente:
- Detectará que hay un servidor corriendo en el puerto 4200
- Te mostrará una notificación
- Te permitirá abrir la aplicación en una nueva pestaña

## 🛠️ Desarrollo

### Generar Componentes
```bash
ng generate component mi-componente
ng generate service mi-servicio
ng generate module mi-modulo
```

### Estructura del Proyecto
```
src/
├── app/
│   ├── app.component.ts    # Componente principal
│   ├── app.routes.ts       # Configuración de rutas
│   └── app.config.ts       # Configuración de la app
├── index.html              # Archivo HTML principal
├── main.ts                 # Punto de entrada
└── styles.css              # Estilos globales
```

## 🧪 Testing

```bash
# Tests en modo watch (desarrollo)
npm test

# Tests una sola vez (CI/CD)
npm run test:headless
```

## 🏗️ Build de Producción

```bash
npm run build
```

Los archivos se generarán en la carpeta `dist/`.

## 💡 Tips para Codespaces

1. **Puerto 4200**: Ya está configurado para auto-forward
2. **Extensiones**: Angular Language Service preinstalado
3. **Terminal**: Usa bash por defecto
4. **Sincronización**: Todos los cambios se sincronizan automáticamente con GitHub
5. **Performance**: El entorno tiene 2 cores y 4GB RAM por defecto

## 🐛 Troubleshooting

### Si el servidor no inicia
```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
npm run start:codespaces
```

### Si los tests fallan
```bash
# Ejecutar en modo headless
npm run test:headless
```

---

¡Feliz desarrollo! 🎉
