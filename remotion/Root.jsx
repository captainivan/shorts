import { Composition, getInputProps } from "remotion";
import { MyComposition } from "./Composition.jsx";

const RemotionRoot = () => {
  const { durationInFrames, fps } = getInputProps();
  return (
    <>
      <Composition
        id="FinalVideo"
        component={MyComposition}
        durationInFrames={durationInFrames ?? 3000}
        fps={fps ?? 30}
        width={1080}
        height={1920}
      />
    </>
  );
};

export default RemotionRoot;
