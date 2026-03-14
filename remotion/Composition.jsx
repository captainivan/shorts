// VERSION 2 (fixed)

import {
    AbsoluteFill,
    Audio,
    Img,
    Sequence,
    useCurrentFrame,
    interpolate,
    Easing,
    staticFile,
    useVideoConfig,
} from "remotion";
import "./remotion.css";

const FPS = 30;
const msToFrames = (ms) => Math.round((ms / 1000) * FPS);

/* ─────────────── UTILS ─────────────── */

const seededRandom = (seed) => {
    const x = Math.sin(seed + 1) * 43758.5453123;
    return x - Math.floor(x);
};

const ACCENT_COLORS = ["#FF3C3C", "#FFD700", "#00E5FF", "#FF6EC7", "#7FFF00"];

/* ═══════════════════════════════════════════════
MAIN COMPOSITION
═══════════════════════════════════════════════ */

export const MyComposition = ({
    audio,
    subtitles,
    basicData
}) => {

    const musicMap = {
        Inspirational: "audio/inspirational.mp3",
        Tragic: "audio/tragic.mp3",
        Dark: "audio/dark.mp3",
        Mysterious: "audio/mysterious.mp3",
        Epic: "audio/epic.mp3"
    };

    const volumeMap = {
        Inspirational: 0.40,
        Tragic: 0.50,
        Dark: 0.80,
        Mysterious: 0.50,
        Epic: 0.40
    }

    const bgMusicSrc = musicMap[basicData?.musicstyle] || "audio/epic.mp3";

    const bgMusicVolume = volumeMap[basicData?.musicstyle] || 0.25;

    /* ── SAFE SUBTITLES ── */
    const safeSubtitles = subtitles?.words || [];

    /* ── BUILD SCENES ── */
    const buildScenes = () => {
        const scenes = [];
        if (!safeSubtitles.length) return scenes;

        let sceneNumber = 1;
        let fromWordIndex = 0;
        let currentWords = [];

        const getBucket = (ms) => Math.floor(ms / 4000);

        let currentBucket = getBucket(safeSubtitles[0].start);

        safeSubtitles.forEach((wordObj, index) => {
            const bucket = getBucket(wordObj.start);

            if (bucket !== currentBucket) {
                scenes.push({
                    scene: sceneNumber,
                    dialogue: currentWords.map((w) => w.text).join(" "),
                    fromWord: fromWordIndex,
                    toWord: index - 1,
                });

                sceneNumber++;
                currentBucket = bucket;
                fromWordIndex = index;
                currentWords = [];
            }

            currentWords.push(wordObj);
        });

        if (currentWords.length) {
            scenes.push({
                scene: sceneNumber,
                dialogue: currentWords.map((w) => w.text).join(" "),
                fromWord: fromWordIndex,
                toWord: safeSubtitles.length - 1,
            });
        }

        return scenes;
    };

    const scenes = buildScenes();

    /* ── FILM GRAIN ── */

    const FilmGrain = () => {
        const frame = useCurrentFrame();
        const seed = (frame * 7) % 100;

        return (
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 50,
                    opacity: 0.07,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' seed='${seed}'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundSize: "150px 150px",
                    pointerEvents: "none",
                    mixBlendMode: "overlay",
                }}
            />
        );
    };

    /* ── VIGNETTE ── */

    const Vignette = () => (
        <div
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 30,
                background:
                    "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%)",
                pointerEvents: "none",
            }}
        />
    );

    /* ── CHROMA FLASH ── */

    const ChromaFlash = () => {
        const frame = useCurrentFrame();

        const opacity = interpolate(frame, [0, 6], [1, 0], {
            extrapolateRight: "clamp",
        });

        return (
            <>
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 40,
                        opacity: opacity * 0.35,
                        background: "rgba(255,0,60,1)",
                        mixBlendMode: "screen",
                        transform: "translateX(-4px)",
                    }}
                />

                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 40,
                        opacity: opacity * 0.35,
                        background: "rgba(0,220,255,1)",
                        mixBlendMode: "screen",
                        transform: "translateX(4px)",
                    }}
                />

                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 45,
                        opacity: interpolate(frame, [0, 3], [0.6, 0], {
                            extrapolateRight: "clamp",
                        }),
                        background: "white",
                    }}
                />
            </>
        );
    };

    /* ── SCENE IMAGE ── */

    const SceneImage = ({ sceneNumber, duration, mode }) => {
        const frame = useCurrentFrame();

        const progress = interpolate(frame, [0, duration], [0, 1], {
            extrapolateRight: "clamp",
        });

        const punch = interpolate(frame, [0, 12], [1.25, 1], {
            easing: Easing.out(Easing.cubic),
            extrapolateRight: "clamp",
        });

        const driftX =
            mode % 4 === 0
                ? interpolate(progress, [0, 1], [-40, 40])
                : mode % 4 === 1
                    ? interpolate(progress, [0, 1], [40, -40])
                    : mode % 4 === 2
                        ? interpolate(progress, [0, 1], [0, 50])
                        : interpolate(progress, [0, 1], [0, -50]);

        const driftY =
            mode % 3 === 0
                ? interpolate(progress, [0, 1], [20, -20])
                : mode % 3 === 1
                    ? interpolate(progress, [0, 1], [-20, 20])
                    : 0;

        const scale = interpolate(progress, [0, 0.5, 1], [1.05, 1.12, 1.07]);

        const blur = interpolate(frame, [0, 8], [10, 0], {
            extrapolateRight: "clamp",
        });

        const warmth =
            mode % 2 === 0
                ? "sepia(0.18) saturate(1.4) contrast(1.15) brightness(0.9)"
                : "hue-rotate(10deg) saturate(1.3) contrast(1.18) brightness(0.85)";

        return (
            <AbsoluteFill>
                <Img
                    src={`https://ik.imagekit.io/ilunarivanthesecond/images/${sceneNumber}.jpg?updatedAt=${Date.now()}`}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transform: `translateX(${driftX}px) translateY(${driftY}px) scale(${scale * punch})`,
                        filter: `blur(${blur}px) ${warmth}`,
                    }}
                />
                <ChromaFlash />
                <Vignette />
            </AbsoluteFill>
        );
    };

    /* ── SCENES ── */

    const Scenes = () => {
        const { durationInFrames } = useVideoConfig();

        return (
            <>
                {scenes.map((scene, i) => {
                    const startWord = safeSubtitles[scene.fromWord];
                    const endWord = safeSubtitles[scene.toWord];

                    if (!startWord || !endWord) return null;

                    const startFrame = msToFrames(startWord.start);

                    const nextScene = scenes[i + 1];
                    const nextStartWord = nextScene
                        ? safeSubtitles[nextScene.fromWord]
                        : null;

                    let endFrame = nextStartWord
                        ? msToFrames(nextStartWord.start)
                        : durationInFrames;

                    if (i === scenes.length - 1) endFrame = durationInFrames;

                    const duration = Math.max(1, endFrame - startFrame);

                    return (
                        <Sequence key={i} from={startFrame} durationInFrames={duration}>
                            <SceneImage
                                sceneNumber={scene.scene}
                                duration={duration}
                                mode={i}
                            />
                        </Sequence>
                    );
                })}
            </>
        );
    };

    /* ── CAPTIONS ── */

    const Captions = () => {
        const frame = useCurrentFrame();

        let index = -1;

        for (let i = 0; i < safeSubtitles.length; i++) {
            const start = msToFrames(safeSubtitles[i].start);
            const end = msToFrames(safeSubtitles[i].end);

            if (frame >= start && frame <= end) {
                index = i;
                break;
            }
        }

        if (index === -1) return null;

        const prevWord = safeSubtitles[index - 1];
        const currentWord = safeSubtitles[index];

        const pop = interpolate(
            frame,
            [msToFrames(currentWord.start), msToFrames(currentWord.start) + 6],
            [1.35, 1],
            { easing: Easing.out(Easing.back(2)), extrapolateRight: "clamp" }
        );

        const slideY = interpolate(
            frame,
            [msToFrames(currentWord.start), msToFrames(currentWord.start) + 8],
            [18, 0],
            { easing: Easing.out(Easing.cubic), extrapolateRight: "clamp" }
        );

        const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length];

        return (
            <AbsoluteFill
                style={{ justifyContent: "center", alignItems: "center", paddingBottom: 60 }}
            >
                <div style={{ textAlign: "center" }}>
                    {prevWord && (
                        <div style={{
                            fontSize: 88,
                            color: "rgba(255,255,255,0.55)",
                            fontFamily: "MyFont",
                            WebkitTextStroke: "3px black",
                            textShadow: "0 0 10px rgba(0,0,0,0.8)",
                        }}>
                            {prevWord.text}
                        </div>
                    )}

                    <div
                        style={{
                            fontSize: 112,
                            fontWeight: 900,
                            color: accentColor,
                            transform: `scale(${pop}) translateY(${slideY}px)`,
                            textTransform: "uppercase",
                            fontFamily: "MyFont",
                            WebkitTextStroke: "3px black",
                            textShadow: "0 0 10px rgba(0,0,0,0.8)",
                        }}
                    >
                        {currentWord.text}
                    </div>
                </div>
            </AbsoluteFill>
        );
    };

    /* ── RENDER ── */

    return (
        <AbsoluteFill style={{ backgroundColor: "black", overflow: "hidden" }}>
            <Scenes />
            <FilmGrain />
            <Audio src={audio || "https://ik.imagekit.io/ilunarivanthesecond/audio.mp3"} />
            <Audio src={staticFile(bgMusicSrc)} volume={bgMusicVolume} loop />
            <div style={{ position: "absolute", inset: 0, zIndex: 110 }}>
                <Captions />
            </div>
        </AbsoluteFill>
    );
};
