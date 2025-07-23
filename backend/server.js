const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3001;

// Configurar CORS para permitir conexiones desde Angular
app.use(cors());
app.use(express.json());

// Rutas de archivos JSON
const DATA_DIR = path.join(__dirname, 'data');
const QUIZ_STATUS_FILE = path.join(DATA_DIR, 'quiz-status.json');
const QUESTIONS_FILE = path.join(DATA_DIR, 'questions.json');
const PARTICIPANTS_FILE = path.join(DATA_DIR, 'participants.json');
const RESPONSES_FILE = path.join(DATA_DIR, 'responses.json');

// Función para leer archivo JSON
async function readJsonFile(filePath, defaultValue = {}) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Si el archivo no existe, retornar valor por defecto
    if (error.code === 'ENOENT') {
      await writeJsonFile(filePath, defaultValue);
      return defaultValue;
    }
    throw error;
  }
}

// Función para escribir archivo JSON
async function writeJsonFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Middleware para crear directorio de datos si no existe
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch (error) {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Inicializar archivos con datos por defecto
async function initializeData() {
  await ensureDataDir();
  
  // Inicializar quiz-status.json
  const defaultQuizStatus = {
    isActive: false,
    currentQuestion: 0,
    totalQuestions: 0,
    createdAt: new Date().toISOString()
  };
  await readJsonFile(QUIZ_STATUS_FILE, defaultQuizStatus);
  
  // Inicializar questions.json con preguntas por defecto
  const defaultQuestions = [
    {
      id: "1",
      title: "¿Cuál es la capital de Francia?",
      options: [
        { id: "1", text: "Madrid", isCorrect: false },
        { id: "2", text: "París", isCorrect: true },
        { id: "3", text: "Roma", isCorrect: false },
        { id: "4", text: "Berlín", isCorrect: false }
      ],
      points: 10
    },
    {
      id: "2",
      title: "¿Qué planeta es conocido como el planeta rojo?",
      options: [
        { id: "1", text: "Venus", isCorrect: false },
        { id: "2", text: "Marte", isCorrect: true },
        { id: "3", text: "Júpiter", isCorrect: false },
        { id: "4", text: "Saturno", isCorrect: false }
      ],
      points: 10
    },
    {
      id: "3",
      title: "¿En qué año llegó el hombre a la luna?",
      options: [
        { id: "1", text: "1967", isCorrect: false },
        { id: "2", text: "1968", isCorrect: false },
        { id: "3", text: "1969", isCorrect: true },
        { id: "4", text: "1970", isCorrect: false }
      ],
      points: 10
    },
    {
      id: "4",
      title: "¿Cuál es el océano más grande del mundo?",
      options: [
        { id: "1", text: "Atlántico", isCorrect: false },
        { id: "2", text: "Índico", isCorrect: false },
        { id: "3", text: "Ártico", isCorrect: false },
        { id: "4", text: "Pacífico", isCorrect: true }
      ],
      points: 10
    },
    {
      id: "5",
      title: "¿Quién escribió 'Don Quijote de la Mancha'?",
      options: [
        { id: "1", text: "García Lorca", isCorrect: false },
        { id: "2", text: "Miguel de Cervantes", isCorrect: true },
        { id: "3", text: "Lope de Vega", isCorrect: false },
        { id: "4", text: "Calderón de la Barca", isCorrect: false }
      ],
      points: 10
    }
  ];
  await readJsonFile(QUESTIONS_FILE, defaultQuestions);
  
  // Inicializar participants.json
  await readJsonFile(PARTICIPANTS_FILE, []);
  
  // Inicializar responses.json
  await readJsonFile(RESPONSES_FILE, []);
}

// =============================================================================
// RUTAS DE LA API
// =============================================================================

// 1. Estado del quiz
app.get('/api/quiz-status', async (req, res) => {
  try {
    const status = await readJsonFile(QUIZ_STATUS_FILE);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el estado del quiz' });
  }
});

app.post('/api/quiz-status', async (req, res) => {
  try {
    const newStatus = req.body;
    await writeJsonFile(QUIZ_STATUS_FILE, newStatus);
    res.json({ message: 'Estado del quiz actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el estado del quiz' });
  }
});

app.patch('/api/quiz-status', async (req, res) => {
  try {
    const currentStatus = await readJsonFile(QUIZ_STATUS_FILE);
    const updatedStatus = { ...currentStatus, ...req.body };
    await writeJsonFile(QUIZ_STATUS_FILE, updatedStatus);
    res.json({ message: 'Estado del quiz actualizado correctamente', status: updatedStatus });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el estado del quiz' });
  }
});

// 2. Preguntas
app.get('/api/questions', async (req, res) => {
  try {
    const questions = await readJsonFile(QUESTIONS_FILE, []);
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las preguntas' });
  }
});

app.get('/api/questions/:id', async (req, res) => {
  try {
    const questions = await readJsonFile(QUESTIONS_FILE, []);
    const question = questions.find(q => q.id === req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Pregunta no encontrada' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la pregunta' });
  }
});

app.post('/api/questions', async (req, res) => {
  try {
    const questions = req.body;
    await writeJsonFile(QUESTIONS_FILE, questions);
    res.json({ message: 'Preguntas guardadas correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar las preguntas' });
  }
});

// 3. Participantes
app.get('/api/participants', async (req, res) => {
  try {
    const participants = await readJsonFile(PARTICIPANTS_FILE, []);
    res.json(participants);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los participantes' });
  }
});

app.post('/api/participants', async (req, res) => {
  try {
    const participant = req.body;
    const participants = await readJsonFile(PARTICIPANTS_FILE, []);
    
    // Verificar si el participante ya existe
    const existingParticipant = participants.find(p => p.name === participant.name);
    if (existingParticipant) {
      return res.status(400).json({ error: 'El participante ya está registrado' });
    }
    
    participants.push(participant);
    await writeJsonFile(PARTICIPANTS_FILE, participants);
    res.json({ message: 'Participante registrado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar participante' });
  }
});

// 4. Respuestas
app.get('/api/responses', async (req, res) => {
  try {
    const responses = await readJsonFile(RESPONSES_FILE, []);
    res.json(responses);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las respuestas' });
  }
});

app.post('/api/responses', async (req, res) => {
  try {
    const response = req.body;
    const responses = await readJsonFile(RESPONSES_FILE, []);
    responses.push(response);
    await writeJsonFile(RESPONSES_FILE, responses);
    res.json({ message: 'Respuesta guardada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar la respuesta' });
  }
});

// 5. Ranking (calculado)
app.get('/api/ranking', async (req, res) => {
  try {
    const participants = await readJsonFile(PARTICIPANTS_FILE, []);
    const responses = await readJsonFile(RESPONSES_FILE, []);
    const questions = await readJsonFile(QUESTIONS_FILE, []);
    
    // Calcular puntuación para cada participante
    const ranking = participants.map(participant => {
      const participantResponses = responses.filter(r => r.userName === participant.name);
      let score = 0;
      let totalPoints = 0;
      
      participantResponses.forEach(response => {
        const question = questions.find(q => q.id === response.questionId);
        if (question) {
          const correctOption = question.options.find(opt => opt.isCorrect);
          if (correctOption && response.selectedOptionId === correctOption.id) {
            score += question.points;
          }
          totalPoints += question.points;
        }
      });
      
      return {
        name: participant.name,
        score: score,
        totalQuestions: questions.length,
        totalPoints: totalPoints,
        percentage: totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0
      };
    });
    
    // Ordenar por puntuación descendente
    ranking.sort((a, b) => b.score - a.score);
    
    res.json(ranking);
  } catch (error) {
    res.status(500).json({ error: 'Error al calcular el ranking' });
  }
});

// 6. Limpiar datos (reiniciar quiz)
app.delete('/api/clear-data', async (req, res) => {
  try {
    await writeJsonFile(PARTICIPANTS_FILE, []);
    await writeJsonFile(RESPONSES_FILE, []);
    
    const defaultQuizStatus = {
      isActive: false,
      currentQuestion: 0,
      totalQuestions: 0,
      createdAt: new Date().toISOString()
    };
    await writeJsonFile(QUIZ_STATUS_FILE, defaultQuizStatus);
    
    res.json({ message: 'Datos del quiz limpiados correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al limpiar los datos' });
  }
});

// Ruta de verificación
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend del quiz funcionando correctamente', timestamp: new Date().toISOString() });
});

// Inicializar datos y arrancar servidor
initializeData().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
    console.log(`📊 API disponible en http://localhost:${PORT}/api/`);
    console.log(`💾 Datos almacenados en: ${DATA_DIR}`);
  });
}).catch(error => {
  console.error('Error al inicializar el backend:', error);
  process.exit(1);
});
