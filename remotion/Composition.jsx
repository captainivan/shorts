import {
	AbsoluteFill,
	Audio,
	Img,
	Sequence,
	useCurrentFrame,
	interpolate,
	Easing,
} from "remotion";
import "./remotion.css";

import subtitles from "../subtitle/subtitle.json";
const FPS = 30;
const msToFrames = (ms) => Math.round((ms / 1000) * FPS);

/* ---------------- SCENES ---------------- */
const RAW_SCENES = [
	{ image: 1, fromWord: 0, toWord: 15 },
	{ image: 2, fromWord: 16, toWord: 29 },
	{ image: 3, fromWord: 30, toWord: 33 },
	{ image: 4, fromWord: 34, toWord: 41 },
	{ image: 5, fromWord: 42, toWord: 53 },
	{ image: 6, fromWord: 54, toWord: 60 },
	{ image: 7, fromWord: 61, toWord: 67 },
	{ image: 8, fromWord: 68, toWord: 75 },
	{ image: 9, fromWord: 76, toWord: 85 },
	{ image: 10, fromWord: 86, toWord: 93 },
	{ image: 11, fromWord: 94, toWord: 101 },
	{ image: 12, fromWord: 102, toWord: 108 },
	{ image: 13, fromWord: 109, toWord: 112 },
	{ image: 14, fromWord: 113, toWord: 123 },
	{ image: 15, fromWord: 124, toWord: 131 },
	{ image: 16, fromWord: 132, toWord: 137 },
	{ image: 17, fromWord: 138, toWord: 145 },
	{ image: 18, fromWord: 146, toWord: 152 },
	{ image: 19, fromWord: 153, toWord: 160 },
	{ image: 20, fromWord: 161, toWord: 168 },
	{ image: 21, fromWord: 169, toWord: 175 },
	{ image: 22, fromWord: 176, toWord: 185 },
	{ image: 23, fromWord: 186, toWord: 193 },
	{ image: 24, fromWord: 194, toWord: 201 },
	{ image: 25, fromWord: 202, toWord: 209 },
	{ image: 26, fromWord: 210, toWord: 216 },
	{ image: 27, fromWord: 217, toWord: 225 },
	{ image: 28, fromWord: 226, toWord: 234 },
	{ image: 29, fromWord: 235, toWord: 243 },
	{ image: 30, fromWord: 244, toWord: 251 },
	{ image: 31, fromWord: 252, toWord: 260 },
	{ image: 32, fromWord: 261, toWord: 272 },
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
							src={`/image/${scene.image}.jpeg`}
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

/* ---------------- MAIN ---------------- */
export const MyComposition = () => {
	return (
		<AbsoluteFill style={{ backgroundColor: "black" }}>
			<Scenes />
			<Audio src="/audio/script.mp3" />
			<Audio src="/audio/bgmusic.mp3" volume={0.18} />
			<Captions />
		</AbsoluteFill>
	);
};
