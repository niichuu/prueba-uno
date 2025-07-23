# Quiz Backend API

Backend Express.js para la aplicación de quiz que maneja el almacenamiento de datos en archivos JSON.

## 🚀 Inicio Rápido

```bash
cd backend
npm install
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📊 Estructura de Datos

### Quiz Status
```json
{
  "isActive": false,
  "currentQuestion": 0,
  "totalQuestions": 0,
  "createdAt": "2025-07-23T03:16:19.140Z"
}
```

### Question
```json
{
  "id": "1",
  "title": "¿Cuál es la capital de Francia?",
  "options": [
    { "id": "1", "text": "Madrid", "isCorrect": false },
    { "id": "2", "text": "París", "isCorrect": true },
    { "id": "3", "text": "Roma", "isCorrect": false },
    { "id": "4", "text": "Berlín", "isCorrect": false }
  ],
  "points": 10
}
```

### Participant
```json
{
  "name": "Juan Pérez",
  "joinedAt": "2025-07-23T03:16:19.140Z"
}
```

### User Response
```json
{
  "userName": "Juan Pérez",
  "questionId": "1",
  "selectedOptionId": "2",
  "selectedOptionText": "París",
  "timestamp": "2025-07-23T03:16:19.140Z"
}
```

## 🛠 API Endpoints

### 1. Estado del Quiz

#### GET /api/quiz-status
Obtiene el estado actual del quiz.

#### POST /api/quiz-status
Actualiza completamente el estado del quiz.

#### PATCH /api/quiz-status
Actualiza parcialmente el estado del quiz.

### 2. Preguntas

#### GET /api/questions
Obtiene todas las preguntas.

#### GET /api/questions/:id
Obtiene una pregunta específica por ID.

#### POST /api/questions
Guarda el conjunto completo de preguntas.

### 3. Participantes

#### GET /api/participants
Obtiene todos los participantes.

#### POST /api/participants
Registra un nuevo participante.

### 4. Respuestas

#### GET /api/responses
Obtiene todas las respuestas.

#### POST /api/responses
Guarda una nueva respuesta.

### 5. Ranking

#### GET /api/ranking
Calcula y retorna el ranking de participantes.

### 6. Utilidades

#### GET /api/health
Verificación de estado del servidor.

#### DELETE /api/clear-data
Limpia todos los datos del quiz (excepto preguntas por defecto).

## 💾 Archivos de Datos

Los datos se almacenan en la carpeta `data/`:

- `quiz-status.json` - Estado actual del quiz
- `questions.json` - Preguntas del quiz
- `participants.json` - Lista de participantes
- `responses.json` - Respuestas de los participantes

## 🔧 Configuración

- **Puerto**: 3000 (configurable en `server.js`)
- **CORS**: Habilitado para desarrollo
- **Formato de datos**: JSON
- **Almacenamiento**: Archivos locales

## 📋 Scripts Disponibles

- `npm start` - Inicia el servidor
- `npm run dev` - Inicia el servidor con nodemon (desarrollo)

## 🌟 Características

- ✅ API RESTful completa
- ✅ Almacenamiento en archivos JSON
- ✅ CORS habilitado
- ✅ Manejo de errores
- ✅ Cálculo automático de ranking
- ✅ Datos de ejemplo incluidos
- ✅ Inicialización automática de archivos
