import React from "react";
import { Composition } from "remotion";
import { MyComposition } from "./Composition.jsx";

const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="Empty"
        component={MyComposition}
        durationInFrames={2130}
        fps={30}
        width={360}
        height={640}
      />
    </>
  );
};

export default RemotionRoot;
