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
import subtitles from "../subtitle/subtitle.json";
import { generateScenes } from "../videoData/imagePromptData";

const FPS = 30;
const msToFrames = (ms) => Math.round((ms / 1000) * FPS);
const SCENES = generateScenes(subtitles);

/* ─────────────── CINEMATIC LETTERBOX ─────────────── */

const Letterbox = () => (
    <>
        <div style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: 60,
            background: "black",
            zIndex: 100,
        }} />
        <div style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: 60,
            background: "black",
            zIndex: 100,
        }} />
    </>
);

/* ─────────────── FILM GRAIN OVERLAY ─────────────── */

const FilmGrain = () => {
    const frame = useCurrentFrame();
    // Cycle through offset positions each frame for animated grain
    const seed = (frame * 7) % 100;
    return (
        <div style={{
            position: "absolute",
            inset: 0,
            zIndex: 50,
            opacity: 0.07,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' seed='${seed}'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "150px 150px",
            pointerEvents: "none",
            mixBlendMode: "overlay",
        }} />
    );
};

/* ─────────────── VIGNETTE ─────────────── */

const Vignette = () => (
    <div style={{
        position: "absolute",
        inset: 0,
        zIndex: 30,
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%)",
        pointerEvents: "none",
    }} />
);

/* ─────────────── CHROMATIC ABERRATION FLASH ─────────────── */

const ChromaFlash = ({ duration }) => {
    const frame = useCurrentFrame();
    // Flash at scene start then disappear
    const opacity = interpolate(frame, [0, 6], [1, 0], { extrapolateRight: "clamp" });

    return (
        <>
            <div style={{
                position: "absolute",
                inset: 0,
                zIndex: 40,
                opacity: opacity * 0.35,
                background: "rgba(255,0,60,1)",
                mixBlendMode: "screen",
                transform: "translateX(-4px)",
                pointerEvents: "none",
            }} />
            <div style={{
                position: "absolute",
                inset: 0,
                zIndex: 40,
                opacity: opacity * 0.35,
                background: "rgba(0,220,255,1)",
                mixBlendMode: "screen",
                transform: "translateX(4px)",
                pointerEvents: "none",
            }} />
            {/* white flash */}
            <div style={{
                position: "absolute",
                inset: 0,
                zIndex: 45,
                opacity: interpolate(frame, [0, 3], [0.6, 0], { extrapolateRight: "clamp" }),
                background: "white",
                pointerEvents: "none",
            }} />
        </>
    );
};

/* ─────────────── SCENE IMAGE ─────────────── */

const SceneImage = ({ sceneNumber, duration, mode }) => {
    const frame = useCurrentFrame();

    const progress = interpolate(frame, [0, duration], [0, 1], {
        extrapolateRight: "clamp",
    });

    // Dramatic punch-in
    const punch = interpolate(frame, [0, 12], [1.25, 1], {
        easing: Easing.out(Easing.cubic),
        extrapolateRight: "clamp",
    });

    // Slow cinematic drift — alternating directions
    const driftX =
        mode % 4 === 0 ? interpolate(progress, [0, 1], [-40, 40]) :
        mode % 4 === 1 ? interpolate(progress, [0, 1], [40, -40]) :
        mode % 4 === 2 ? interpolate(progress, [0, 1], [0, 50]) :
                          interpolate(progress, [0, 1], [0, -50]);

    const driftY =
        mode % 3 === 0 ? interpolate(progress, [0, 1], [20, -20]) :
        mode % 3 === 1 ? interpolate(progress, [0, 1], [-20, 20]) :
                          0;

    // Slow breathe scale
    const scale = interpolate(progress, [0, 0.5, 1], [1.05, 1.12, 1.07]);

    // Motion blur on entry
    const blur = interpolate(frame, [0, 8], [10, 0], { extrapolateRight: "clamp" });

    // Colour grade shift — alternates warm/cool
    const warmth = mode % 2 === 0
        ? "sepia(0.18) saturate(1.4) contrast(1.15) brightness(0.9)"
        : "hue-rotate(10deg) saturate(1.3) contrast(1.18) brightness(0.85)";

    return (
        <AbsoluteFill>
            <Img
                src={staticFile(`/image/${sceneNumber}.jpg`)}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: `
                        translateX(${driftX}px)
                        translateY(${driftY}px)
                        scale(${scale * punch})
                    `,
                    filter: `blur(${blur}px) ${warmth}`,
                    transition: "none",
                }}
            />
            <ChromaFlash duration={duration} />
            <Vignette />
        </AbsoluteFill>
    );
};

/* ─────────────── SCENES ─────────────── */

const Scenes = () => {
    const { durationInFrames } = useVideoConfig();

    return (
        <>
            {SCENES.map((scene, i) => {
                const startWord = subtitles[scene.fromWord];
                const endWord = subtitles[scene.toWord];
                if (!startWord || !endWord) return null;

                const startFrame = msToFrames(startWord.start);
                let endFrame = msToFrames(endWord.end);

                if (i === SCENES.length - 1) {
                    endFrame = durationInFrames;
                }

                const duration = endFrame - startFrame;

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

/* ─────────────── CAPTIONS (UNTOUCHED) ─────────────── */

const Captions = () => {
    const frame = useCurrentFrame();
    let index = -1;

    for (let i = 0; i < subtitles.length; i++) {
        const start = msToFrames(subtitles[i].start);
        const end = msToFrames(subtitles[i].end);
        if (frame >= start && frame <= end) {
            index = i;
            break;
        }
    }

    if (index === -1) return null;

    const prevWord = subtitles[index - 1];
    const currentWord = subtitles[index];

    const pop = interpolate(
        frame,
        [msToFrames(currentWord.start), msToFrames(currentWord.start) + 5],
        [0.9, 1],
        { extrapolateRight: "clamp" }
    );

    return (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
            <div
                style={{
                    textAlign: "center",
                    fontSize: 100,
                    fontWeight: 800,
                    fontFamily: "MyFont",
                    letterSpacing: "0.06em",
                    lineHeight: 1.2,
                    textShadow: "0 2px 6px rgba(0,0,0,0.9)",
                }}
            >
                {prevWord && (
                    <div
                        style={{
                            color: "rgba(255,255,255,0.9)",
                            marginBottom: 6,
                            WebkitTextStroke: "1.3px rgba(0,0,0,0.95)",
                        }}
                    >
                        {prevWord.text}
                    </div>
                )}
                <div
                    style={{
                        color: "red",
                        WebkitTextStroke: "1.4px rgba(0,0,0,1)",
                        transform: `scale(${pop})`,
                    }}
                >
                    {currentWord.text}
                </div>
            </div>
        </AbsoluteFill>
    );
};

/* ─────────────── SCAN LINE ─────────────── */

const ScanLine = () => {
    const frame = useCurrentFrame();
    const y = interpolate(frame % 60, [0, 60], [-5, 105]);
    return (
        <div style={{
            position: "absolute",
            left: 0, right: 0,
            top: `${y}%`,
            height: 2,
            background: "linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)",
            zIndex: 55,
            pointerEvents: "none",
        }} />
    );
};

/* ─────────────── MAIN ─────────────── */

export const MyComposition = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: "black", overflow: "hidden" }}>
            <Scenes />

            {/* Cinematic colour LUT simulation — deep teal shadows */}
            <div style={{
                position: "absolute",
                inset: 0,
                zIndex: 20,
                background: "linear-gradient(to bottom, rgba(0,10,20,0.25) 0%, transparent 40%, transparent 60%, rgba(0,5,15,0.3) 100%)",
                pointerEvents: "none",
                mixBlendMode: "multiply",
            }} />

            {/* Subtle horizontal scan lines texture */}
            <div style={{
                position: "absolute",
                inset: 0,
                zIndex: 25,
                backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)",
                pointerEvents: "none",
            }} />

            <ScanLine />
            <FilmGrain />
            <Letterbox />

            <Audio src={staticFile("audio/script.mp3")} />
            <Audio src={staticFile("audio/bgmusic3.mp3")} volume={0.25} loop />

            {/* Captions sit ABOVE letterbox via zIndex */}
            <div style={{ position: "absolute", inset: 0, zIndex: 110 }}>
                <Captions />
            </div>
        </AbsoluteFill>
    );
};