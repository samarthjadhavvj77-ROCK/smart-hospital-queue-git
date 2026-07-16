const express = require('express');
const router = express.Router();
const { getAIStatus, chatWithAI, clearHistory, analyzeTriageEndpoint } = require('../controllers/aiController.js');
const { protect } = require('../middlewares/authMiddleware.js');

router.get('/status', getAIStatus);
router.post('/chat', protect, chatWithAI);
router.delete('/history', protect, clearHistory);
router.post('/triage', protect, analyzeTriageEndpoint);

module.exports = router;
