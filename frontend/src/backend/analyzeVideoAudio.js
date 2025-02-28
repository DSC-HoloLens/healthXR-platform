const axios = require('axios');
const fs = require('fs');
const base64Frames = require('./base64Frames.json');
const transcription = fs.readFileSync('transcription.txt', 'utf-8');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log('Analyzing video and audio...');
const promptMessages = [
    {
        role: "user",
        content: [
            "These are frames from a video and its corresponding audio transcription. Analyze both the visual and audio content together and provide a single detailed description or transcript of the video.",
            ...base64Frames.map(frame => ({ image: frame, resize: 768 })),
            { text: `Audio Transcription: ${transcription}` },
        ],
    },
];

axios.post('https://api.openai.com/v1/chat/completions', {
    model: "gpt-4o-mini",
    messages: promptMessages,
    max_tokens: 10000,
}, {
    headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
    },
}).then(response => {
    console.log('Combined Analysis:', response.data.choices[0].message.content);
}).catch(error => {
    console.error('Error analyzing video and audio:', error.response ? error.response.data : error.message);
});