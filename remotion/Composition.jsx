import {
	AbsoluteFill,
	Audio,
	Img,
	Sequence,
	useCurrentFrame,
	interpolate,
	Easing,
	staticFile,
} from "remotion";
import "./remotion.css";

import subtitles from "../subtitle/subtitle.json";
const FPS = 30;
const msToFrames = (ms) => Math.round((ms / 1000) * FPS);

/* ---------------- SCENES ---------------- */
const RAW_SCENES = [
	{
		"image": 1,
		"fromWord": 0,
		"toWord": 10
	},
	{
		"image": 2,
		"fromWord": 11,
		"toWord": 21
	},
	{
		"image": 3,
		"fromWord": 22,
		"toWord": 30
	},
	{
		"image": 4,
		"fromWord": 31,
		"toWord": 34
	},
	{
		"image": 5,
		"fromWord": 35,
		"toWord": 46
	},
	{
		"image": 6,
		"fromWord": 47,
		"toWord": 52
	},
	{
		"image": 7,
		"fromWord": 53,
		"toWord": 59
	},
	{
		"image": 8,
		"fromWord": 60,
		"toWord": 68
	},
	{
		"image": 9,
		"fromWord": 69,
		"toWord": 76
	},
	{
		"image": 10,
		"fromWord": 77,
		"toWord": 83
	},
	{
		"image": 11,
		"fromWord": 84,
		"toWord": 94
	},
	{
		"image": 12,
		"fromWord": 95,
		"toWord": 102
	},
	{
		"image": 13,
		"fromWord": 103,
		"toWord": 112
	},
	{
		"image": 14,
		"fromWord": 113,
		"toWord": 120
	},
	{
		"image": 15,
		"fromWord": 121,
		"toWord": 129
	},
	{
		"image": 16,
		"fromWord": 130,
		"toWord": 139
	},
	{
		"image": 17,
		"fromWord": 140,
		"toWord": 149
	},
	{
		"image": 18,
		"fromWord": 150,
		"toWord": 156
	},
	{
		"image": 19,
		"fromWord": 157,
		"toWord": 167
	},
	{
		"image": 20,
		"fromWord": 168,
		"toWord": 173
	},
	{
		"image": 21,
		"fromWord": 174,
		"toWord": 182
	},
	{
		"image": 22,
		"fromWord": 183,
		"toWord": 191
	},
	{
		"image": 23,
		"fromWord": 192,
		"toWord": 200
	},
	{
		"image": 24,
		"fromWord": 201,
		"toWord": 212
	},
	{
		"image": 25,
		"fromWord": 213,
		"toWord": 223
	},
	{
		"image": 26,
		"fromWord": 224,
		"toWord": 232
	},
	{
		"image": 27,
		"fromWord": 233,
		"toWord": 239
	},
	{
		"image": 28,
		"fromWord": 240,
		"toWord": 247
	},
	{
		"image": 29,
		"fromWord": 248,
		"toWord": 256
	},
	{
		"image": 30,
		"fromWord": 257,
		"toWord": 266
	},
	{
		"image": 31,
		"fromWord": 267,
		"toWord": 274
	},
	{
		"image": 32,
		"fromWord": 275,
		"toWord": 284
	},
	{
		"image": 33,
		"fromWord": 285,
		"toWord": 292
	},
	{
		"image": 34,
		"fromWord": 293,
		"toWord": 302
	},
	{
		"image": 35,
		"fromWord": 303,
		"toWord": 307
	}
];

const SCENES = RAW_SCENES.map((s) => ({
	...s,
	fromWord: Math.min(s.fromWord, subtitles.length - 1),
	toWord: Math.min(s.toWord, subtitles.length - 1),
}));

/* ---------------- MOTION PRESETS ---------------- */
const MOTIONS = [
	{ x: [-28, 0], zoom: [1.02, 1.08] }, // left + zoom in
	{ x: [28, 0], zoom: [1.08, 1.02] }, // right + zoom out
];

/* ---------------- SCENES LAYER ---------------- */
const Scenes = () => {
	const frame = useCurrentFrame();
	let cursor = 0;

	return (
		<>
			{SCENES.map((scene, i) => {
				const startWord = subtitles[scene.fromWord];
				const endWord = subtitles[scene.toWord];
				if (!startWord || !endWord) return null;

				const duration = Math.max(
					msToFrames(endWord.end - startWord.start),
					24
				);

				const fade = Math.min(12, Math.floor(duration / 3));

				const from = cursor;
				cursor += duration;

				const local = frame - from;
				const motion = MOTIONS[i % MOTIONS.length];

				const progress = interpolate(
					local,
					[0, duration],
					[0, 1],
					{ extrapolateRight: "clamp" }
				);

				const x = interpolate(progress, [0, 1], motion.x);
				const scale = interpolate(
					progress,
					[0, 1],
					motion.zoom,
					{ easing: Easing.linear }
				);

				const opacity = interpolate(
					local,
					[0, fade, duration - fade, duration],
					[0.9, 1, 1, 0.9],
					{ extrapolateRight: "clamp" }
				);

				const blur = interpolate(
					local,
					[0, fade, duration - fade, duration],
					[6, 0, 0, 6],
					{ extrapolateRight: "clamp" }
				);

				return (
					<Sequence key={i} from={from} durationInFrames={duration + fade}>
						<Img
							src={staticFile(`image/${scene.image}.jpeg`)}
							style={{
								width: "100%",
								height: "100%",
								objectFit: "cover",
								transform: `translateX(${x}px) scale(${scale})`,
								opacity,
								filter: `contrast(1.08) saturate(1.06) blur(${blur}px)`,
							}}
						/>
					</Sequence>
				);
			})}

			{/* 🎞️ VIGNETTE */}
			<AbsoluteFill
				style={{
					background:
						"radial-gradient(circle at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)",
					pointerEvents: "none",
				}}
			/>

			{/* 🎥 FILM GRAIN */}
			<AbsoluteFill
				style={{
					backgroundImage:
						"url('https://grainy-gradients.vercel.app/noise.svg')",
					opacity: 0.04,
					mixBlendMode: "overlay",
					pointerEvents: "none",
				}}
			/>
		</>
	);
};

/* ---------------- CAPTIONS ---------------- */
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
		[
			msToFrames(currentWord.start),
			msToFrames(currentWord.start) + 5,
		],
		[0.92, 1],
		{ extrapolateRight: "clamp" }
	);

	return (
		<AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
			<div
				style={{
					textAlign: "center",
					fontSize: 35,
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
						color: "green",
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

/* ---------------- MAIN ---------------- */
export const MyComposition = () => {
	return (
		<AbsoluteFill style={{ backgroundColor: "black" }}>
			<Scenes />
			<Audio src={staticFile("audio/script.mp3")} />
			<Audio src={staticFile("audio/bgmusic.mp3")} volume={0.18} />
			<Captions />
		</AbsoluteFill>
	);
};
