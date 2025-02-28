const { exec } = require('child_process');

const runScript = (scriptName, callback) => {
    console.log(`Running ${scriptName}...`);
    exec(`node ${scriptName}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error in ${scriptName}:`, error.message);
            return;
        }
        if (stderr) {
            console.error(`Stderr in ${scriptName}:`, stderr);
            return;
        }
        console.log(`Stdout from ${scriptName}:`, stdout);
        callback();
    });
};

runScript('extractFrames.js', () => {
    runScript('encodeFrames.js', () => {
        runScript('transcribeAudio.js', () => {
            runScript('analyzeVideoAudio.js', () => {
                console.log('All scripts completed successfully.');
            });
        });
    });
});