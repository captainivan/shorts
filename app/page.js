"use client"
import { Player } from '@remotion/player';
import { MyComposition } from '@/remotion/Composition.jsx';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Player
        controls={true}
        component={MyComposition}
        durationInFrames={3300}
        compositionWidth={360}
        compositionHeight={640}
        fps={30}
        className='border border-2 border-white/50 rounded-xl'
      />
    </div>
  );
}
