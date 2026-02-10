import React from 'react';
import { Composition } from 'remotion';
import { MyComposition } from './Composition.jsx';

export const RemotionRoot = () => {
    return (
        <>
            <Composition
                id="Empty"
                component={MyComposition}
                durationInFrames={3300}
                fps={30}
                width={360}
                height={640}
            />
        </>
    );
};