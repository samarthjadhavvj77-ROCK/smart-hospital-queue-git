const express = require('express');
const router = express.Router();
const { getAIStatus, chatWithAI, clearHistory, analyzeTriageEndpoint, transcribeAudioEndpoint, synthesizeSpeechEndpoint } = require('../controllers/aiController.js');
const multer = require('multer');
const upload = multer();
const { protect } = require('../middlewares/authMiddleware.js');

router.get('/status', getAIStatus);
router.post('/chat', protect, chatWithAI);
router.delete('/history', protect, clearHistory);
router.post('/triage', protect, analyzeTriageEndpoint);
router.post('/stt', protect, upload.single('audio'), transcribeAudioEndpoint);
router.post('/tts', protect, synthesizeSpeechEndpoint);

module.exports = router;
