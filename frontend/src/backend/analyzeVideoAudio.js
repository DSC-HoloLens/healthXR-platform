const axios = require('axios');
const fs = require('fs');
const base64Frames = require('./base64Frames.json'); // Load the base64-encoded frames
const transcription = fs.readFileSync('transcription.txt', 'utf-8'); // Load the audio transcription

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const promptMessages = [
    {
        role: "user",
        content: [
            {
                type: "text",
                text: "These are frames from a video and its corresponding audio transcription. Analyze both the visual and audio content together and provide a single detailed description or transcript of the video.",
            },
            ...base64Frames.map(frame => ({
                type: "image_url",
                image_url: {
                    url: `data:image/jpeg;base64,${frame}`,
                },
            })),
            {
                type: "text",
                text: `Audio Transcription: ${transcription}`,
            },
        ],
    },
];

axios.post('https://api.openai.com/v1/chat/completions', {
    model: "gpt-4o-mini", // Use the correct model for vision capabilities
    messages: promptMessages,
    max_tokens: 500,
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