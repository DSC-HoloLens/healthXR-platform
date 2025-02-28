const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const audioFilePath = 'audio.mp3';

console.log('Extracting audio from video...');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg('data/bison.mp4')
    .output(audioFilePath)
    .noVideo()
    .on('end', () => {
        console.log('Audio extracted successfully.');

        console.log('Transcribing audio...');
        const formData = new FormData();
        formData.append('file', fs.createReadStream(audioFilePath));
        formData.append('model', 'whisper-1');

        axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                ...formData.getHeaders(),
            },
        }).then(response => {
            console.log('Transcription:', response.data.text);
            fs.writeFileSync('transcription.txt', response.data.text);
        }).catch(error => {
            console.error('Error transcribing audio:', error.response ? error.response.data : error.message);
        });
    })
    .on('error', (err) => {
        console.error('Error extracting audio:', err);
    })
    .run();