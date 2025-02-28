const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

const videoPath = 'data/4secVid.mp4'; // Path to your video
const outputDir = 'frames'; // Folder to save extracted frames

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Use ffprobe to get the duration of the video
ffmpeg.ffprobe(videoPath, (err, metadata) => {
    if (err) {
        console.error('Error getting video metadata:', err);
        return;
    }

    const duration = metadata.format.duration; // Duration of the video in seconds
    const frameRate = 5; // Number of frames to extract per second
    const totalFrames = Math.ceil(duration * frameRate); // Total frames to extract

    console.log(`Video duration: ${duration} seconds`);
    console.log(`Extracting ${totalFrames} frames...`);

    // Generate timestamps for frame extraction
    const timestamps = Array.from({ length: totalFrames }, (_, i) => i / frameRate);

    // Extract frames at the specified timestamps
    ffmpeg(videoPath)
        .on('end', () => {
            console.log('Frames extracted successfully.');
        })
        .on('error', (err) => {
            console.error('Error extracting frames:', err);
        })
        .screenshot({
            folder: outputDir,
            filename: 'frame_%04d.jpg', // Save frames as frame_0001.jpg, frame_0002.jpg, etc.
            timestamps: timestamps, // Extract frames at the calculated timestamps
        });
});