const { generateAIResponse } = require('../services/geminiService');

// @desc  Check if AI is available (mock since Gemini is cloud-based)
// @route GET /api/ai/status
// @access Public
const getAIStatus = async (req, res) => {
  res.json({ ollama: true, model: 'gemini-2.5-flash', availableModels: [] });
};

// @desc  Chat with AI (streaming SSE)
// @route POST /api/ai/chat
// @access Private
const chatWithAI = async (req, res) => {
  const { message } = req.body;
  const patientId = req.user._id;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: 'Message is required.' });
  }

  // Set SSE headers for streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  await generateAIResponse(patientId, message, res);
};

// @desc  Clear conversation history for current user
// @route DELETE /api/ai/history
// @access Private
const clearHistory = (req, res) => {
  res.json({ message: 'Conversation history cleared.' });
};

// @desc  Analyze triage from voice transcript
// @route POST /api/ai/triage
// @access Private
const analyzeTriageEndpoint = async (req, res) => {
  try {
    const { transcript, language } = req.body;
    if (!transcript) return res.status(400).json({ error: 'Transcript is required' });
    
    // Import the specific function from geminiService
    const { analyzeTriage } = require('../services/geminiService');
    const result = await analyzeTriage(transcript, language || 'en-IN');
    res.json(result);
  } catch (error) {
    console.error('Triage Error:', error);
    res.status(500).json({ error: 'Failed to analyze symptoms.' });
  }
};

const transcribeAudioEndpoint = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file uploaded' });
    
    const language = req.body.language || 'en-IN';
    const { transcribeWithGnani } = require('../services/gnaniService');
    
    const transcript = await transcribeWithGnani(req.file.buffer, language, req.file.originalname);
    res.json({ transcript });
  } catch (error) {
    console.error('STT Endpoint Error:', error);
    res.status(500).json({ error: 'Failed to transcribe audio.' });
  }
};

// @desc  Synthesize speech from text via Gnani TTS
// @route POST /api/ai/tts
// @access Private
const synthesizeSpeechEndpoint = async (req, res) => {
  try {
    const { text, language } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    
    const { synthesizeWithGnani } = require('../services/gnaniService');
    const audioBuffer = await synthesizeWithGnani(text, language || 'en-IN');
    
    res.set('Content-Type', 'audio/wav');
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error('TTS Endpoint Error:', error);
    res.status(500).json({ error: 'Failed to synthesize speech.' });
  }
};

module.exports = { getAIStatus, chatWithAI, clearHistory, analyzeTriageEndpoint, transcribeAudioEndpoint, synthesizeSpeechEndpoint };
