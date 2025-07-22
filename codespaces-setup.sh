#!/bin/bash

# 🚀 Codespaces Angular Setup Script
# Este script configura y inicia tu entorno de desarrollo Angular en Codespaces

echo "🎯 Configurando entorno Angular en Codespaces..."

# Función para mostrar información útil
show_info() {
    echo ""
    echo "📋 COMANDOS DISPONIBLES:"
    echo "  npm run start:codespaces    - Iniciar servidor de desarrollo (optimizado para Codespaces)"
    echo "  npm run test:headless       - Ejecutar tests en modo headless"
    echo "  npm run build              - Crear build de producción"
    echo "  ng generate component <name> - Generar nuevo componente"
    echo "  ng --help                  - Ver ayuda de Angular CLI"
    echo ""
    echo "🌐 PUERTOS:"
    echo "  Puerto 4200 - Servidor de desarrollo Angular"
    echo ""
    echo "📁 ESTRUCTURA DEL PROYECTO:"
    echo "  src/app/ - Componentes de la aplicación"
    echo "  src/assets/ - Recursos estáticos"
    echo "  src/styles.css - Estilos globales"
    echo ""
}

# Verificar si las dependencias están instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Mostrar información
show_info

# Preguntar qué acción realizar
echo "🤔 ¿Qué quieres hacer?"
echo "1) Iniciar servidor de desarrollo"
echo "2) Ejecutar tests"
echo "3) Crear build de producción"
echo "4) Generar nuevo componente"
echo "5) Solo mostrar información"

read -p "Selecciona una opción (1-5): " option

case $option in
    1)
        echo "🚀 Iniciando servidor de desarrollo..."
        npm run start:codespaces
        ;;
    2)
        echo "🧪 Ejecutando tests..."
        npm run test:headless
        ;;
    3)
        echo "🏗️ Creando build de producción..."
        npm run build
        ;;
    4)
        read -p "📝 Nombre del componente: " component_name
        ng generate component $component_name
        ;;
    5)
        echo "ℹ️ Información mostrada arriba."
        ;;
    *)
        echo "❌ Opción no válida. Mostrando información..."
        ;;
esac

echo ""
echo "✅ ¡Listo! Tu entorno Angular está configurado en Codespaces."
