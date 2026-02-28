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
import { generateScenes } from "../videoData/imagePromptData";

const FPS = 30;
const msToFrames = (ms) => Math.round((ms / 1000) * FPS);

const SCENES = generateScenes(subtitles);
console.log(SCENES)

/* ---------------- SCENES ---------------- */

const SceneImage = ({ sceneNumber, duration, mode }) => {
	const frame = useCurrentFrame();

	const progress = interpolate(
		frame,
		[0, duration],
		[0, 1],
		{ extrapolateRight: "clamp" }
	);

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

	// Pan left → right
	if (mode === 2) {
		x = interpolate(progress, [0, 1], [-16, 16], {
			easing: Easing.out(Easing.cubic),
		});
		scale = 1.04;
	}

	// Pan right → left
	if (mode === 3) {
		x = interpolate(progress, [0, 1], [16, -16], {
			easing: Easing.out(Easing.cubic),
		});
		scale = 1.04;
	}

	return (
		<Img
			src={staticFile(`/image/${sceneNumber}.jpg`)}
			style={{
				width: "100%",
				height: "100%",
				objectFit: "cover",
				transform: `translateX(${x}px) scale(${scale})`,
				filter: "contrast(1.05) saturate(1.04)",
			}}
		/>
	);
};

const Scenes = () => {
	return (
		<>
			{SCENES.map((scene, i) => {
				const startWord = subtitles[scene.fromWord];
				const endWord = subtitles[scene.toWord];

				if (!startWord || !endWord) return null;

				const startFrame = msToFrames(startWord.start);
				const endFrame = msToFrames(endWord.end);
				const duration = endFrame - startFrame;

				return (
					<Sequence
						key={i}
						from={startFrame}
						durationInFrames={duration}
					>
						<SceneImage
							sceneNumber={scene.scene}
							duration={duration}
							mode={i % 4}
						/>
					</Sequence>
				);
			})}
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
		<AbsoluteFill
			style={{
				justifyContent: "center",
				alignItems: "center",
			}}
		>
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

/* ---------------- MAIN ---------------- */

export const MyComposition = () => {
	return (
		<AbsoluteFill style={{ backgroundColor: "black" }}>
			<Scenes />
			<Audio src={staticFile("audio/script.mp3")} />
			<Audio src={staticFile("audio/bgmusic.mp3")} volume={0.2} />
			<Captions />
		</AbsoluteFill>
	);
};