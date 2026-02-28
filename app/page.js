"use client"
import { Player } from '@remotion/player';
import { MyComposition } from '@/remotion/Composition.jsx';
import subtitles from '@/subtitle/subtitle.json';
import { useState } from 'react';

export default function Home() {
  const [number, setNumber] = useState()
  const handleCheck = () => {
    console.log(number)
    console.log(subtitles[number])
  }
 
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Player
        controls={true}
        component={MyComposition}
        durationInFrames={1940}
        compositionWidth={1080}
        compositionHeight={1920}
        fps={30}
        className='border border-2 border-white/50 rounded-xl'
      />
      <div className='flex flex-col items-center justify-center gap-4 mt-4'>
        <input className='border border-2 border-white/50 p-2' type='number' onChange={(e) => { setNumber(e.target.value) }} />
        <button className='border border-2 border-white/50 p-2' onClick={handleCheck}>check</button>
      </div>

    </div>
  );
}
