// VERSION 2

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
console.log(SCENES);

/* ─────────────── UTILS ─────────────── */

const seededRandom = (seed) => {
    const x = Math.sin(seed + 1) * 43758.5453123;
    return x - Math.floor(x);
};

/* ═══════════════════════════════════════════════
   VIDEO EFFECTS  ← VERSION 2 only
═══════════════════════════════════════════════ */

/* ── FILM GRAIN ── */
const FilmGrain = () => {
    const frame = useCurrentFrame();
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

/* ── VIGNETTE ── */
const Vignette = () => (
    <div style={{
        position: "absolute",
        inset: 0,
        zIndex: 30,
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%)",
        pointerEvents: "none",
    }} />
);

/* ── CHROMATIC ABERRATION FLASH ── */
const ChromaFlash = ({ duration }) => {
    const frame = useCurrentFrame();
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

/* ── SCENE IMAGE — Version 2 motion + grades ── */
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

    // Colour grade — alternates warm/cool
    const warmth = mode % 2 === 0
        ? "sepia(0.18) saturate(1.4) contrast(1.15) brightness(0.9)"
        : "hue-rotate(10deg) saturate(1.3) contrast(1.18) brightness(0.85)";

    return (
        <AbsoluteFill>
            <Img
                src={staticFile(`/image/${sceneNumber}.jpeg`)}
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

/* ── SCENE SEQUENCER ── */
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

/* ═══════════════════════════════════════════════
   CAPTIONS  ← VERSION 1 only
   accent colors · glow · bounce · slide-up · italic · uppercase
═══════════════════════════════════════════════ */

const ACCENT_COLORS = ["#FF3C3C", "#FFD700", "#00E5FF", "#FF6EC7", "#7FFF00"];

const Captions = () => {
    const frame = useCurrentFrame();
    let index = -1;

    for (let i = 0; i < subtitles.length; i++) {
        const start = msToFrames(subtitles[i].start);
        const end = msToFrames(subtitles[i].end);
        if (frame >= start && frame <= end) { index = i; break; }
    }

    if (index === -1) return null;

    const prevWord = subtitles[index - 1];
    const currentWord = subtitles[index];

    // Pop / bounce scale
    const pop = interpolate(
        frame,
        [msToFrames(currentWord.start), msToFrames(currentWord.start) + 6],
        [1.35, 1],
        { easing: Easing.out(Easing.back(2)), extrapolateRight: "clamp" }
    );

    // Slide-up entry
    const slideY = interpolate(
        frame,
        [msToFrames(currentWord.start), msToFrames(currentWord.start) + 8],
        [18, 0],
        { easing: Easing.out(Easing.cubic), extrapolateRight: "clamp" }
    );

    // Subtle shake on word change
    const wordShakeX = interpolate(
        frame,
        [msToFrames(currentWord.start), msToFrames(currentWord.start) + 3],
        [seededRandom(index) * 8 - 4, 0],
        { extrapolateRight: "clamp" }
    );

    // Glow pulse on current word
    const glowPulse = interpolate(
        frame,
        [msToFrames(currentWord.start), msToFrames(currentWord.start) + 15],
        [1, 0.4],
        { extrapolateRight: "clamp" }
    );

    const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length];
    const glowShadow = `0 0 ${20 * glowPulse}px ${accentColor}, 0 0 ${40 * glowPulse}px ${accentColor}80, 0 3px 8px rgba(0,0,0,0.95)`;

    return (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 60 }}>
            <div style={{
                position: "relative",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
            }}>
                {/* Previous word — faded */}
                {prevWord && (
                    <div style={{
                        fontSize: 88,
                        fontWeight: 900,
                        fontFamily: "MyFont",
                        letterSpacing: "0.04em",
                        color: "rgba(255,255,255,0.55)",
                        WebkitTextStroke: "1.5px rgba(0,0,0,0.8)",
                        textShadow: "0 2px 8px rgba(0,0,0,0.9)",
                        lineHeight: 1.1,
                    }}>
                        {prevWord.text}
                    </div>
                )}

                {/* Current word — big energy */}
                <div style={{
                    fontSize: 112,
                    fontWeight: 900,
                    fontFamily: "MyFont",
                    letterSpacing: "0.05em",
                    color: accentColor,
                    WebkitTextStroke: "2px rgba(0,0,0,1)",
                    textShadow: glowShadow,
                    transform: `scale(${pop}) translateY(${slideY}px) translateX(${wordShakeX}px)`,
                    lineHeight: 1.0,
                    fontStyle: index % 3 === 0 ? "italic" : "normal",
                    textTransform: "uppercase",
                }}>
                    {currentWord.text}
                </div>
            </div>
        </AbsoluteFill>
    );
};

/* ═══════════════════════════════════════════════
   MAIN COMPOSITION
═══════════════════════════════════════════════ */

export const MyComposition = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: "black", overflow: "hidden" }}>

            {/* ── Scene images — Version 2 effects ── */}
            <Scenes />

            {/* ── Cinema LUT — Version 2 ── */}
            <div style={{
                position: "absolute",
                inset: 0,
                zIndex: 20,
                background: "linear-gradient(to bottom, rgba(0,10,20,0.25) 0%, transparent 40%, transparent 60%, rgba(0,5,15,0.3) 100%)",
                pointerEvents: "none",
                mixBlendMode: "multiply",
            }} />

            {/* ── Film grain — Version 2 ── */}
            <FilmGrain />

            {/* ── Audio ── */}
            <Audio src={staticFile("audio/script.mp3")} />
            <Audio src={staticFile("audio/bgmusic2.mp3")} volume={0.25} loop />

            {/* ── Captions — Version 1 style ── */}
            <div style={{ position: "absolute", inset: 0, zIndex: 110 }}>
                <Captions />
            </div>

        </AbsoluteFill>
    );
};
