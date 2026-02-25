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
	{ image: 27, fromWord: 217, toWord: 225 }
];

const SCENES = RAW_SCENES.map((s) => ({
	...s,
	fromWord: Math.min(s.fromWord, subtitles.length - 1),
	toWord: Math.min(s.toWord, subtitles.length - 1),
}));

/* ---------------- CONTINUOUS SCENES ---------------- */
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
					30
				);

				const overlap = 14;
				const from = cursor;
				cursor += duration - overlap;

				const local = frame - from;
				const progress = interpolate(
					local,
					[0, duration],
					[0, 1],
					{ extrapolateRight: "clamp" }
				);

				const mode = i % 4;
				let x = 0;
				let scale = 1;

				// Zoom in
				if (mode === 0) {
					scale = interpolate(progress, [0, 1], [1.02, 1.06], {
						easing: Easing.out(Easing.cubic),
					});
				}

				// Zoom out
				if (mode === 1) {
					scale = interpolate(progress, [0, 1], [1.06, 1.02], {
						easing: Easing.out(Easing.cubic),
					});
				}

				// Pan left → right (slow)
				if (mode === 2) {
					x = interpolate(progress, [0, 1], [-16, 16], {
						easing: Easing.out(Easing.cubic),
					});
					scale = 1.04;
				}

				// Pan right → left (slow)
				if (mode === 3) {
					x = interpolate(progress, [0, 1], [16, -16], {
						easing: Easing.out(Easing.cubic),
					});
					scale = 1.04;
				}

				const fade = overlap;
				const opacity = interpolate(
					local,
					[0, fade, duration - fade, duration],
					[0, 1, 1, 0],
					{ extrapolateRight: "clamp" }
				);

				return (
					<Sequence key={i} from={from} durationInFrames={duration}>
						<Img
							src={staticFile(`/image/${scene.image}.jpg`)}
							style={{
								width: "100%",
								height: "100%",
								objectFit: "cover",
								transform: `translateX(${x}px) scale(${scale})`,
								opacity,
								filter: "contrast(1.05) saturate(1.04)",
							}}
						/>
					</Sequence>
				);
			})}
		</>
	);
};

/* ---------------- CAPTIONS (UNCHANGED) ---------------- */
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
			<Audio src={staticFile("audio/script.mp3")} />
			<Audio src={staticFile("audio/bgmusic.mp3")} volume={0.18} />
			<Captions />
		</AbsoluteFill>
	);
};