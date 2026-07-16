const axios = require('axios');
const FormData = require('form-data');

// Use standard vachana API v3 endpoints for Gnani
const GNANI_STT_URL = 'https://api.vachana.ai/stt/v3';
const GNANI_TTS_URL = 'https://api.vachana.ai/api/v1/tts/inference';

async function transcribeWithGnani(audioBuffer, language, originalFilename = 'audio.webm') {
  if (!process.env.GNANI_API_KEY) {
    throw new Error('GNANI_API_KEY is missing in backend .env');
  }

  try {
    const formData = new FormData();
    // V3 STT expects 'audio_file', 'language_code', and 'format'
    formData.append('audio_file', audioBuffer, originalFilename);
    formData.append('language_code', language);
    formData.append('format', 'transcribe');
    formData.append('itn_native_numerals', 'true');
    
    const response = await axios.post(GNANI_STT_URL, formData, {
      headers: {
        ...formData.getHeaders(),
        'X-API-Key-ID': process.env.GNANI_API_KEY,
      }
    });

    // Extract the transcript based on Gnani response structure
    return response.data.transcript || response.data.text || '';
  } catch (error) {
    console.error('Gnani STT Error:', error.response?.data || error.message);
    throw new Error('Failed to transcribe audio with Gnani API');
  }
}

async function synthesizeWithGnani(text, language) {
  if (!process.env.GNANI_API_KEY) {
    throw new Error('GNANI_API_KEY is missing in backend .env');
  }

  try {
    // Map language code to appropriate voice
    let voice = 'Pranav'; // English
    if (language.startsWith('hi')) voice = 'Deepak'; // Hindi
    if (language.startsWith('mr')) voice = 'Deepak'; // Marathi (fallback)
    if (language.startsWith('ta')) voice = 'Kaveri'; // Tamil

    const payload = {
      text: text,
      model: 'vachana-voice-v3',
      voice: voice,
      audio_config: {
        sample_rate: 16000,
        encoding: 'linear_pcm',
        container: 'wav',
        num_channels: 1,
        sample_width: 2
      }
    };

    const response = await axios.post(GNANI_TTS_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key-ID': process.env.GNANI_API_KEY,
      },
      responseType: 'arraybuffer' // Expect binary audio data
    });

    return response.data;
  } catch (error) {
    console.error('Gnani TTS Error:', error.response?.data || error.message);
    throw new Error('Failed to synthesize speech with Gnani API');
  }
}

module.exports = { transcribeWithGnani, synthesizeWithGnani };

