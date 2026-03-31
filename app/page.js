"use client"

import { MyComposition } from '@/remotion/Composition';
import { Player } from '@remotion/player';

export default function Home() {

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">

      <h1>Render Eternal Impact</h1>
      <Player
        component={MyComposition}
        durationInFrames={3000}
        compositionWidth={1080}
        compositionHeight={1920}
        fps={30}
        controls={true}
        className='border border-2 border-white '
      />
    </div>
  );
}
