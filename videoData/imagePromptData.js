export function generateScenes(subtitles) {
    const scenes = [];
    if (!subtitles.length) return scenes;

    let sceneNumber = 1;
    let fromWordIndex = 0;
    let currentWords = [];

    // 4 second bucket
    const getBucket = (ms) => Math.floor(ms / 4000);

    let currentBucket = getBucket(subtitles[0].start);

    subtitles.forEach((wordObj, index) => {
        const bucket = getBucket(wordObj.start);

        if (bucket !== currentBucket) {
            scenes.push({
                scene: sceneNumber,
                dialogue: currentWords.map(w => w.text).join(" "),
                fromWord: fromWordIndex,
                toWord: index - 1
            });

            sceneNumber++;
            currentBucket = bucket;
            fromWordIndex = index;
            currentWords = [];
        }

        currentWords.push(wordObj);
    });

    // Push last scene
    if (currentWords.length) {
        scenes.push({
            scene: sceneNumber,
            dialogue: currentWords.map(w => w.text).join(" "),
            fromWord: fromWordIndex,
            toWord: subtitles.length - 1
        });
    }

    return scenes;
}