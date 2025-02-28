const fs = require('fs');
const path = require('path');

const framesDir = 'frames';
const frames = fs.readdirSync(framesDir).map(file => path.join(framesDir, file));

console.log(`Encoding ${frames.length} frames...`);
const base64Frames = frames.map(frame => {
    const image = fs.readFileSync(frame);
    return Buffer.from(image).toString('base64');
});

console.log(`${base64Frames.length} frames encoded.`);
fs.writeFileSync('base64Frames.json', JSON.stringify(base64Frames));